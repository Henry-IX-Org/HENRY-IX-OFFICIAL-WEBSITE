import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/studio/', '/studio', '/avatar/'],
    },
    sitemap: 'https://henryix.com/sitemap.xml',
  };
}
