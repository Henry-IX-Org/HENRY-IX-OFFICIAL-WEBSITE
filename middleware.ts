import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Defensively exclude Next.js internals, API routes, and static assets
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

  // 2. Direct visits to /studio on henryix.com redirect cleanly to dedicated studio domain
  if (pathname === '/studio' || pathname.startsWith('/studio/')) {
    const subPath = pathname.replace(/^\/studio(\/|$)/, '/');
    const targetPath = subPath === '/' ? '' : subPath;
    const targetUrl = new URL(
      `${targetPath}${search}`,
      'https://studio.henryix.com'
    );
    return NextResponse.redirect(targetUrl, 308);
  }

  // 3. Fallthrough for public website routes
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
