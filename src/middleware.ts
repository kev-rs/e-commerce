import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  async function middleware(req) {
    const cart = JSON.parse(req.cookies.get('cart') || '[]');
    const user_info = req.cookies.get('user-info') ? JSON.parse(req.cookies.get('user-info')!) : undefined;

    if(!req.nextUrl.pathname.startsWith('/cart/empty') && !req.nextUrl.pathname.includes('/orders')) {
      if(!cart) return NextResponse.redirect(new URL('/cart/empty', req.url));
      if(cart.length < 1) return NextResponse.redirect(new URL('/cart/empty', req.url));
    }

    if(req.nextUrl.pathname.startsWith('/checkout/summary')) {
      if(!user_info) return NextResponse.redirect(new URL('/checkout/address', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => !!token
    },
    pages: {
      signIn: '/auth/login',
      error: '/auth/login'
    }
  },
)

export const config = {
  matcher: ['/cart/:path*', '/checkout/:path*', '/orders/:path*'],
}
