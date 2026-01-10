import { NextRequest, NextResponse } from 'next/server';

// Define protected paths
const protectedPaths = [
  '/admin',
  '/admin/',
  '/admin/dashboard',
  '/agent',
  '/agent/',
  '/agent/dashboard',
];

// Define public paths that don't require authentication
const publicPaths = [
  '/login',
  '/api/auth/login',
  '/api/auth/refresh-token',
  '/health',
];

export function middleware(request: NextRequest) {
  // Check if the requested path is protected
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  // Check if the requested path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // If it's a protected path but user is not authenticated, redirect to login
  if (isProtectedPath && !isPublicPath) {
    // Check for authentication cookies
    const accessToken = request.cookies.get('accessToken');
    
    if (!accessToken) {
      // Redirect to login page
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    // Optional: verify the token here if needed
    // For now, we assume if the cookie exists, the user is authenticated
    // The actual verification happens on the backend
  }

  return NextResponse.next();
}

// Specify which paths the middleware should run for
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};