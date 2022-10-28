import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Link, Typography } from '@mui/material'
import { ShopLayout, CartList, OrderSummary } from '../../components'
import NextLink from 'next/link';
import { CreditCardOffOutlined, CreditScoreOutlined } from '@mui/icons-material';
import { createProxySSGHelpers } from '@trpc/react/ssg';
import { appRouter } from '../../server/router/_app';
import { createContext } from '../../server/context';
import superjson from 'superjson';

const OrderPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ order }) => {

  console.log({order})

  return (
    <ShopLayout title='Payout summary order - 23SF12Vb' pageInfo='Shopping cart summary'>
      <Typography variant='h1' component={'h1'}>Summary</Typography>

      {/* <Chip
        sx={{ my: 2 }}
        label='Pending payment'
        variant='outlined'
        color='error'
        icon={<CreditCardOffOutlined />}
      /> */}

      <Chip
        sx={{ my: 2 }}
        label='Paid out'
        variant='outlined'
        color='success'
        icon={<CreditScoreOutlined />}
      />

      <Grid container>
        <Grid item xs={12} sm={7}>
          <CartList />
        </Grid>
        <Grid item xs={12} sm={5}>
          <Card className='summary-card'>
            <CardContent>
              <Typography variant='h2'>Summary ({order?.numberOfItems})</Typography>
              <Divider sx={{ my: 1 }} />

              <Box display={'flex'} justifyContent='space-between'>
                <Typography variant='subtitle1'>Delivery address</Typography>
                <NextLink href='/checkout/address' passHref>
                  <Link underline='always'>
                    Edit
                  </Link>
                </NextLink>
              </Box>

              <Typography>{order?.shippingAddress?.name} {order?.shippingAddress?.lastName}</Typography>
              <Typography>{order?.shippingAddress?.address} {order?.shippingAddress?.address2}</Typography>
              <Typography>{order?.shippingAddress?.city} {order?.shippingAddress?.postal}</Typography>
              <Typography>{order?.shippingAddress?.country}</Typography>
              <Typography>{order?.shippingAddress?.phone}</Typography>

              <Divider sx={{ my: 1 }} />

              <Box display={'flex'} justifyContent='end'>
                <NextLink href='/cart' passHref>
                  <Link underline='always'>
                    Edit
                  </Link>
                </NextLink>
              </Box>

              <OrderSummary />

              <Box sx={{ mt: 3 }}>
                {/* TODO */}
                <h1>Pay</h1>

                <Chip
                  sx={{ my: 2 }}
                  label='Paid out'
                  variant='outlined'
                  color='success'
                  icon={<CreditScoreOutlined />}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ShopLayout>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext<{ id: string }>) => {

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
    // queryClientConfig: {
    //   defaultOptions: {
    //     queries: {
    //       // refetchOnReconnect: false
    //     }
    //   }
    // }
  });
  
  const id = ctx.params?.id as string;
  console.log({idasd: id})

  // if(!id) return { redirect: { destination: '/', permanent: false } };

  const order = await ssg.orders.get.fetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      order,
    }
  }
}

export default OrderPage;
