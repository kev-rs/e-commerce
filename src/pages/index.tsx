import { useMemo, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import { ProductList, ShopLayout, Loading } from '../components';
import { Typography } from '@mui/material';
import { createProxySSGHelpers } from '@trpc/react/ssg';
import { GetStaticPropsContext } from 'next';
import { appRouter } from '../server/router/_app';
import { createContext } from '../server/context';
import superjson from 'superjson';

const Home: React.FC = () => {
  const { data, isLoading, isFetching } = trpc.products.getProducts.useQuery();

  const loading = useMemo(() => isLoading || isFetching, [ isFetching, isLoading ]);

  return (
    <ShopLayout title={'Tesla-Shop'} pageInfo={'Find the best products'}>
      <Typography variant='h1' component={'h1'}>Shop</Typography>
      <Typography variant='h2' sx={{ mb: 1 }}>All products</Typography>
      
      <ProductList products={data || []} loading={loading} />
    </ShopLayout>
  )
}

// export async function getStaticProps(ctx: GetStaticPropsContext) {

//   const ssg = await createProxySSGHelpers({
//     router: appRouter,
//     ctx: await createContext(),
//     transformer: superjson,
//   });

//   await ssg.products.getProducts.fetch()

//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//     }
//   }
// }

export default Home;
