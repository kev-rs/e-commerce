import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const products = await prisma.seedProduct.findMany();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err })
  }
}