import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { prisma, UserStatus, Role } from './db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { authOptions as nextAuthOptions } from '../pages/api/auth/[...nextauth]';

interface IUser {
  email: string;
  name: string;
  status: UserStatus;
  role: Role;
  id: string;
}

interface CreateContextOptions {
  // session: Session | null
}

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(opts?: trpcNext.CreateNextContextOptions) {
  const req = opts?.req;
  const res = opts?.res;

  const session =  req && res && await getServerSession(req, res, nextAuthOptions)
  return { prisma, session };
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
