import { usePathname, useSelectedLayoutSegment } from 'next/navigation';

/**
 * Checks if a hostname corresponds to the Studio subdomain.
 * Matches:
 * - studio.henryix.com (production)
 * - studio.localhost (local development, regardless of port e.g. studio.localhost:3000)
 * - studio.* (staging/preview deployments, e.g. studio.henryix.pages.dev)
 */
export function isStudioHostname(hostname?: string | null): boolean {
  if (!hostname) return false;
  const cleanHost = hostname.split(':')[0].toLowerCase().trim();
  return (
    cleanHost === 'studio.henryix.com' ||
    cleanHost === 'studio.localhost' ||
    cleanHost.startsWith('studio.')
  );
}

/**
 * Checks if a pathname targets the studio route.
 * Matches:
 * - /studio
 * - /studio/
 * - /studio/* (e.g. /studio/desk, /studio/broadcast)
 * Excludes:
 * - /
 * - /mixes
 * - /studios (defensive against false prefix matches)
 */
export function isStudioPath(pathname?: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/studio' || pathname.startsWith('/studio/');
}

/**
 * Robust, universal check to determine if the current execution context is Studio.
 * Evaluates both pathname and hostname, supporting SSR, client hydration, and test environments.
 *
 * @param pathname - Optional pathname string (defaults to window.location.pathname if in browser)
 * @param hostname - Optional hostname string (defaults to window.location.hostname if in browser)
 * @returns boolean - true if running in studio context, false otherwise
 */
export function isStudioContext(
  pathname?: string | null,
  hostname?: string | null
): boolean {
  // 1. Direct path check (works on both SSR and client)
  if (isStudioPath(pathname)) {
    return true;
  }

  // 2. Explicit hostname argument check (SSR with headers or test mock)
  if (hostname && isStudioHostname(hostname)) {
    return true;
  }

  // 3. Client-side browser inspection (safe when window is defined)
  if (typeof window !== 'undefined') {
    if (isStudioHostname(window.location?.hostname)) {
      return true;
    }
    if (isStudioPath(window.location?.pathname)) {
      return true;
    }
  }

  // 4. Graceful SSR fallback when window is undefined and path does not match /studio
  return false;
}

/**
 * React hook for Client Components to determine if they are rendering in a Studio context.
 * Utilizes Next.js App Router layout segment detection (useSelectedLayoutSegment)
 * alongside usePathname and window.location.hostname for complete SSR and client hydration safety.
 */
export function useIsStudio(): boolean {
  const pathname = usePathname();
  const segment = useSelectedLayoutSegment();

  if (segment === 'studio') {
    return true;
  }

  if (isStudioPath(pathname)) {
    return true;
  }

  if (typeof window !== 'undefined' && isStudioHostname(window.location?.hostname)) {
    return true;
  }

  return false;
}
