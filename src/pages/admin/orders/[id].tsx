import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { Box, Card, CardContent, Chip, Divider, Grid, Typography } from '@mui/material'
import { CartList, OrderSummary, AdminLayout } from '../../../components'
import { AdminPanelSettingsOutlined, CreditCardOffOutlined, CreditScoreOutlined, ShoppingCart } from '@mui/icons-material';
import { createProxySSGHelpers } from '@trpc/react/ssg';
import { appRouter } from '../../../server/router/_app';
import { createContext } from '../../../server/context';
import superjson from 'superjson';
import { ObjectId } from 'mongodb';

const OrderPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ order }) => {
  return (
    <AdminLayout title='Summary order' subTitle={`Order: ${order.id}`} icon={<AdminPanelSettingsOutlined />}>
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
                      <Chip
                        sx={{ my: 2, flex: 1 }}
                        label='Pending'
                        variant='outlined'
                        color='error'
                        icon={<CreditScoreOutlined />}                        
                      />
                    )
                }
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AdminLayout>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const id = ctx.query.id as string;
  if (!id) return { redirect: { destination: '/admin/orders', permanent: false } };
  if (!ObjectId.isValid(id)) return { redirect: { destination: '/admin/orders', permanent: false } };

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext({ req: ctx.req as any, res: ctx.res as any }),
    transformer: superjson,
  });

  const order = await ssg.orders.get.fetch({ id });

  if (!order) return { redirect: { destination: '/admin/orders', permanent: false } };
  
  return {
    props: {
      trpcState: ssg.dehydrate(),
      order,
    }
  }
}

export default OrderPage;
