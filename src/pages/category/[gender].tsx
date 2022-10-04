import { Typography } from "@mui/material";
import { GetServerSideProps, GetServerSidePropsContext, GetStaticPaths, GetStaticProps, GetStaticPropsContext } from "next";
import { ProductList, ShopLayout } from "../../components"
import Loading from "../../components/ui/Loading";
import { useProduct } from '../../hooks/swr-hook';
// import { prisma, Gender } from '../../db';

const GenderPage: React.FC<{ gender: string }> = ({ gender }) => {

  const { products, isLoading } = useProduct(`/products?gender=${gender}`);

  return (
    <ShopLayout title={gender} pageInfo={`Category - ${gender}`}>
      <Typography variant='h1' component={'h1'}>Shop</Typography>
      <Typography variant='h2' sx={{ mb: 1 }}>All products - {gender}</Typography>

      {isLoading
        ? <Loading />
        : <ProductList products={products} />}
    </ShopLayout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {

  const paths: { params: { gender: string }}[] = [
    { params: { gender: 'kid' }},
    { params: { gender: 'women' }},
    { params: { gender: 'men' }},
  ]
  
  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async (ctx: GetStaticPropsContext) => {

  const { gender } = ctx.params as { gender: string };

  return {
    props: { gender }
  }
}

// ! Generate products from the server
// export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  
//   return {
//     props: { gender: ctx.query.gender }
//   }
// }

export default GenderPage;

