import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { slug } = req.query as { slug: string };

  try {
    if(!slug) return;
    const product = await prisma.seedProduct.findUnique({ 
      where: { slug },
      select: {
        description: true, images: true, price: true, sizes: true, title: true
      }
    });
    return res.status(200).json(product)
  } catch (err) {
    res.status(404).json({ message: 'Product not found' })
  }
}