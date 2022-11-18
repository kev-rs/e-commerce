import NextAuth, { DefaultSession, JWT } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      address: string
    } & DefaultSession['user']
  }
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