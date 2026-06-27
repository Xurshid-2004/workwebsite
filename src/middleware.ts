import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_ROLE_COOKIE, AUTH_SESSION_COOKIE } from '@/lib/auth/session-cookie';

const PROTECTED_PREFIXES = [
  '/create',
  '/favorites',
  '/profile',
  '/my-jobs',
  '/chat',
  '/settings',
] as const;

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get(AUTH_SESSION_COOKIE)?.value === '1';
  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value;

  if (pathname.startsWith('/admin')) {
    if (!hasSession || role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isProtectedPath(pathname) && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/create',
    '/favorites',
    '/profile/:path*',
    '/my-jobs',
    '/chat/:path*',
    '/settings',
  ],
};
