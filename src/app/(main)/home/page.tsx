import { HomeContent } from './HomeContent';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Bosh sahifa',
  description: "Tavsiya etilgan ishlar, kategoriyalar va so'nggi e'lonlarni IshTop'da ko'ring.",
  path: '/home',
});

export default function HomePage() {
  return <HomeContent />;
}
