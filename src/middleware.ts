import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || 'grievance-portal-super-secret-key-change-in-production',
  });

  const isAuthenticated = !!token;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdminPage = pathname.startsWith('/dashboard') || pathname.startsWith('/complaints');
  const isCitizenProtected = pathname.startsWith('/submit') || pathname.startsWith('/my-complaints');

  // If user is already logged in and visits login or register, redirect
  if (isAuthPage && isAuthenticated) {
    if (token.role === 'ADMIN' || token.role === 'DEPT_OFFICER') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.redirect(new URL('/my-complaints', req.url));
  }

  // Admin and department officer route protection
  if (isAdminPage) {
    if (!isAuthenticated) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }

    if (token.role !== 'ADMIN' && token.role !== 'DEPT_OFFICER') {
      return NextResponse.redirect(new URL('/my-complaints', req.url));
    }
  }

  // Citizen protected routes
  if (isCitizenProtected) {
    if (!isAuthenticated) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/submit',
    '/my-complaints',
    '/dashboard/:path*',
    '/complaints/:path*',
  ],
};
