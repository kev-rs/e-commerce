import { useContext, useMemo } from 'react';
import NextLink from 'next/link';
import { Box, Button, Card, CardContent, Divider, Grid, Link, Typography } from '@mui/material'
import { ShopLayout, CartList, OrderSummary } from '../../components'
import { CartContext } from '../../context/cart/store';
import { trpc } from '../../utils/trpc';

const SummaryPage = () => {

  const { shippingAddress:info, numberOfItems } = useContext(CartContext);
  const { data, isSuccess, isLoading, isFetching } = trpc.countries.getAll.useQuery();
  const country = useMemo(() => data?.find((c) => c.code === info?.country)?.name, [ data, info?.country ])


  return (
    <ShopLayout title='Summary' pageInfo='Shopping cart summary'>
      <Typography variant='h1' component={'h1'}>Summary</Typography>

      <Grid container>
        <Grid item xs={12} sm={7}>
          <CartList />
        </Grid>
        <Grid item xs={12} sm={5}>
          <Card className='summary-card'>
            <CardContent>
              <Typography variant='h2'>Summary ({numberOfItems})</Typography>
              <Divider sx={{ my: 1 }} />

              <Box display={'flex'} justifyContent='space-between'>
                <Typography variant='subtitle1'>Delivery address</Typography>
                <NextLink href='/checkout/address' passHref>
                  <Link underline='always'>
                    Edit
                  </Link>
                </NextLink>
              </Box>

              <Typography>{info?.name} {info?.lastName}</Typography>
              <Typography>{info?.address} {info?.address2}</Typography>
              <Typography>{info?.city} {info?.postal}</Typography>
              <Typography>{country}</Typography>
              <Typography>{info?.phone}</Typography>

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
                <Button
                  color='secondary'
                  className='circular-btn'
                  fullWidth
                >Confirm Order</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ShopLayout>
  )
}

export default SummaryPage;
