import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Normalizes host to determine if request is targeting the Studio subdomain.
 * Matches:
 * - studio.henryix.com (production)
 * - studio.localhost (local development, regardless of port e.g. studio.localhost:3000)
 * - studio.* (staging, preview deployments, e.g. studio.henryix.pages.dev)
 */
function isStudioDomain(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return (
    lower === 'studio.henryix.com' ||
    lower === 'studio.localhost' ||
    lower.startsWith('studio.localhost:') ||
    lower.startsWith('studio.')
  );
}

/**
 * Checks if the current environment is local development.
 */
function isDevEnvironment(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return (
    lower.includes('localhost') ||
    lower.includes('127.0.0.1') ||
    lower.endsWith('.workers.dev') ||
    process.env.NODE_ENV !== 'production'
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Defensively exclude Next.js internals, API routes, and static assets from rewrites
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.json' ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|eot|webmanifest|mp3|wav|ogg|json|xml|txt|css|js|map)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Extract host safely, avoiding spoofable x-forwarded-host headers
  const host = request.headers.get('host') || request.nextUrl.host;
  const hostname = (host ? host.split(':')[0] : request.nextUrl.hostname).toLowerCase();

  const isStudio = isStudioDomain(hostname);

  // 2. Subdomain Routing: studio.henryix.com or studio.localhost:*
  if (isStudio) {
    // Prevent double-prefixing if the incoming pathname already begins with /studio
    const rewritePath = pathname.startsWith('/studio')
      ? pathname
      : `/studio${pathname === '/' ? '' : pathname}`;

    const url = request.nextUrl.clone();
    url.pathname = rewritePath;

    // Attach custom request headers for downstream server components and layout detection
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-subdomain', 'studio');
    requestHeaders.set('x-studio-subdomain', 'true');
    requestHeaders.set('x-original-host', host || '');

    return NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 3. Direct access to /studio on root domain (henryix.com / www.henryix.com)
  if (pathname === '/studio' || pathname.startsWith('/studio/')) {
    // In production, redirect direct visits to the dedicated studio subdomain
    if (!isDevEnvironment(hostname)) {
      // Map path to subdomain URL: /studio -> /, /studio/desk -> /desk
      const subPath = pathname.replace(/^\/studio(\/|$)/, '/');
      const targetPath = subPath === '/' ? '' : subPath;
      const targetUrl = new URL(
        `${targetPath}${search}`,
        'https://studio.henryix.com'
      );

      return NextResponse.redirect(targetUrl, 308);
    }

    // In local development, maintain transparent direct access for developer ease
    return NextResponse.next();
  }

  // 4. Fallthrough for public website routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - api (API routes)
     * - Static asset extensions
     */
    '/((?!_next/static|_next/image|api/|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|eot|webmanifest|mp3|wav|ogg|json|xml|txt|css|js|map)$).*)',
  ],
};
