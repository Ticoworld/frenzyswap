// src/middleware.ts - Enhanced security middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🔒 SECURITY: Rate limiting in-memory store (for basic protection)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// 🔒 SECURITY: Rate limiting configuration
const RATE_LIMITS = {
  api: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute for API
  swap: { maxRequests: 10, windowMs: 60000 },  // 10 swaps per minute
  general: { maxRequests: 200, windowMs: 60000 } // 200 requests per minute general
};

// 🔒 SECURITY: Suspicious patterns detection
const SUSPICIOUS_PATTERNS = [
  /\.\.\//g,  // Path traversal
  /<script/gi, // XSS attempts
  /union.*select/gi, // SQL injection
  /javascript:/gi, // JavaScript protocol
  /data:.*base64/gi, // Data URLs
  /eval\(/gi, // Code execution
  /expression\(/gi, // CSS expression
];

// 🔒 Routes that require wallet verification (whitelist access)
const PROTECTED_ROUTES = [
  '/swap',
  '/admin',
  '/analytics'
];

// 🌐 Always public routes (no restrictions)
const PUBLIC_ROUTES = [
  '/api/health',    // Health checks
  '/api/ping',      // Ping endpoint
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

// 🔒 SECURITY: Check for suspicious request patterns
function isSuspiciousRequest(request: NextRequest): boolean {
  const url = request.url.toLowerCase();
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  // Check for suspicious patterns in URL
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      console.warn(`Suspicious pattern detected in URL: ${url}`);
      return true;
    }
  }
  
  // Check for missing or suspicious user agent
  if (!userAgent || userAgent.includes('bot') || userAgent.length < 10) {
    // Allow legitimate bots but log
    if (userAgent.includes('googlebot') || userAgent.includes('bingbot')) {
      return false;
    }
    console.warn(`Suspicious user agent: ${userAgent}`);
    return true;
  }
  
  return false;
}

// 🔒 SECURITY: Rate limiting function
function isRateLimited(request: NextRequest): boolean {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const pathname = request.nextUrl.pathname;
  
  // Determine rate limit based on path
  let limit = RATE_LIMITS.general;
  if (pathname.startsWith('/api/')) {
    limit = RATE_LIMITS.api;
  } else if (pathname.includes('/swap')) {
    limit = RATE_LIMITS.swap;
  }
  
  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    rateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs });
    return false;
  }
  
  if (now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs });
    return false;
  }
  
  entry.count++;
  if (entry.count > limit.maxRequests) {
    console.warn(`Rate limit exceeded for IP: ${ip}, path: ${pathname}`);
    return true;
  }
  
  return false;
}

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

  // 🔒 SECURITY: Check for suspicious requests first
  if (isSuspiciousRequest(request)) {
    console.error(`Blocking suspicious request: ${request.url}`);
    return new Response('Forbidden', { status: 403 });
  }

  // 🔒 SECURITY: Apply rate limiting
  if (isRateLimited(request)) {
    return new Response('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': '60',
        'Content-Type': 'application/json'
      }
    });
  }

  // Create response
  let response = NextResponse.next();

  // Always allow public routes
  if (isPublicRoute(pathname)) {
    response = NextResponse.next();
  } else if (isProtectedRoute(pathname)) {
    // Only check access for protected routes
    const check = shouldAllow(request);
    if (!check.ok) {
      response = NextResponse.redirect(check.redirect!);
    }
  }

  // 🔒 SECURITY: Enhanced security headers for all responses
  const securityHeaders = {
    // XSS Protection
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // HSTS (HTTP Strict Transport Security)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Content Security Policy (Enhanced)
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https: wss: blob:",
      "media-src 'self' https: data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; '),
    
    // Permissions Policy
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()'
    ].join(', '),
    
    // Additional security headers
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // 🔒 SECURITY: Add security context headers for debugging
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-Security-Check', 'passed');
    response.headers.set('X-Rate-Limit-Applied', 'true');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except API routes and static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};