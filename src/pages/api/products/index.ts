import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../db';
import z from 'zod';

const GenderType = z.enum(['kid', 'men', 'women', 'unisex'])
type GenderType = z.infer<typeof GenderType>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { gender } = req.query as { gender: GenderType };

  try {
    const products = await prisma.seedProduct.findMany({
      where: {
        gender: GenderType.safeParse(gender).success ? gender : {}
      },
      select: { title: true, images: true, price: true, inStock: true, slug: true, gender: true },
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err })
  }
}
