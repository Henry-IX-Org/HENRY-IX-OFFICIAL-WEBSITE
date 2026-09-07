import { NextResponse } from 'next/server';
import AdmZip from 'adm-zip';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const zip = new AdmZip();

    // 1. Artist Biography
    const bioText = `HENRY IX // OFFICIAL ARTIST BIOGRAPHY (2026)
--------------------------------------------------
Origin: London, United Kingdom
Genres: High-Energy Techno, Acid, Breaks, Queer Disco, UK Underground
Decks: 3-4 CDJ-3000s + DJM-A9 Mixer

SHORT BIO:
HENRY IX is a London-based electronic music DJ and producer delivering relentless, high-precision 4-deck performances that fuse raw hypnotic techno, acid squelches, and infectious queer disco energy. A resident staple across London underground institutions, HENRY IX transforms dancefloors into sanctuaries of collective euphoria.

FULL BIO:
Forged in the concrete basements and warehouse scene of East and South London, HENRY IX has built a reputation for tour-grade mixing technique, rapid harmonic storytelling, and an uncompromising crate of secret dubplates and unreleased edits.

Whether steering peak-time warehouse sessions at 145+ BPM or crafting extended hypnotic morning warm-ups, HENRY IX blends analog audio sensibilities with cutting-edge sonic design.

Official Website: https://henryix.com
Booking & Management: bookings@henryix.com
`;

    // 2. Technical Rider
    const riderText = `HENRY IX // TECHNICAL & HOSPITALITY RIDER (2026)
--------------------------------------------------
DJ BOOTH SPECIFICATIONS (NON-NEGOTIABLE):

1. PLAYBACK HARDWARE:
   - 3x or 4x Pioneer CDJ-3000 (Firmware updated to latest stable version).
   - 1x Pioneer DJM-A9 or DJM-V10 Mixer.
   - All players linked via Gigabit Ethernet Switch (Pro DJ Link).
   - Clean USB 3.0 ports on all CDJs with unhindered top access.

2. MONITORING:
   - 2x High-Powered Active Booth Monitors (d&b audiotechnik, L-Acoustics, or Void Acoustics).
   - Independent booth level control on DJM mixer within reach of artist.
   - Zero audible monitor latency or digital processing delay.

3. POWER & CABLING:
   - 2x Clean UK or EU Mains Sockets in booth for recorder / accessories.
   - 1x Record Out RCA or 3.5mm stereo feed for Zoom H4n master archive.

4. HOSPITALITY:
   - Still mineral water (room temperature).
   - Towels in booth.
   - Secure artist dressing / green room with Wi-Fi access.
`;

    // 3. Press Links & Metadata
    const linksText = `HENRY IX // DIRECT VERIFIED LINKS
--------------------------------------------------
Official Portal: https://henryix.com
Press EPK: https://henryix.com/press/promoter-access
Mix Archive: https://henryix.com/mixes
Live Streams: https://henryix.com/live
SoundCloud: https://soundcloud.com/henryix
Spotify: https://open.spotify.com/artist/henryix
Instagram: https://instagram.com/henryix_music
Resident Advisor: https://ra.co/dj/henryix
`;

    const pressMeta = {
      artist: 'HENRY IX',
      location: 'London, UK',
      version: '2026.1',
      published: new Date().toISOString(),
      riderCompliant: true,
      masterAssetsBase: 'https://assets.henryix.com',
    };

    zip.addFile('HENRY_IX_BIOGRAPHY_2026.txt', Buffer.from(bioText, 'utf-8'));
    zip.addFile('HENRY_IX_TECHNICAL_RIDER.txt', Buffer.from(riderText, 'utf-8'));
    zip.addFile('HENRY_IX_CONTACTS_AND_LINKS.txt', Buffer.from(linksText, 'utf-8'));
    zip.addFile('METADATA.json', Buffer.from(JSON.stringify(pressMeta, null, 2), 'utf-8'));

    const zipBuffer = zip.toBuffer();

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="Henry_IX_Press_Kit_2026.zip"',
        'Content-Length': zipBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Failed to generate EPK zip:', error);
    return NextResponse.json({ error: 'Failed to generate press kit archive' }, { status: 500 });
  }
}
