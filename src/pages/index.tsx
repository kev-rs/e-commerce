import { Typography } from '@mui/material';
import { ProductList, ShopLayout } from '../components';
import Loading from '../components/ui/Loading';
import { SeedProduct } from '../db';
import { useProduct } from '../hooks';
// import type { GetStaticProps, GetStaticPropsContext } from 'next';
// import axios from 'axios';



const Home: React.FC<{ data: SeedProduct[] }> = ({ data: data1 }) => {

  const { products, isLoading } = useProduct('/products');

  return (
    <ShopLayout title={'Tesla-Shop'} pageInfo={'Find the best products'}>
      <Typography variant='h1' component={'h1'}>Shop</Typography>
      <Typography variant='h2' sx={{ mb: 1 }}>All products</Typography>

      {isLoading
        ? <Loading />
        : <ProductList products={products} />}
    </ShopLayout>
  )
}

// export const getStaticProps: GetStaticProps = async (ctx: GetStaticPropsContext) => {

//   const { data } = await axios.get('http://localhost:3000/api/products');

//   return {
//     props: { data }
//   }
// }

export default Home;
