import { trpc } from "../trpc";
import { z } from 'zod';
import { prisma } from '../db';
import { TRPCError } from '@trpc/server';

const isAuthed = trpc.middleware(({ next, ctx }) => {
  if(!ctx.session?.user?.email) throw new TRPCError({ code: 'UNAUTHORIZED' });

  return next({
    ctx: {
      session: ctx.session
    },
  })
});

const protectedProcedure = trpc.procedure.use(isAuthed);

export const ordersRouter = trpc.router({
  get: trpc.procedure
    .input(z.object({
      id: z.string().min(1, 'Required')
    }))
    .query( async ({ ctx, input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.id },
      })
      return order;
    }),
  add: trpc.procedure
    .input(z.object({
      products: z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]).optional(),
        amount: z.number(),
        slug: z.string().min(1),
        image: z.string().min(1),
        price: z.number(),
      }).array(),
      shippingAddress: z.object({
        name: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        address: z.string().min(1).optional(),
        address2: z.string().optional().optional(),
        postal: z.string().min(1).optional(),
        city: z.string().min(1).optional(),
        country: z.string().min(1).optional(),
        phone: z.string().min(1).optional()
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
      })

      const subTotal = products.reduce((prev, current) =>{
        const currentPrice = dbProducts.find((p) => p.id === current.id)?.price;
        if(!currentPrice) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found, check the cart' });
        return  (currentPrice * current.amount) + prev;
      }, 0);

      const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0);
      const serverTotal = (subTotal * taxRate) + subTotal;

      if( total !== serverTotal ) throw new TRPCError({ code: 'BAD_REQUEST', message: 'The total from the server is different from the client' })

      if(!ctx.session?.user?.email) throw new TRPCError({ code: 'UNAUTHORIZED' });
      const email = ctx.session.user.email;
      console.log({email});

      // await prisma.product.deleteMany();
      // await prisma.order.deleteMany();
      await prisma.user.update({
        where: { email },
        data: {
          orders: {
            create: [
                {
                  ...input,
                  paidOut: false,
                  products: { 
                    
                    // createMany: {
                    //   data: [...products]
                    // }
                    create: [...products]
                  }
                },
              ]
          },
      }
      })
      // const order = await prisma.order.create({
      //   data: {
      //     ...input,
      //     paidOut: false,
      //     products: { create: [...input.products] },
      //     user: {
      //       connect: {
      //         email
      //       },
      //     }
      //   },
      // })

      const order = await prisma.order.findFirst({ where: { user: { email } } });
      if(!order) throw new TRPCError({ code: 'NOT_FOUND' });
      return order;
    }),
})
