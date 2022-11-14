import { trpc } from '../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const defaultSelect = Prisma.validator<Prisma.SeedProductSelect>()({
  title: true, images: true, price: true, inStock: true, slug: true, gender: true, description: true, sizes: true, id: true,
});

export const productsRouter = trpc.router({
  getProducts: trpc.procedure
    .input(z.enum(['kid', 'men', 'women', 'unisex']).optional())
    .query(async ({ input, ctx }) => {
      const products = await prisma.seedProduct.findMany({
        where: {
          gender: z.enum(['kid', 'men', 'women', 'unisex']).safeParse(input).success ? input : {}
        },
        select: defaultSelect,
      });
      return products;
    }),
  search: trpc.procedure
    .input(z.object({
      query: z.string(),
    }))
    .query(async ({ input, ctx }) => {     
      if(input.query.startsWith('<')) {
        return { res: await prisma.seedProduct.findMany({ select: defaultSelect }), }
      }
      let res = await prisma.seedProduct.findMany({
        where: {
          OR: [
            {
              tags: {
                has: input.query
              }
            },
            {
              title: {
                contains: input.query
              }
            },
            {
              slug: {
                contains: input.query
              }
            }
          ]
        },
        select: defaultSelect,
      })
      const notFound = res.length < 1
      if(notFound) {
        return {
          res: await prisma.seedProduct.findMany({ select: defaultSelect }),
          notFound,
        }
      }
      return { res, notFound };
    }),
  getProductBySlug: trpc.procedure
    .input(z.object({
      slug: z.string().min(1, 'Slug required')
    }))
    .query(async ({ input, ctx }) => {
      const product = await prisma.seedProduct.findUnique({
        where: {
          slug: input.slug
        },
        select: { ...defaultSelect, tags: true, type: true },
      })

      if(!product) throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Product with slug ${input.slug} was not founded`
      })
      return product;
    })
})