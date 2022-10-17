import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const cart = req.cookies.get('cart');

  if(req.nextUrl.pathname.endsWith('/cart')) {
    if(!cart) return NextResponse.redirect(new URL('/cart/empty', req.url));
  }

  const tokenAuth = req.cookies.get('tokenAuth');
  if(!tokenAuth) return NextResponse.redirect(new URL(`/auth/login?p=${req.nextUrl.pathname}`, req.url));
  
  try {
    await jwtVerify(tokenAuth, new TextEncoder().encode(`${process.env.JWT_SECRET_KEY}`));
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL(`/auth/login?p=${req.nextUrl.pathname}`, req.url));
  }

  
}

export const config = {
  matcher: ['/cart/:path*', '/checkout/:path*']
}
