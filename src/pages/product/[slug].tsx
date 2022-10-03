import type { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next';
import { ShopLayout } from '../../components/layouts';
import { prisma, SeedProduct } from '../../db';

const ProductPage: React.FC<{ product: SeedProduct }> = ({ product }) => {

  console.log({product})

  return (
    <ShopLayout title={product.title} pageInfo={product.description}>

    </ShopLayout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {

  const products = await prisma.seedProduct.findMany();
  const paths = products.map(({ slug }) => ({ params: { slug }}));

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }: GetStaticPropsContext) => {
  const { slug } = params as { slug: string };

  const product = await prisma.seedProduct.findUnique({ where: { slug }});

  if(!product) return {
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
