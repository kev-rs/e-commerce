import type { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { Box, Button, Card, CardContent, Divider, Grid, Typography } from '@mui/material'
import { ShopLayout, CartList, OrderSummary } from '../../components'

const Cart = () => {

  return (
    <ShopLayout title='Cart' pageInfo='Shopping cart'>
      <Typography variant='h1' component={'h1'}>Cart</Typography>

      <Grid container>
        <Grid item xs={12} sm={7}>
          <CartList editable />
        </Grid>
        <Grid item xs={12} sm={5}>
          <Card className='summary-card'>
            <CardContent>
              <Typography variant='h2'>Order</Typography>
              <Divider sx={{my: 1}} />

              <OrderSummary />

              <Box sx={{mt: 3}}>
                <Button
                  color='secondary'
                  className='circular-btn'
                  fullWidth
                >Checkout</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ShopLayout>
  )
}

export default Cart;