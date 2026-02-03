import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that require login
const protectedRoutes = ['/dashboard', '/checkout'];

// Routes for Admin only
const adminRoutes = ['/admin'];

// Routes for guests only (redirect logged-in users)
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get JWT token from session - try both secrets for compatibility
  // Force cookie checking to match auth.ts configuration
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token';

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    cookieName,
    secureCookie: isProduction,
  });

  const isLoggedIn = !!token;
  const isAdmin = token?.role === 'ADMIN';

  // 1. Auth routes (login, register) - redirect logged in users
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 2. Admin routes - require admin role
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      // Redirect non-admin users to home
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
    }

    return NextResponse.next();
  }

  // 3. Protected routes - require login
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. API routes protection
  if (pathname.startsWith('/api/admin')) {
    if (!isLoggedIn || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
  ],
};
