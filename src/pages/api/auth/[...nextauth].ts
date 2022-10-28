import NextAuth from "next-auth"
import type { NextAuthOptions } from 'next-auth';
import GithubProvider from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials";
import { prisma } from '../../../server/db';
import bcrypt from 'bcryptjs';
// import { PrismaAdapter } from '@next-auth/prisma-adapter';

export const authOptions: NextAuthOptions = {
// export default NextAuth({
  // adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@email.com' },
        password: { label: 'Password', type: 'password', placeholder: 'Password' },
      },
      async authorize(credentials, req) {
        const user = await prisma.user.findUnique({ where: { email: credentials?.email } });
        if(!user) return null;
        if(!bcrypt.compareSync(credentials!.password, user.password!)) return null;

        const authed_user = await prisma.user.update({
          where: { email: credentials!.email },
          data: { status: 'online' },
          select: { email: true, name: true, role: true, status: true, id: true }
        })
        return authed_user;
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
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
  },
  callbacks: {
    async jwt({ token, account, user, profile }) {
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
      }
      return token;
    },
    async session({ session, token, user }) {
      session.accessToken = token.accessToken;
      session.user = token.user as any;
      return session;
    },
  },
// })
}

export default NextAuth(authOptions);