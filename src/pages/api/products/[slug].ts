import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { slug } = req.query as { slug: string };
  console.log({slugApi: slug})

  try {
    if(!slug) return;
    const product = await prisma.seedProduct.findUnique({ where: { slug } });
    return res.status(200).json(product)
  } catch (err) {
    res.status(404).json({ message: 'Product not found' })
  }
}