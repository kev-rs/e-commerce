import { prisma } from './client';
import z from 'zod';

const schema = z.object({
  description: z.string(),
  gender: z.enum(['kid', 'men', 'women', 'unisex']),
  images: z.string().array(),
  price: z.number(),
  sizes: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']).array(),
  title: z.string()
})

type Product = z.infer<typeof schema>

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  
  try {
    // await prisma.$connect();
    const product = await prisma.seedProduct.findUnique({ 
      where: { slug },
      select: {
        description: true, gender: true, images: true, price: true, sizes: true, title: true
      }
    });
    if(!product) return null;
    return product;
  } catch (err) {
    console.log(err)
    await prisma.$disconnect();
    process.exit(1);
  } finally {
    // await prisma.$disconnect();
  }
}

export const getAllProductSlugs = async (): Promise<{ slug: string }[]> => {
  try {
    // await prisma.$connect();
    const products = await prisma.seedProduct.findMany({ select: { slug: true } });
    return products;
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    process.exit(1);
  } finally {
    // await prisma.$disconnect();
  }
}