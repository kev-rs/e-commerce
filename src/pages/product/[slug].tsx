import { useState, useContext } from 'react';
import type { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { createProxySSGHelpers } from '@trpc/react/ssg';
import { appRouter } from '../../server/router/_app';
import { createContext } from '../../server/context';
import { Box, Button, Chip, Grid, Skeleton, Typography } from '@mui/material';
import { ItemCounter, ShopLayout, ItemSize, ProductSlideshow } from '../../components';
import superjson from 'superjson';
import { ICart } from '../../interfaces';
import { ValidSizes, prisma } from '../../server/db';
import { CartContext } from '../../context/cart';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';

// const ProductPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ product: product_server }) => {
const ProductPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ product: product_server, slug }) => {
  
  const { data: product } = trpc.products.getProductBySlug.useQuery({ slug }, {
    initialData: product_server,
    refetchInterval: 6000,
    refetchOnReconnect: true,
  })
  
  const router = useRouter();
  const { addProduct } = useContext(CartContext);
  
  const [ cartProduct, setCartProduct ] = useState<ICart>({
    id: product!.id,
    image: product!.images[0],
    inStock: product!.inStock,
    price: product!.price,
    size: undefined,
    slug: product!.slug,
    title: product!.title,
    gender: product!.gender,
    amount: 1,
  });

  const handleSize = (size: ValidSizes) => {
    setCartProduct(product => ({ ...product, size }));
  }

  const handleAmount = (amount: number, maxValue: number) => {
    setCartProduct(product => ({ ...product, amount: Math.min(Math.max(cartProduct.amount + amount, 1), maxValue > 0 ? maxValue : 7) }));
  }

  const handleAdd = () => {
    if (!cartProduct.size) return;
    addProduct({ ...cartProduct });
    router.push('/cart');
  }

  const handleBuy = () => {
    if (!cartProduct.size) return;
    addProduct({ ...cartProduct });
    router.push('/checkout/address');
  }

  return (
    <ShopLayout title={product?.title || 'product title'} pageInfo={product?.description || 'product info'}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={7}>
          {!product
            ? <Skeleton sx={{ height: 300 }} animation="wave" variant="rectangular" />
            : <ProductSlideshow images={product.images} />}
        </Grid>
        <Grid item xs={12} sm={5}>
          <Box display='flex' flexDirection={'column'}>
            {!product
              ? (
                <>
                  <Skeleton animation="wave" variant="text" width='70%' />
                  <Skeleton animation="wave" variant="text" width='10%' />
                </>
              )
              : (
                <>
                  <Typography variant='h1' component={'h1'}>{product.title}</Typography>
                  <Typography variant='subtitle1' component={'h2'}>${product.price}</Typography>
                </>
              )}


            <Box sx={{ my: 2 }}>
              <Typography variant='subtitle2'>Amount</Typography>
              <ItemCounter amount={cartProduct.amount} handleAmount={handleAmount} maxValue={cartProduct.inStock} />
              {!product
                ? <Skeleton animation="wave" variant="text" width='40%' />
                : <ItemSize selectedSize={cartProduct.size} sizes={product.sizes} handleSize={handleSize} />}
            </Box>

            {
              !product ? <Skeleton animation="wave" variant="text" width='40%' />
                : product.inStock > 0
                  ? (
                    <>
                      <Button color='secondary' className='circular-btn' onClick={handleAdd} sx={{marginBottom: 2}}>
                        {cartProduct.size ? 'Add to cart' : 'Select a size'}
                      </Button>
                      <Button color='error' className='circular-btn' onClick={handleBuy} disabled={!cartProduct.size}>
                        By Now
                      </Button>
                    </>
                  )
                  : (
                    <Chip label='Sold out' color='error' variant='outlined' />
                  )
            }

            <Box sx={{ mt: 3 }}>
              {!product
                ? (
                  <>
                    <Skeleton animation="wave" variant="text" width='70%' />
                    <Skeleton animation="wave" variant="text" width='10%' />
                  </>
                )
                : (
                  <>
                    <Typography variant='subtitle2'>Description</Typography>
                    <Typography variant='body2'>{product.description}</Typography>
                  </>
                )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ShopLayout>
  )
}

// export const getStaticPaths: GetStaticPaths = async () => {

//   const products = await prisma.seedProduct.findMany({
//     select: { slug: true }
//   })

//   const paths = products.map(({ slug }) => ({ params: { slug } }));

//   return {
//     paths,
//     fallback: 'blocking'
//   }
// }

// export async function getStaticProps({ params }: GetStaticPropsContext<{ slug: string }>) {
export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  });

  const product = await ssg.products.getProductBySlug.fetch({ slug: ctx.query.slug as string });
  
  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug: ctx.query.slug as string,
      product,
    },
  }
}

export default ProductPage;
