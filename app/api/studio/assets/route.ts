import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getNotionAssets, NotionAsset } from '@/lib/notion';
import { StudioAsset } from '@/components/studio/modules/AssetsModule';
import { authenticateStudioRequest } from '@/lib/studioAuth';

export const dynamic = 'force-dynamic';

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

function getS3Client(): S3Client | null {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint =
    process.env.R2_ENDPOINT ||
    (process.env.CLOUDFLARE_ACCOUNT_ID
      ? `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : undefined);

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateStudioRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Valid studio session required' }, { status: 401 });
    }

    const s3 = getS3Client();
    const bucket = process.env.R2_BUCKET_NAME || 'websiteassets';
    const baseUrl =
      process.env.NEXT_PUBLIC_STORAGE_BASE_URL ||
      'https://pub-c7c5ff43a8ae174ad91e2668de0ad7f0.r2.dev';

    // Parallel fetch: Notion assets + R2 bucket objects
    const [notionAssets, r2Result] = await Promise.all([
      getNotionAssets().catch(err => {
        console.warn('Error fetching Notion assets:', err);
        return [] as NotionAsset[];
      }),
      s3
        ? s3.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 100 })).catch(err => {
            console.warn('Error listing R2 bucket:', err);
            return null;
          })
        : Promise.resolve(null),
    ]);

    const r2Contents = r2Result?.Contents || [];

    // Map combined assets for the Studio AssetsModule
    const assets: StudioAsset[] = [];

    // 1. First map Notion assets
    for (const n of notionAssets) {
      const isVideo = n.fileFormat?.toLowerCase().includes('mp4') || n.name.toLowerCase().includes('video') || n.storageKey.endsWith('.mp4');
      const isFlyer = n.name.toLowerCase().includes('poster') || n.name.toLowerCase().includes('flyer') || n.section?.toLowerCase().includes('flyer');
      const type: 'photo' | 'video' | 'flyer' = isVideo ? 'video' : isFlyer ? 'flyer' : 'photo';
      
      const aspect: '9:16' | '4:5' | '16:9' | '1:1' = isVideo
        ? '9:16'
        : isFlyer
        ? '4:5'
        : n.name.includes('PFP') || n.name.includes('Artwork')
        ? '1:1'
        : '16:9';

      assets.push({
        id: n.id,
        title: n.name,
        type,
        event: n.section || 'Official Archive',
        dimensions: isVideo ? '1080x1920' : aspect === '1:1' ? '3000x3000' : '2400x3000',
        aspectRatio: aspect,
        r2Key: n.storageKey || n.name,
        published: n.publishOnWebsite,
        size: '2.4 MB',
      });
    }

    // 2. Add real R2 storage objects if not already present in Notion assets
    for (const item of r2Contents) {
      if (!item.Key) continue;
      const key = item.Key;
      const alreadyListed = assets.some(a => a.r2Key === key || key.includes(a.title));
      if (!alreadyListed) {
        const isAudio = key.endsWith('.mp3') || key.endsWith('.wav');
        const isVideo = key.endsWith('.mp4') || key.endsWith('.mov');
        const isFlyer = key.toLowerCase().includes('artwork') || key.toLowerCase().includes('flyer');
        const type: 'photo' | 'video' | 'flyer' = isVideo ? 'video' : isFlyer ? 'flyer' : 'photo';
        const aspect: '9:16' | '4:5' | '16:9' | '1:1' = isVideo ? '9:16' : isFlyer ? '1:1' : '16:9';

        const filename = key.split('/').pop() || key;
        const folder = key.split('/')[0] || 'Mixes';

        assets.push({
          id: `r2_${key.replace(/[^a-zA-Z0-9]/g, '_')}`,
          title: filename.replace(/\.[^/.]+$/, ''),
          type,
          event: folder,
          dimensions: aspect === '1:1' ? '3000x3000' : '1920x1080',
          aspectRatio: aspect,
          r2Key: key,
          published: true,
          size: formatBytes(item.Size),
        });
      }
    }

    return NextResponse.json({
      success: true,
      assets,
      notionAssets,
      r2Count: r2Contents.length,
      bucket,
    });
  } catch (error: any) {
    console.error('Error in Studio Assets API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch studio assets' },
      { status: 500 }
    );
  }
}
