import { useState } from 'react';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { Box, Card, CardContent, Chip, Divider, Grid, Typography } from '@mui/material'
import { ShopLayout, CartList, OrderSummary } from '../../components'
import { CreditCardOffOutlined, CreditScoreOutlined, ShoppingCart } from '@mui/icons-material';
import { createProxySSGHelpers } from '@trpc/react/ssg';
import { appRouter } from '../../server/router/_app';
import { createContext } from '../../server/context';
import superjson from 'superjson';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { ObjectId } from 'mongodb';
import { loadStripe } from '@stripe/stripe-js'
import { LoadingButton } from '@mui/lab';
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  apiVersion: '2022-08-01'
});


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const OrderPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ order, cuid, customer }) => {

  const [ loading, setLoading ] = useState<boolean>(false);
  
  const handlePay = async () => {
    try {
      setLoading( true );
      const stripe = await stripePromise;
      const res = await fetch(`/api/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order, customer }),
      })
  
      const data = await res.json();
      const stripeCheck = await stripe?.redirectToCheckout({ sessionId: data.id })
      if(stripeCheck?.error) {
        console.log({error: stripeCheck?.error});
      }
      setLoading(false);
    } catch (err) {
      console.log({err})
    }
  }

  return (
    <ShopLayout title='Summary order' pageInfo='Shopping cart summary'>
      <Typography variant='h1' component={'h1'}>Order: {order.id}</Typography>

      {
        !order.paidOut
          ? (
            <Chip
              sx={{ my: 2 }}
              label='Pending payment'
              variant='outlined'
              color='error'
              icon={<CreditCardOffOutlined />}
            />
          )
          : (
            <Chip
              sx={{ my: 2 }}
              label='Paid out'
              variant='outlined'
              color='success'
              icon={<CreditScoreOutlined />}
            />
          )
      }

      <Grid container className='fadeIn'>
        <Grid item xs={12} sm={7}>
          <CartList order={order} />
        </Grid>
        <Grid item xs={12} sm={5}>
          <Card className='summary-card'>
            <CardContent>
              <Typography variant='h2'>Summary ({order?.numberOfItems})</Typography>
              <Divider sx={{ my: 1 }} />

              <Box display={'flex'} justifyContent='space-between'>
                <Typography variant='subtitle1'>Delivery address</Typography>
              </Box>

              <Typography>{order?.shippingAddress?.name} {order?.shippingAddress?.lastName}</Typography>
              <Typography>{order?.shippingAddress?.address} {order?.shippingAddress?.address2}</Typography>
              <Typography>{order?.shippingAddress?.city} {order?.shippingAddress?.postal}</Typography>
              <Typography>{order?.shippingAddress?.country}</Typography>
              <Typography>{order?.shippingAddress?.phone}</Typography>

              <Divider sx={{ my: 1 }} />

              <OrderSummary order={order} />

              <Box sx={{ mt: 3, display: 'flex' }}>
                {/* TODO */}
                {
                  order.paidOut
                    ? (
                      <Chip
                        sx={{ my: 2, flex: 1 }}
                        label='Paid out'
                        variant='outlined'
                        color='success'
                        icon={<CreditScoreOutlined />}                        
                      />
                    )
                    : (                      
                      <LoadingButton
                        size="small"
                        color="primary"
                        loading={loading}
                        loadingPosition="center"
                        endIcon={<ShoppingCart />}
                        variant="contained"
                        fullWidth
                        sx={{":hover": { backgroundColor: 'black' }}}
                        onClick={handlePay}
                      >
                        Pay
                      </LoadingButton>
                    )
                }
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ShopLayout>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const id = ctx.query.id as string;
  if (!id) return { redirect: { destination: '/orders/history', permanent: false } };
  if (!ObjectId.isValid(id)) return { redirect: { destination: '/orders/history', permanent: false } };

  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!session) return { redirect: { destination: `/auth/login?p=/orders/${id}`, permanent: false } };

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext({ req: ctx.req as any, res: ctx.res as any }),
    transformer: superjson,
  });

  const order = await ssg.orders.get.fetch({ id });
  if (!order) return { redirect: { destination: '/orders/history', permanent: false } };
  if (!order.customer) return { redirect: { destination: '/orders/history', permanent: false } };
  if (order.userId !== session.user!.id) return { redirect: { destination: '/orders/history', permanent: false } };

  // const customers = await stripe.customers.list();
  // customers.data.forEach(async ({ id }) => await stripe.customers.del(id));
  // console.log({customers: customers.data})
  const customer = await stripe.customers.retrieve(order.customer.cuid as string);
  return {
    props: {
      trpcState: ssg.dehydrate(),
      order,
      customer,
    }
  }
}

export default OrderPage;
