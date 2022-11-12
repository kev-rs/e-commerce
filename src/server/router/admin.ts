import { trpc } from "../trpc";
import { prisma } from '../db';
import { z } from 'zod';
import { TRPCError } from "@trpc/server";
import { ObjectId } from 'mongodb';

type Data = {
  numberOfOrders: number; // count
  paidOrders: number; // isPaid = true
  notPaidOrders: number; // isPaid = false
  numberOfClients: number; // role = client
  numberOfProducts: number; // count
  productsWithNoInventory: number; // 0
  lowInventory: number; // products w/ 10 or less in stock
}

export const adminRouter = trpc.router({
  dash: trpc.procedure.query(async () => {
    const [ orders, users, products ] = await Promise.all([
      prisma.order.findMany(),
      prisma.user.findMany(),
      prisma.seedProduct.findMany(),
    ])

    const data: Data = {
      numberOfOrders: orders.length,
      paidOrders: orders.filter(o => o.paidOut == true).length,
      notPaidOrders: orders.filter(o => o.paidOut == false).length,
      numberOfClients: users.filter(u => u.role === 'client').length,
      numberOfProducts: products.length,
      productsWithNoInventory: products.filter(p => p.inStock === 0).length,
      lowInventory: products.filter(p => p.inStock <= 10).length
    }

    return data
  }),
  users: trpc.router({
    get: trpc.procedure.query( async () => await prisma.user.findMany({ select: {
      email: true, name: true, orders: true, role: true, status: true, id: true, _count: true
    }})),
    update: trpc.procedure
      .input(z.object({
        userId: z.string().min(1),
        role: z.enum(['admin', 'client', 'super_user', 'SEO'])
      }))
      .mutation( async ({ input }) => {
        console.log('Mutate')
        if(!ObjectId.isValid(input.userId)) throw new TRPCError({ code: 'BAD_REQUEST', message: `MongoID --> ${input.userId} <-- is not valid` });

        const user = await prisma.user.findUnique({ where: { id: input.userId } });
        if(!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        console.log({user})

        const updated_user = await prisma.user.update({
          where: { id: input.userId },
          data: { role: input.role },
          select: { email: true, name: true, orders: true, role: true, status: true, id: true, _count: true }
        })
        console.log({updated_user})

        return updated_user
      })
  }),
  orders: trpc.procedure.query( async () => {
    const orders = await prisma.order.findMany({
      select: { total: true, paidOut: true, numberOfItems: true, id: true, user: { select: { email: true, name: true }}, shippingAddress: { select: { name: true, lastName: true }}, createdAt: true},
      orderBy: { createdAt: 'desc' }
    })

    return orders;
  })
})