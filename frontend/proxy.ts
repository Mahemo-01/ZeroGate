import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
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

  return new Response(null, {
    status: 302,
    headers: {
      'Location': 'http://192.168.4.1/',
      'Content-Length': '0',
      'Connection': 'close',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};