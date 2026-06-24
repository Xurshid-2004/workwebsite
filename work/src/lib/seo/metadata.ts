import type { Metadata } from 'next';

const SITE_NAME = 'JobMarket';
const SITE_DESCRIPTION =
  'Discover job opportunities, post listings, chat with employers, and manage your career on JobMarket.';

export const siteConfig = {
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
};

export function createPageMetadata({
  title,
  description,
  path = '',
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const desc = description ?? SITE_DESCRIPTION;
  const url = `${siteConfig.url}${path}`;

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: path || '/' },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
    },
  };
}
