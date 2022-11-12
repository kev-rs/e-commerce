import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma, User, Role } from '../../../server/db';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { ObjectId } from 'mongodb';

type Data = 
  | User[]
  | { message: string; }
  | any

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

  // const session = await getServerSession(req, res, authOptions);

  // if(!session) return res.status(401).json({ message: 'UNAUTHORIZED :(' })

  if(req.method === 'GET') {
    const users = await prisma.user.findMany({
      select: {
        email: true, name: true, orders: true, role: true, status: true, id: true, _count: true
      }
    });

    return res.status(200).json(users);
  } else if(req.method === 'POST') {
    const { userId, role } = req.body as { userId: string; role: Role };

    if(!ObjectId.isValid(userId)) return res.status(400).json({ message: `User not found with id: ${userId}` })

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
    })

    if(!user) return res.status(404).json({ message: 'User not found' })

    const updated_user = await prisma.user.update({
      where: { id: userId },
      data: { role: { set: role } },
      select: { email: true, name: true, orders: true, role: true, status: true, id: true, _count: true }
    })

    return res.status(200).json({ message: 'User updated' });
  } else {
    // 
  }

  // res.status(200).json({...data});
}