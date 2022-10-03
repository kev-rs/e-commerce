import { Box, Button, Card, CardContent, Divider, Grid, Link, Typography } from '@mui/material'
import { ShopLayout, CartList, OrderSummary } from '../../components'
import NextLink from 'next/link';

const SummaryPage = () => {
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
              <Typography variant='h2'>Summary (3 products)</Typography>
              <Divider sx={{ my: 1 }} />

              <Box display={'flex'} justifyContent='space-between'>
                <Typography variant='subtitle1'>Delivery address</Typography>
                <NextLink href='/checkout/address' passHref>
                  <Link underline='always'>
                    Edit
                  </Link>
                </NextLink>
              </Box>

              <Typography>Kev BS</Typography>
              <Typography>342 City land</Typography>
              <Typography>Stittsville, HYA 23S</Typography>
              <Typography>Canada</Typography>
              <Typography>+1 864 23423 432</Typography>

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
