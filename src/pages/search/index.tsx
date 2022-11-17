import { useMemo } from 'react';
import type { GetServerSidePropsContext, InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { Box, Typography } from '@mui/material';
import { ProductList, ShopLayout } from '../../components';
import { trpc } from '../../utils/trpc';
import { createProxySSGHelpers } from '@trpc/react/ssg';
import { appRouter } from '../../server/router/_app';
import { createContext } from '../../server/context';
import superjson from 'superjson';

const Search: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ query }) => {
  const { data, isLoading, isFetching } = trpc.products.search.useQuery({ query });

  const loading = useMemo(() => isLoading || isFetching, [ isLoading, isFetching ]);
  
  if (data?.notFound) {
    return (
      <ShopLayout title='Search' pageInfo='Find the best products'>
        <Typography variant='h1' component='h1'>Search</Typography>

        <Box display='flex'>
          <Typography variant='h2' sx={{ mb: 1 }}>No product found</Typography>
          <Typography variant='h2' sx={{ ml: 1 }} color='secondary' textTransform='capitalize'>{query}</Typography>
        </Box>

        <ProductList products={data.res} loading={loading} />
      </ShopLayout>
    )
  }

  return (
    <ShopLayout title={'Search'} pageInfo={'Find the best products'}>
      <Typography variant='h1' component={'h1'}>Search</Typography>
      <Typography variant='h2' sx={{ mb: 1 }} textTransform='capitalize'>Results: {query}</Typography>

      <ProductList products={data?.res || []} loading={loading} />
    </ShopLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext<{ query?: string }>) => {

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  });
  
  const query = ctx.query.q as string

  if(!query) return { redirect: { destination: '/', permanent: false } };

  await ssg.products.search.prefetch({ query });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      query,
    }
  }
}

export default Search;
