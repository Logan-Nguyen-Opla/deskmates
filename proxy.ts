import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const SECRET_CODE = '040412'; // New memorizable access code
  const hasDevCookie = req.cookies.get('dev_access');

  // Secret Entry Point: deskmates.online/040412
  if (pathname === `/${SECRET_CODE}`) {
    const response = NextResponse.redirect(new URL('/', req.url));
    // Path: '/' is critical to ensure it works across all sub-pages
    response.cookies.set('dev_access', 'true', { 
      maxAge: 60 * 60 * 24 * 7, 
      path: '/',
      sameSite: 'lax' 
    });
    return response;
  }

  // Public Assets & Landing Page
  if (
    pathname === '/landing' || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // If no cookie, force them back to the landing page
  if (!hasDevCookie) {
    return NextResponse.redirect(new URL('/landing', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};