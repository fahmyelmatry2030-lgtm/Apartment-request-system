import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://mazar-booking.com'; // Placeholder, can be updated later

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/_next',
          '/api',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
