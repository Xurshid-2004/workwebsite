import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Sign in',
  description: 'Sign in to JobMarket to manage your profile, messages, and job listings.',
  path: '/login',
  noIndex: true,
});

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your profile and messages"
      footer={
        <Link href="/home" className="text-[var(--color-primary)] font-medium hover:underline">
          Continue browsing without signing in
        </Link>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
