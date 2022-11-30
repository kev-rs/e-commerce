import { trpc } from "../trpc";
import { z } from 'zod';
import { prisma, type Order as OrderDB, type Product } from '../db';
import { TRPCError } from '@trpc/server';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-08-01', typescript: true });

type Order = OrderDB & { products: Product[] }

export const ordersRouter = trpc.router({
  get: trpc.procedure
    .input(z.object({
      id: z.string().min(1, 'Required')
    }))
    .query( async ({ ctx, input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.id },
        select: {
          id: true, numberOfItems: true, paidOut: true, products: true, shippingAddress: true, subTotal: true, tax: true, total: true, userId: true, user: { select: { email: true, name: true } }, shippingAddressId: true, paidAt: true, paymentResult: true, customer: true
        },
      });

      return order;
    }),
  getAll: trpc.procedure
    .input(z.object({ email: z.string().min(1, 'Required') }))
    .query( async ({ input }) => {
      const user = await prisma.user.findUnique({ 
        where: { email: input.email }, 
        select: { 
          orders: {
            select: {
              id: true, numberOfItems: true, paidOut: true, products: true, shippingAddress: true, subTotal: true, tax: true, total: true, userId: true, user: { select: { email: true, name: true } }, shippingAddressId: true
            }
          } 
        } 
      })
      return user;
    }
  ),
  add: trpc.procedure
    .input(z.object({
      products: z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]).optional(),
        amount: z.number(),
        slug: z.string().min(1),
        image: z.string().min(1),
        price: z.number().default(0),
      }).array(),
      shippingAddress: z.object({
        name: z.string().min(1),
        lastName: z.string().min(1),
        address: z.string().min(1),
        address2: z.string(),
        postal: z.string().min(1),
        city: z.string().min(1),
        country: z.string().min(1),
        country_code: z.string().min(1).default('US'),
        phone: z.string().min(1)
      }),
      numberOfItems: z.number(),
      subTotal: z.number(),
      tax: z.number(),
      total: z.number(),
      paidOut: z.boolean().default(false)
    }))
    .mutation( async ({ ctx, input }) => {
      const { products, total } = input;

      // create an array with all the products the user wants;
      const productsIds = input.products.map(product => product.id);

      const dbProducts = await prisma.seedProduct.findMany({
        where: { id: { in: productsIds } }
      });

      const subTotal = products.reduce((prev, current) =>{
        const currentPrice = dbProducts.find((p) => p.id === current.id)?.price;
        if(!currentPrice) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found, check the cart' });
        return  (currentPrice * current.amount) + prev;
      }, 0);

      const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0);
      const serverTotal = (subTotal * taxRate) + subTotal;

      if( total !== serverTotal ) throw new TRPCError({ code: 'BAD_REQUEST', message: 'The total from the server is different from the client' });

      if(!ctx.session?.user?.email) throw new TRPCError({ code: 'UNAUTHORIZED' });
      const email = ctx.session.user.email;
      const order = await prisma.order.create({
        data: {
          ...input,
          tax: taxRate,
          shippingAddress: {
            create: {...input.shippingAddress},
          },
          paidOut: false,
          total: Math.round(serverTotal * 100) / 100,
          products: { create: products.map(({ id, ...rest }) => rest) },
          user: { connect: { email } }
        },
        select: {
          id: true, numberOfItems: true, paidOut: true, products: true, shippingAddress: true, subTotal: true, tax: true, total: true, userId: true, user: { select: { email: true, name: true, id: true } }, paidAt: true, paymentResult:true, shippingAddressId: true
        }
      });
      if(!order) throw new TRPCError({ code: 'NOT_FOUND' });
      if(!order.shippingAddress) throw new TRPCError({ code: 'NOT_FOUND' });
      if(!(order.shippingAddress['phone']) || !(order.shippingAddress['address']) || !(order.shippingAddress['city']) || !(order.shippingAddress['country']) || !(order.shippingAddress['name']) || !(order.shippingAddress['phone']) || !(order.shippingAddress['postal']) || !(order.shippingAddress['country_code'])) throw new TRPCError({ code: 'NOT_FOUND' });
      // if(!order.tax) throw new TRPCError({ code: 'NOT_FOUND' }); 
      const customer = await stripe.customers.create({
        email: order.user.email,
        name: order.shippingAddress.name,
        phone: order.shippingAddress.phone,
        address: {
          city: order.shippingAddress.city,
          country: order.shippingAddress.country_code,
          line1: order.shippingAddress.address,
          line2: order.shippingAddress.address2 || '',
          postal_code: order.shippingAddress.postal,
          state: order.shippingAddress.city,
        },
        shipping: {
          address: {
            city: order.shippingAddress.city,
            country: order.shippingAddress.country_code,
            line1: order.shippingAddress.address,
            line2: order.shippingAddress.address2 || '',
            postal_code: order.shippingAddress.postal,
            state: order.shippingAddress.city,
          },
          name: order.shippingAddress.name,
          phone: order.shippingAddress.phone,
        },
        metadata: {
          order_id: order.id,
          user_id: order.userId,
        },
      })

      const order_ = await prisma.order.update({
        where: {
          id: order.id
        },
        data: {
          customer: {
            create: {
              cuid: customer.id,
              address: customer.address,
              email: customer.email,
              metadata: customer.metadata,
              name: customer.name,
              phone: customer.phone,
              shipping: customer.shipping,
            },
          },
        },
        select: {
          id: true, numberOfItems: true, paidOut: true, products: true, shippingAddress: true, subTotal: true, tax: true, total: true, userId: true, user: { select: { email: true, name: true, id: true } }, paidAt: true, paymentResult:true, shippingAddressId: true, customer: true,
        }
      });
      
      return order_;
    }),
  update: trpc.procedure
    .input(z.object({
      session_id: z.string()
    }))
    .query( async ({ input, ctx }) => {
      // const session = await stripe.checkout.sessions.retrieve(String(req.query.session_id));
      const session = await stripe.checkout.sessions.retrieve(String(input.session_id));
      const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;

      if(customer.metadata.user_id !== ctx.session?.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });

      if(session.payment_status !== 'paid' || session.status !== 'complete') throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Payment failed' });

      const check_order = await prisma.order.findUnique({ where: { id: customer.metadata.order_id } });
      if(!check_order) throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });

      if(check_order.total !== (session.amount_total! / 100)) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Payment subtotal are not the same' });

      if(session.payment_status === 'paid') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Order is already paid' });
      
      const order = await prisma.order.update({
        where: {
          id: customer.metadata.order_id,
        },
        data: {
          user: {
            connect: {
              id: customer.metadata.user_id
            }
          },
          paidOut: session.payment_status === 'paid',
          transactionId: session.id,
        }
      });

      return order
  })
});
