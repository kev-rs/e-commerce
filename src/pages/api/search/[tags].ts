import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { tags } = req.query as { tags: string };
  console.log({tags})
  if(!tags) return res.status(401).json({ message: 'No query provided' })

  try {
    const product = await prisma.seedProduct.findMany({
      where: {
        OR: [
          {
            tags: {
              has: tags
            }
          },
          {
            title: {
              contains: tags
            }
          }
        ]
      }
    });
    if(!product) return res.status(404).json({ message: 'Product not found' })
    return res.status(200).json(product)
  } catch (err) {
    return res.status(500).json({ err });
  }
}