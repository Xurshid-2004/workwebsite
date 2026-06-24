import { HomeContent } from './HomeContent';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Home',
  description: 'Browse featured jobs, categories, and recent listings on JobMarket.',
  path: '/home',
});

export default function HomePage() {
  return <HomeContent />;
}
