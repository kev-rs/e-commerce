import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { prisma } from './db';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { authOptions as nextAuthOptions } from '../pages/api/auth/[...nextauth]';

export async function createContext(opts?: trpcNext.CreateNextContextOptions) {
  const req = opts?.req;
  const res = opts?.res;

  const session =  req && res && await getServerSession(req, res, nextAuthOptions)
  return { prisma, session };
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
