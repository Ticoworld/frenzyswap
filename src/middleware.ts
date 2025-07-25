// src/middleware.ts - Complete Private Beta Gate
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🌐 Only these routes are accessible without wallet verification
const PUBLIC_ROUTES = [
  '/api',
  '/login',          // Wallet connect page
  '/_next',          // Next.js assets
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/assets',
  '/public'
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

function verifyBetaAccess(request: NextRequest): boolean {
  const walletCookie = request.cookies.get('connected-wallet')?.value;
  
  if (!walletCookie) {
    return false;
  }

  // Get allowed wallets from environment
  const allowedWallets = process.env.NEXT_PUBLIC_ALLOWED_WALLETS?.split(',') || [];
  
  // Check if connected wallet is in allowlist
  return allowedWallets.includes(walletCookie);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // For all other routes, check beta access
  const hasAccess = verifyBetaAccess(request);
  
  if (!hasAccess) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except API routes and static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};