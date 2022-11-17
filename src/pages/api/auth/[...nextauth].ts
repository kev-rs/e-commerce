import NextAuth from "next-auth"
import type { NextAuthOptions } from 'next-auth';
import GithubProvider from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials";
import { prisma } from '../../../server/db';
import bcrypt from 'bcryptjs';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { loginSchema } from "../../../common/validation/auth";

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@email.com' },
        password: { label: 'Password', type: 'password', placeholder: 'Password' },
      },
      async authorize(credentials, req) {
        const creds = await loginSchema.parseAsync(credentials);
        const user = await prisma.user.findUnique({ where: { email: creds.email } });

        if(!user) return null;
        if(!bcrypt.compareSync(creds.password, user.password ?? '')) return null;

        const authed_user = await prisma.user.update({
          where: { email: creds.email },
          data: { status: 'online' },
          select: { email: true, name: true, role: true, status: true, id: true }
        })

        return authed_user;
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),
  ],
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register',
    error: '/auth/login'
  },
  session: {
    maxAge: 2592000, // 30d
    strategy: 'jwt',
    updateAge: 86400, // update every day
    // strategy: 'database',
    // updateAge: 0, // update second
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 15 * 24 * 30 * 60, // 15 days
  },
  events: {
    signOut: async ({ token, session }) => {
      const user = await prisma.user.findUnique({
        where: {
          email: token.email ?? ''
        }
      })
      if(!user) return
      await prisma.user.update({
        where: {
          email: user.email,
        },
        data: { status: 'offline' },
      })
    },
    // session: ({session, token}) => {
    //   // console.log({event: { session: session.user, token: token.user }});
    // },
    // updateUser: ({ user }) => {
    //   // console.log({event2: user});
    // },
  },
  callbacks: {
    async jwt({ token, account, user, profile, isNewUser }) { 
      if(account) {
        token.accessToken = account.access_token;

        switch(account.type) {
          case 'oauth':
            const dbUser = await prisma.user.findUnique({ where: { email: user?.email || '' } });
            if(!dbUser) {
              // prisma
              const newUser = await prisma.user.create({
                data: { email: token.email!, password: '@', name: token.name!, status: 'online'},
                select: { email: true, name: true, role: true, status: true, id: true }
              });
              token.user = newUser;
            } else {
              const dbUser = await prisma.user.update({
                where: { email: user!.email! },
                data: { status: 'online' },
                select: { email: true, name: true, role: true, status: true, id: true },
              })
              token.user = dbUser;
            }
            break;
          case 'credentials':
            token.user = user;
            break;
          default: break;
        }
      } else if(token) {
        const user = await prisma.user.findUnique({ 
          where: { email: token.email ?? '' }, select: { email: true, name: true, role: true, status: true, id: true }
        });
        if(!user) return token
        token.user = user
      }
      return token;
    },
    async session({ session, token, user }) {
      session.accessToken = token.accessToken;
      session.user = token.user;
      return session;
    }
  },
}

export default NextAuth(authOptions);