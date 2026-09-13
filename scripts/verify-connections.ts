// Test live connections to Notion and Cloudflare R2
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { 
  getNotionMusicLibraryPaged, 
  getNotionBookings, 
  getNotionSets, 
  getNotionAssets, 
  getNotionContentCalendar,
  NOTION_DATABASES
} from '../lib/notion';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

async function verifyAll() {
  console.log('--- STARTING LIVE CONNECTION VERIFICATION ---');

  // 1. Test Notion Music Library
  console.log('\n[1] Testing Notion Music Library DB:', NOTION_DATABASES.MUSIC_LIBRARY);
  try {
    const page = await getNotionMusicLibraryPaged({ pageSize: 5, forceFresh: true });
    console.log(`Success! Fetched ${page.tracks.length} tracks. HasMore: ${page.hasMore}, NextCursor: ${page.nextCursor ? 'yes' : 'no'}`);
    if (page.tracks.length > 0) {
      console.log('Sample track:', JSON.stringify(page.tracks[0], null, 2));
    }

    console.log('\nTesting Search: "7A"...');
    const searchKeyPage = await getNotionMusicLibraryPaged({ search: '7A', pageSize: 5, forceFresh: true });
    console.log(`Search result for "7A": ${searchKeyPage.tracks.length} tracks.`);
    if (searchKeyPage.tracks.length > 0) {
      console.log('First key search match:', searchKeyPage.tracks[0].title, 'key:', searchKeyPage.tracks[0].key);
    }
  } catch (err) {
    console.error('FAILED Notion Music Library:', err);
  }

  // 2. Test Notion Bookings
  console.log('\n[2] Testing Notion Bookings DB:', NOTION_DATABASES.BOOKINGS);
  try {
    const bookings = await getNotionBookings();
    console.log(`Success! Fetched ${bookings.length} bookings.`);
    if (bookings.length > 0) {
      console.log('Sample booking:', JSON.stringify(bookings[0], null, 2));
    }
  } catch (err) {
    console.error('FAILED Notion Bookings:', err);
  }

  // 3. Test Notion Sets
  console.log('\n[3] Testing Notion Sets DB:', NOTION_DATABASES.SETS);
  try {
    const sets = await getNotionSets();
    console.log(`Success! Fetched ${sets.length} sets.`);
    if (sets.length > 0) {
      console.log('Sample set:', JSON.stringify(sets[0], null, 2));
    }
  } catch (err) {
    console.error('FAILED Notion Sets:', err);
  }

  // 4. Test Notion Assets
  console.log('\n[4] Testing Notion Assets DB:', NOTION_DATABASES.ASSETS);
  try {
    const assets = await getNotionAssets();
    console.log(`Success! Fetched ${assets.length} assets.`);
    if (assets.length > 0) {
      console.log('Sample asset:', JSON.stringify(assets[0], null, 2));
    }
  } catch (err) {
    console.error('FAILED Notion Assets:', err);
  }

  // 5. Test Notion Content Calendar
  console.log('\n[5] Testing Notion Content Calendar DB:', NOTION_DATABASES.CONTENT_CALENDAR);
  try {
    const calendar = await getNotionContentCalendar();
    console.log(`Success! Fetched ${calendar.length} items.`);
    if (calendar.length > 0) {
      console.log('Sample item:', JSON.stringify(calendar[0], null, 2));
    }
  } catch (err) {
    console.error('FAILED Notion Content Calendar:', err);
  }

  // 6. Test Cloudflare R2
  console.log('\n[6] Testing Cloudflare R2 bucket: websiteassets');
  try {
    const s3 = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    const res = await s3.send(new ListObjectsV2Command({ Bucket: 'websiteassets', MaxKeys: 10 }));
    console.log(`Success! R2 listed ${res.Contents ? res.Contents.length : 0} objects.`);
    if (res.Contents && res.Contents.length > 0) {
      console.log('Sample R2 key:', res.Contents[0].Key, 'Size:', res.Contents[0].Size);
    }
  } catch (err) {
    console.error('FAILED Cloudflare R2:', err);
  }

  // 7. Test Studio API Routes directly
  console.log('\n[7] Testing Route Handlers directly:');
  const { GET: getTracks } = await import('../app/api/studio/tracks/route');
  const { GET: getGigs, POST: postGigs } = await import('../app/api/studio/gigs/route');
  const { GET: getAssets } = await import('../app/api/studio/assets/route');
  const { GET: getSocial, POST: postSocial } = await import('../app/api/studio/social/route');

  const reqTracks = new Request('http://localhost:3000/api/studio/tracks?limit=5');
  const resTracks = await getTracks(reqTracks as any);
  const dataTracks = await resTracks.json();
  console.log('Tracks Route status:', resTracks.status, 'Count:', dataTracks.count, 'Success:', dataTracks.success);

  const reqGigs = new Request('http://localhost:3000/api/studio/gigs');
  const resGigs = await getGigs(reqGigs as any);
  const dataGigs = await resGigs.json();
  console.log('Gigs Route status:', resGigs.status, 'Gigs Count:', dataGigs.gigs?.length, 'Sets Count:', dataGigs.sets?.length);

  const reqAssets = new Request('http://localhost:3000/api/studio/assets');
  const resAssets = await getAssets(reqAssets as any);
  const dataAssets = await resAssets.json();
  console.log('Assets Route status:', resAssets.status, 'Assets Count:', dataAssets.assets?.length, 'R2 Count:', dataAssets.r2Count);

  const reqSocial = new Request('http://localhost:3000/api/studio/social');
  const resSocial = await getSocial(reqSocial as any);
  const dataSocial = await resSocial.json();
  console.log('Social Route status:', resSocial.status, 'Posts Count:', dataSocial.posts?.length);

  console.log('\nInspecting Bookings DB schema:');
  const dbInfo = await (await fetch(`https://api.notion.com/v1/databases/40826b67-e077-4713-a899-d532c81d9429`, {
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
    }
  })).json();
  console.log('Bookings DB Properties:', Object.entries(dbInfo.properties || {}).map(([k, v]: any) => `${k} (${v.type})`).join(', '));
  if (dbInfo.properties?.Stage) {
    console.log('Stage config:', JSON.stringify(dbInfo.properties.Stage));
  }
  console.log('\nInspecting Content Calendar DB schema:');
  const calInfo = await (await fetch(`https://api.notion.com/v1/databases/2e91474c-c6ac-4658-9c40-027366a47628`, {
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
    }
  })).json();
  console.log('Calendar DB Properties:', Object.entries(calInfo.properties || {}).map(([k, v]: any) => `${k} (${v.type})`).join(', '));
  if (calInfo.properties?.Status) {
    console.log('Status config:', JSON.stringify(calInfo.properties.Status));
  }
  if (calInfo.properties?.Platform) {
    console.log('Platform config:', JSON.stringify(calInfo.properties.Platform));
  }
  console.log('\n--- VERIFICATION COMPLETED CLEANLY ---');
}

verifyAll();
