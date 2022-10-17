import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { prisma, UserStatus, Role } from './db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

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

  async function getAuthedUser() {
    const token = req?.cookies.tokenAuth as string;
    // const cart = req?.cookies.cart as string;
    const cartCookie = cookie.serialize('cart', 'deleted', {
      maxAge: 0,
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })
    if(!token) {
      res?.setHeader('Set-Cookie', cartCookie);
      return null;
    }
    try {
      const user = jwt.verify(token, `${process.env.JWT_SECRET_KEY}`) as IUser;
      return { ...user, token };
    } catch (err) {
      const serialized = cookie.serialize('tokenAuth', 'deleted', {
        maxAge: 0,
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      })
      
      res?.setHeader('Set-Cookie', serialized);
      res?.setHeader('Set-Cookie', cartCookie);
      return null;
    }
  }

  const user = await getAuthedUser();
  const query = req?.query;
  return { req, res, prisma, user, query};
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
