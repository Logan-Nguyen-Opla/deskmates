import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const secretKey = 'xyzabc123321'; // Your secret code
  const hasAccess = request.cookies.get('dev_access');

  // 1. If they hit the secret URL, give them a cookie and let them in
  if (url.pathname === `/${secretKey}`) {
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('dev_access', 'true', { maxAge: 60 * 60 * 24 * 7 }); // 1 week access
    return response;
  }

  // 2. If no cookie and trying to access anything other than public assets/landing
  if (!hasAccess && url.pathname !== '/landing') {
    url.pathname = '/landing';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// Don't run middleware on static files or icons
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};