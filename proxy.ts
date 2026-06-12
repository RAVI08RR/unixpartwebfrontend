import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/signup'];

// Define auth routes that authenticated users shouldn't access (login/signup pages)
const authRoutes = ['/', '/signup'];

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/settings', '/employee'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip proxy for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Get token and role from cookie
  const token = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  const isEmployee = userRole === 'employee';
  
  // Check if the current path is a protected route (excluding the employee login page itself)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) && pathname !== '/employee/login';
  const isAuthRoute = authRoutes.includes(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);
  
  console.log('🔐 Proxy:', {
    pathname,
    hasToken: !!token,
    userRole,
    isProtectedRoute,
    isAuthRoute,
    host: request.headers.get('host'),
  });
  
  // If user is authenticated (has token)
  if (token) {
    // Redirect authenticated users away from auth pages to their respective dashboard
    if (isAuthRoute) {
      const targetUrl = isEmployee ? '/employee' : '/dashboard';
      console.log(`✅ Authenticated user accessing auth route, redirecting to ${targetUrl}`);
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }
    
    // Redirect employees trying to access admin dashboard routes
    if (isEmployee && pathname.startsWith('/dashboard')) {
      console.log('❌ Employee user trying to access admin dashboard, redirecting to employee dashboard');
      return NextResponse.redirect(new URL('/employee', request.url));
    }

    // Redirect admins/managers trying to access employee routes
    if (!isEmployee && pathname.startsWith('/employee') && pathname !== '/employee/login') {
      console.log('❌ Admin user trying to access employee portal, redirecting to admin dashboard');
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
    // Redirect unauthenticated users from protected routes to login
    if (isProtectedRoute) {
      const isEmployeeRoute = pathname.startsWith('/employee');
      const targetLoginPath = isEmployeeRoute ? '/employee/login' : '/';
      
      console.log(`❌ Unauthenticated user accessing protected route, redirecting to ${targetLoginPath}`);
      const loginUrl = new URL(targetLoginPath, request.url);
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

// Configure which routes the proxy should run on
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
