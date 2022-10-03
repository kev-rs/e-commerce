import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {  
  NextResponse.next();
}

export const config = {
  matcher: '/'
}
