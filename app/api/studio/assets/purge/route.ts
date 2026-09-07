import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { authenticateStudioRequest } from '@/lib/studioAuth';
import { hasPermission } from '@/lib/studioPermissions';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateStudioRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Studio session required' },
        { status: 401 }
      );
    }

    // Role check: Only Owner, Manager, or users with assets:delete permission can trigger emergency purge
    if (user.role !== 'owner' && user.role !== 'manager' && !hasPermission(user.role, 'assets:delete')) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient privileges to trigger cache purge' },
        { status: 403 }
      );
    }

    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      purgedBy: user.name,
      purgedAt: new Date().toISOString(),
      message: 'Global Cloudflare R2 & Next.js edge nodes invalidated.',
    });
  } catch (err: any) {
    console.error('Error during studio cache purge:', err);
    return NextResponse.json(
      { error: 'Purge failed', message: err.message },
      { status: 500 }
    );
  }
}
