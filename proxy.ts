import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const SECRET_CODE = 'xyzabc123321'; // Share this only with your team
  const hasDevCookie = req.cookies.get('dev_access');

  // Secret Entry: Visit deskmates.online/xyzabc123321 to unlock the real app
  if (pathname === `/${SECRET_CODE}`) {
    const response = NextResponse.redirect(new URL('/', req.url));
    response.cookies.set('dev_access', 'true', { 
      maxAge: 60 * 60 * 24 * 7, // Unlocked for 1 week
      path: '/' 
    });
    return response;
  }

  // Allow everyone to see the Landing Page and core assets
  if (
    pathname === '/landing' || 
    pathname.startsWith('/_next') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Redirect unauthorized public users to the landing page
  if (!hasDevCookie) {
    return NextResponse.redirect(new URL('/landing', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};