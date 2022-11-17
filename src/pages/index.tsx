import { useMemo, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import { ProductList, ShopLayout, Loading } from '../components';
import { Typography } from '@mui/material';
import axios from 'axios';

const Home: React.FC = () => {
  const { data, isLoading, isFetching } = trpc.products.getProducts.useQuery(undefined, {
    refetchOnMount: true, refetchOnReconnect: true, refetchOnWindowFocus: true
  });

  const loading = useMemo(() => isLoading || isFetching, [ isFetching, isLoading ]);

  return (
    <ShopLayout title={'Tesla-Shop'} pageInfo={'Find the best products'}>
      <Typography variant='h1' component={'h1'}>Shop</Typography>
      <Typography variant='h2' sx={{ mb: 1 }}>All products</Typography>
      
      <ProductList products={data || []} loading={loading} />
    </ShopLayout>
  )
}

export default Home;
