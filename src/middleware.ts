// src/middleware.ts - Protect only /swap route for whitelisted users
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🔒 Routes that require wallet verification (whitelist access)
const PROTECTED_ROUTES = [
  '/swap',
  '/admin',
  '/analytics'
];

// 🌐 Always public routes (no restrictions)
const PUBLIC_ROUTES = [
  '/api',
  '/login',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/assets',
  '/public',
  '/',              // Landing page
  '/legal',         // Legal pages
  '/dao',           // DAO page (coming soon)
  '/staking',       // Staking page (coming soon)
  '/nfts',          // NFTs page (coming soon)
  '/ecosystem'      // Ecosystem page
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

function shouldAllow(request: NextRequest): { ok: boolean; redirect?: URL } {
  const accessOk = request.cookies.get('access-ok')?.value === '1'
  if (accessOk) return { ok: true }
  const wallet = request.cookies.get('connected-wallet')?.value
  // If wallet present but no access cookie, force login to evaluate
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('returnTo', request.nextUrl.pathname)
  const inviteToken = request.nextUrl.searchParams.get('invite')
  if (inviteToken) loginUrl.searchParams.set('invite', inviteToken)
  const ref = request.nextUrl.searchParams.get('ref')
  if (ref) loginUrl.searchParams.set('ref', ref)
  return { ok: false, redirect: loginUrl }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Only check access for protected routes
  if (isProtectedRoute(pathname)) {
    const check = shouldAllow(request)
    if (!check.ok) return NextResponse.redirect(check.redirect!)
  }

  // Allow all other routes (website pages)
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