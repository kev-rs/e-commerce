import { Box, Button, Chip, Grid, Typography } from '@mui/material';
import type { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next';
import { ItemCounter, ShopLayout, ItemSize, ProductSlideshow } from '../../components';
import { prisma, SeedProduct } from '../../db';
import axios from 'axios';

const ProductPage: React.FC<{ product: SeedProduct }> = ({ product }) => {

  return (
    <ShopLayout title={product.title} pageInfo={product.description}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={7}>
          <ProductSlideshow images={product.images} />
        </Grid>
        <Grid item xs={12} sm={5}>
          <Box display='flex' flexDirection={'column'}>
            <Typography variant='h1' component={'h1'}>{product.title}</Typography>
            <Typography variant='subtitle1' component={'h2'}>${product.price}</Typography>

            <Box sx={{ my: 2 }}>
              <Typography variant='subtitle2'>Amount</Typography>
              <ItemCounter />
              <ItemSize selectedSize={'XL'} sizes={product.sizes} />
            </Box>

            {/* Add to cart */}
            <Button color='secondary' className='circular-btn'>Add to cart</Button>

            {/* <Chip label='No available' color='error' variant='outlined' /> */}

            {/* Info */}
            <Box sx={{ mt: 3 }}>
              <Typography variant='subtitle2'>Description</Typography>
              <Typography variant='body2'>{product.description}</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ShopLayout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {

  const products = await prisma.seedProduct.findMany({ select: { slug: true } });
  const paths = products.map(({ slug }) => ({ params: { slug } }));

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }: GetStaticPropsContext) => {
  const { slug } = params as { slug: string };

  const { data: produc } = await axios.get(`http://localhost:3000/api/products/${slug}`)
  console.log({axiosRes: produc});

  const product = await prisma.seedProduct.findUnique({ where: { slug } });

  if (!product) return {
    redirect: {
      destination: '/',
      permanent: false,
    }
  }

  return {
    props: { product }
  }
}

export default ProductPage;
