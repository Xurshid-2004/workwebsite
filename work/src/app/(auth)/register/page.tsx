import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Create account',
  description: 'Register on JobMarket as a job seeker, poster, or both.',
  path: '/register',
  noIndex: true,
});

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create account"
      subtitle="Join JobMarket as a seeker, poster, or both"
      footer={
        <Link href="/home" className="text-[var(--color-primary)] font-medium hover:underline">
          Continue browsing without an account
        </Link>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
