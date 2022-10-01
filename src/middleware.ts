import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('Hello from Home :)')
}

export const config = {
  matcher: '/'
}