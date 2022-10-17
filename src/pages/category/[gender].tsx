import { useMemo } from 'react';
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { trpc } from "../../utils/trpc";
import { Gender } from '../../server/db'
import { ProductList, ShopLayout } from "../../components"
import { Typography } from "@mui/material";
import { createProxySSGHelpers } from '@trpc/react/ssg';
import { appRouter } from '../../server/router/_app';
import superjson from 'superjson';
import { createContext } from "../../server/context";

const GenderPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ gender }) => {
// const GenderPage: React.FC<{ gender: 'men' | 'women' | 'kid' }> = ({ gender = 'women' }) => {
  const { data, isLoading, isFetching } = trpc.products.getProducts.useQuery(gender, {
    // refetchOnMount: false
  });

  const loading = useMemo(() => isLoading || isFetching, [isLoading, isFetching]);

  return (
    <ShopLayout title={gender} pageInfo={`Category - ${gender}`}>
      <Typography variant='h1' component={'h1'}>Shop</Typography>
      <Typography variant='h2' sx={{ mb: 1 }}>All products - {gender}</Typography>

      <ProductList products={data || []} loading={loading} />
    </ShopLayout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {

  const paths: { params: { gender: string } }[] = [
    { params: { gender: 'kid' } },
    { params: { gender: 'women' } },
    { params: { gender: 'men' } },
  ]

  return {
    paths,
    fallback: 'blocking'
  }
}

export async function getStaticProps(ctx: GetStaticPropsContext<{ gender: Gender }>) {

  const ssg = await createProxySSGHelpers({
    queryClientConfig: {
      defaultOptions: {
        queries: {
          staleTime: 4 * 10000,
          refetchOnMount: false, 
        },
      }
    },
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson, // optional - adds superjson serialization
  });
  const gender = ctx.params?.gender as Gender;
  await ssg.products.getProducts.prefetch(gender);

  return {
    props: {
      trpcState: ssg.dehydrate(),
      gender,
      // products,
    }
  }
}

export default GenderPage;

