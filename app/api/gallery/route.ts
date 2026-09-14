import { NextResponse } from 'next/server';
import { getNotionAssets } from '@/lib/notion';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const assets = await getNotionAssets(true).catch((err) => {
      console.warn('[API/gallery] Notion assets fetch error:', err);
      return [];
    });

    const items = (assets || []).map(asset => {
      let src = asset.cloudflareUrl || asset.previewUrl || '';
      if (asset.storageKey) {
        src = `/api/assets?key=${encodeURIComponent(asset.storageKey)}`;
      } else if (src && !src.startsWith('/api/assets')) {
        src = `/api/assets?url=${encodeURIComponent(src)}`;
      }
      return {
        id: asset.id,
        title: asset.name,
        src,
        album: asset.section || 'General',
        category: asset.assetType === 'Photo' ? 'me' : (asset.assetType === 'Cover' ? 'artwork' : 'me'),
        caption: asset.caption || asset.altText,
      };
    });

    if (items.length === 0) {
      items.push(
        { id: 'r2_me_1', title: 'STUDIO PORTRAIT TAKE 01', src: '/api/assets?key=gallery%2FMe%2FIMG_0495.jpg', album: 'Me', category: 'me', caption: 'London Studio Portrait' },
        { id: 'r2_me_2', title: 'STUDIO PORTRAIT TAKE 02', src: '/api/assets?key=gallery%2FMe%2FIMG_3540.jpg', album: 'Me', category: 'me', caption: 'London Studio Portrait' },
        { id: 'r2_me_3', title: 'OFFICIAL IDENTITY PFP', src: '/api/assets?key=gallery%2FMe%2FOfficial%20Red%20Background%20With%20PFP%20Cutout%20-%20No%20Text.png', album: 'Me', category: 'me', caption: 'Official Visual Monogram Cutout' },
        { id: 'r2_kc_1', title: 'KNIGHT CLUB SESSION 1', src: '/api/assets?key=Mixes%2FKnight%20Club%2FMix%20Artwork%2FKnight%20Club%20Track%20Artwork%20Session%201.jpg', album: 'Knight Club', category: 'artwork', caption: 'Knight Club Track Artwork' },
        { id: 'r2_rc_1', title: 'ROYAL COURT SESSION 1', src: '/api/assets?key=Mixes%2FRoyal%20Court%2FMix%20Artwork%2FRoyal%20Court%20Session%201%20Track%20Artwork.jpg', album: 'Royal Court', category: 'artwork', caption: 'Royal Court Track Artwork' },
        { id: 'r2_cnc_1', title: 'CORNER NEW CROSS NIGHT 1', src: '/api/assets?key=Mixes%2FCorner%20New%20Cross%2FMix%20Artwork%2FCNC%20N1%20Artwork.png', album: 'Corner New Cross', category: 'artwork', caption: 'Corner New Cross Track Artwork' }
      );
    }

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (err: any) {
    console.error('Error in /api/gallery:', err);
    return NextResponse.json({
      success: true,
      items: [
        { id: 'r2_me_1', title: 'STUDIO PORTRAIT TAKE 01', src: '/api/assets?key=gallery%2FMe%2FIMG_0495.jpg', album: 'Me', category: 'me', caption: 'London Studio Portrait' },
        { id: 'r2_me_2', title: 'STUDIO PORTRAIT TAKE 02', src: '/api/assets?key=gallery%2FMe%2FIMG_3540.jpg', album: 'Me', category: 'me', caption: 'London Studio Portrait' },
        { id: 'r2_me_3', title: 'OFFICIAL IDENTITY PFP', src: '/api/assets?key=gallery%2FMe%2FOfficial%20Red%20Background%20With%20PFP%20Cutout%20-%20No%20Text.png', album: 'Me', category: 'me', caption: 'Official Visual Monogram Cutout' },
      ],
    });
  }
}
