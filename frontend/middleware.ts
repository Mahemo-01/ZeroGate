import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isDashboardRoute = path.startsWith('/dashboard');

  if (isDashboardRoute) {
    const adminSession = request.cookies.get('zerogate_admin_session')?.value;

    if (!adminSession) {
      const adminLoginUrl = new URL('/admin', request.url);
      return NextResponse.redirect(adminLoginUrl);
    }

    return NextResponse.next();
  }


  if (path === '/' || path === '/admin' || path.startsWith('/api')) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};