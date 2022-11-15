import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma, Order as OrderDB, Product } from '../../server/db';
import Stripe from 'stripe';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { getToken } from 'next-auth/jwt';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  apiVersion: '2022-08-01',
});

type Order = OrderDB & { products: Product[], user: { email: string; name: string } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
  
  if(req.method === 'POST') {
    const auth_session = await getServerSession(req, res, authOptions);
    if(!auth_session) return res.status(401).json({ message: 'UNAUTHORIZED' });
    const { order, customer } = req.body as { order: Order, customer: Stripe.Customer };
    if(customer.metadata.user_id !== auth_session.user?.id) return res.status(401).json({ message: 'UNAUTHORIZED' });
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        customer_update: {
          shipping: 'never', address: 'never', name: 'never'
        },
        currency: 'usd',
        submit_type: 'pay',
        mode: 'payment',
        payment_method_types: ['card'],
        // billing_address_collection: 'auto',
        // shipping_address_collection: {
        //   allowed_countries: ['US', 'CA', 'AR', 'MX'],
        // },
        // client_reference_id: `${customer.id}`,
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 0,
                currency: 'usd'
              },
              display_name: 'Free shipping',
              delivery_estimate: {
                minimum: {
                  unit: 'day',
                  value: 5,
                },
                maximum: {
                  unit: 'day',
                  value: 7,
                }
              }
            }
          },
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 1500,
                currency: 'usd',
              },
              display_name: 'Next day air',
              delivery_estimate: {
                minimum: {
                  unit: 'day',
                  value: 1,
                },
                maximum: {
                  unit: 'day',
                  value: 1,
                }
              }
            }
          },
        ],
        line_items: order.products.map((item) => {
          return {
           price_data: {
             currency: 'usd',
             product_data: {
               name: item.title,
               images: [item.image],
             },
             unit_amount: ( (item.price * order.tax) + item.price ) * 100,
           },
           adjustable_quantity: { enabled: false },
           quantity: item.amount,
        }}),
        // automatic_tax: { enabled: true },
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
      });
      console.log('[API] - POST', req.headers);
      console.log('[API] - POST', req.headers.origin);
      res.status(200).json(session);
    } catch (err: any) {
      console.log({err});
      res.status(err.statusCode || 500).json({ message: err.message });
    }
  } else if(req.method === 'GET') {
    console.log('[API] - GET', req.headers);
    console.log('[API] - GET', req.headers.origin);
    const session = await stripe.checkout.sessions.retrieve(String(req.query.session_id));
    const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;

    if(customer.metadata.user_id !== req.query.auth) return res.status(401).json({ message: 'UNAUTHORIZEDssss' });

    if(session.payment_status !== 'paid' || session.status !== 'complete') {
      return res.status(400).json({ message: 'Payment - Error' });
    }

    const check_order = await prisma.order.findUnique({ where: { id: customer.metadata.order_id } });
    if(!check_order) return res.status(404).json({ message: 'Order not found' });
    if(check_order.total !== (session.amount_subtotal! / 100)) return res.status(400).json({ message: 'Payment subtotal are not the same' });

    // if(session.payment_status === 'paid') {
    //   return res.status(400).json({ message: 'Order is already paid' })
    // };
    
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
        total: session.amount_total! / 100
      },
    })

    res.status(200).json({ session, customer, order });
  }
}
