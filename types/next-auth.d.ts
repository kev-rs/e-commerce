import NextAuth, { DefaultSession, Session } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      /** The user's postal address. */
      address: string
    } & DefaultSession['user']
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
        name?: string | null;
        email?: string | null;
        id?: string
        role?: 'admin' | 'client' | 'super_user' | 'SEO', 
        status?: 'online' | 'offline', 
        // picture?: string | null;
    } | undefined
  }
}