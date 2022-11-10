import { useContext, useState, useEffect } from 'react';
import NextLink from 'next/link';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Link, Typography } from '@mui/material'
import { ShopLayout, CartList, OrderSummary } from '../../components'
import { CartContext } from '../../context/cart/store';
import { trpc } from '../../utils/trpc';
import { useRouter } from 'next/router';
import { LoadingButton } from '@mui/lab';
import { LoginOutlined } from '@mui/icons-material';

const SummaryPage = () => {
  const [ isPosting, setIsPosting ] = useState<boolean>(false);
  const router = useRouter();
  const { shippingAddress:info, numberOfItems, subTotal, taxes, total, cart, reset } = useContext(CartContext);
  const mutation = trpc.orders.add.useMutation({
    onSuccess: async ({ id, }) => {
      await router.push(`/orders/${id}`);
      reset();
      setIsPosting(false);
    },
    onError: (err) => {
      console.log({err});
      setIsPosting(false);
    },
    onMutate: () => {
      setIsPosting(true);
    }
  });

  const handleOrder = () => {
    setIsPosting(true);
    mutation.mutate({
      products: [...cart],
      shippingAddress: {...info!},
      numberOfItems,
      subTotal,
      tax: taxes,
      paidOut: false,
      total,
    }, {
      onError: console.log
    })
  }


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
              <Typography variant='h4'>Summary ({numberOfItems})</Typography>
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
              <Typography>{info?.country}</Typography>
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
                <LoadingButton
                  size="small"
                  color="secondary"
                  type='submit'
                  loading={isPosting}
                  loadingPosition="start"
                  startIcon={<LoginOutlined />}
                  variant="outlined"
                  onClick={handleOrder}
                >
                  Confirm order
                </LoadingButton>

                <Chip 
                  color='error'
                  label={mutation.error?.message}
                  sx={{ display: mutation.isError ? 'block' : 'none', mt: 2 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ShopLayout>
  )
}

export default SummaryPage;
