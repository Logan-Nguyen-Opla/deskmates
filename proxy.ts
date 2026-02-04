import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'; // FIX: changed from 'next/request'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const SECRET_CODE = 'xyzabc123321';
  const hasDevCookie = req.cookies.get('dev_access');

  // 1. Secret Entry Point: deskmates.online/xyzabc123321
  if (pathname === `/${SECRET_CODE}`) {
    const response = NextResponse.redirect(new URL('/', req.url));
    // Grant access for 7 days
    response.cookies.set('dev_access', 'true', { 
      maxAge: 60 * 60 * 24 * 7,
      path: '/' 
    });
    return response;
  }

  // 2. Allow public access to Landing, static files, and images
  if (
    pathname === '/landing' || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 3. Force everyone else to the Landing Page
  if (!hasDevCookie) {
    return NextResponse.redirect(new URL('/landing', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};