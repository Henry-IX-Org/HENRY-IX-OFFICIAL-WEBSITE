import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const path = request.nextUrl.searchParams.get('path');
  const tag = request.nextUrl.searchParams.get('tag');

  const validSecret = process.env.REVALIDATION_SECRET || 'henryix_revalidate_secret';
  if (secret !== validSecret) {
    return NextResponse.json({ error: 'Invalid secret token' }, { status: 401 });
  }

  try {
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, tag, now: Date.now() });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path, now: Date.now() });
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ revalidated: true, path: '/', scope: 'layout', now: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ error: 'Revalidation failed', message: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
