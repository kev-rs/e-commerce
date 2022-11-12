import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../server/db';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

type Data = {
  numberOfOrders: number; // count
  paidOrders: number; // isPaid = true
  notPaidOrders: number; // isPaid = false
  numberOfClients: number; // role = client
  numberOfProducts: number; // count
  productsWithNoInventory: number; // 0
  lowInventory: number; // products w/ 10 or less in stock
} | { message: string; }

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

  const session = await getServerSession(req, res, authOptions);

  if(!session) return res.status(401).json({ message: 'UNAUTHORIZED :(' })

  const [ orders, users, products ] = await Promise.all([
    prisma.order.findMany(),
    prisma.user.findMany(),
    prisma.seedProduct.findMany()
  ]);

  const data: Data = {
    numberOfOrders: orders.length,
    paidOrders: orders.filter(o => o.paidOut === true).length,
    notPaidOrders: orders.filter(o => o.paidOut === false).length,
    numberOfClients: users.filter(u => u.role === 'client').length,
    numberOfProducts: products.length,
    productsWithNoInventory: products.filter(p => p.inStock === 0).length,
    lowInventory: products.filter(p => p.inStock <= 10).length
  }

  res.status(200).json({...data});
}