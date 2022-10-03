import { ArrowBack, RemoveShoppingCartOutlined } from "@mui/icons-material"
import { Box, Link, Typography } from "@mui/material"
import { ShopLayout } from "../../components"
import NextLink from 'next/link';

const EmptyPage = () => {
  return (
    <ShopLayout title="Cart" pageInfo="There are any product in cart">
      <Box
        display={'flex'}
        justifyContent='center'
        alignItems={'center'}
        height='calc(100vh - 200px)'
        sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
      >
        <RemoveShoppingCartOutlined sx={{fontSize: 100}} />
        <Box display={'flex'} flexDirection='column' alignItems={'center'}>
          <Typography>Your cart is empty</Typography>
          <NextLink href='/' passHref>
            <Link typography={'h4'} color='secondary'>
              <ArrowBack className="back-ico" color='primary' />
              Go back
            </Link>
          </NextLink>
        </Box>
      </Box>
    </ShopLayout>
  )
}

export default EmptyPage