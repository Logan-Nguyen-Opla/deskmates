// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const SECRET_CODE = '040412'; 
  const hasDevCookie = req.cookies.get('dev_access');

  if (pathname === `/${SECRET_CODE}`) {
    const response = NextResponse.redirect(new URL('/', req.url));
    response.cookies.set('dev_access', 'true', { maxAge: 60 * 60 * 24 * 7, path: '/' });
    return response;
  }

  // UPDATED: Allow public access to legal pages and landing
  if (
    pathname === '/landing' || 
    pathname === '/privacy' || 
    pathname === '/terms' || 
    pathname.startsWith('/_next') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (!hasDevCookie) {
    return NextResponse.redirect(new URL('/landing', req.url));
  }

  return NextResponse.next();
}