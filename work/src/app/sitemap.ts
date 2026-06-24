import type { MetadataRoute } from 'next';
import { jobs } from '@/data/jobs';
import { siteConfig } from '@/lib/seo/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const staticRoutes = [
    '',
    '/home',
    '/search',
    '/categories',
    '/map',
    '/login',
    '/register',
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: path === '' || path === '/home' ? 1 : 0.8,
    })),
    ...jobs
      .filter((job) => job.status === 'active')
      .map((job) => ({
        url: `${base}/job/${job.id}`,
        lastModified: new Date(job.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
  ];
}
