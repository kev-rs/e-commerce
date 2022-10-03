import { useEffect } from 'react';
import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { Typography } from '@mui/material';
import { prisma, SeedProduct } from '../db';
import { ProductList, ShopLayout } from '../components';

const Home: NextPage<{ data: SeedProduct[] }> = ({ data }) => {

  return (
    <ShopLayout title={'Tesla-Shop'} pageInfo={'Find the best products'}>
      <Typography variant='h1' component={'h1'}>Shop</Typography>
      <Typography variant='h2' sx={{ mb: 1}}>All products</Typography>

      <ProductList products={data} />
    </ShopLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {

  const data = await prisma.seedProduct.findMany();

  return {
    props: { data }
  }
}

export default Home;
