import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/signup'];

// Define auth routes that authenticated users shouldn't access (login/signup pages)
const authRoutes = ['/', '/signup'];

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Get token from cookie (HttpOnly) or fallback to checking if user might have it in localStorage
  const token = request.cookies.get('auth_token')?.value;
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.includes(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);
  
  console.log('🔐 Middleware:', {
    pathname,
    hasToken: !!token,
    isProtectedRoute,
    isAuthRoute,
    host: request.headers.get('host'),
  });
  
  // If user is authenticated (has token)
  if (token) {
    // Redirect authenticated users away from auth pages to dashboard
    if (isAuthRoute) {
      console.log('✅ Authenticated user accessing auth route, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Allow access to protected routes
    if (isProtectedRoute) {
      console.log('✅ Authenticated user accessing protected route');
      return NextResponse.next();
    }
  }
  
  // If user is NOT authenticated (no token)
  if (!token) {
    // Redirect unauthenticated users from protected routes to login (root /)
    if (isProtectedRoute) {
      console.log('❌ Unauthenticated user accessing protected route, redirecting to login');
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Allow access to public/auth routes
    if (isPublicRoute || isAuthRoute) {
      console.log('✅ Unauthenticated user accessing public route');
      return NextResponse.next();
    }
  }
  
  // Default: allow the request to proceed
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (they handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/).*)',
  ],
};
