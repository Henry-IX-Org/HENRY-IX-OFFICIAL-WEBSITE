import { NextRequest, NextResponse } from 'next/server';
import { authenticateStudioRequest, disconnectUserOAuthConnection } from '@/lib/studioAuth';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await context.params;
    const user = await authenticateStudioRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED: Please sign in' }, { status: 401 });
    }

    const updatedUser = await disconnectUserOAuthConnection(user.id, provider as any);

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to disconnect account' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Account disconnected cleanly from ${provider}`,
      serviceId: provider,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error during disconnect' }, { status: 500 });
  }
}
