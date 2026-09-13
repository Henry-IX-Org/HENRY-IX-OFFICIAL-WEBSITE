import { NextResponse } from 'next/server';
import { getNotionAssets } from '@/lib/notion';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const assets = await getNotionAssets(true).catch((err) => {
      console.warn('[API/gallery] Notion assets fetch error:', err);
      return [];
    });

    const items = (assets || []).map(asset => ({
      id: asset.id,
      title: asset.name,
      src: asset.cloudflareUrl || asset.previewUrl,
      album: asset.section || 'General',
      category: asset.assetType === 'Photo' ? 'me' : (asset.assetType === 'Cover' ? 'artwork' : 'me'),
      caption: asset.caption || asset.altText,
    }));

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (err: any) {
    console.error('Error in /api/gallery:', err);
    return NextResponse.json({
      success: true,
      items: [],
    });
  }
}
