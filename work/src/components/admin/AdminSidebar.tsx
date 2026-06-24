'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Flag,
  Tags,
  MapPin,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/jobs', label: 'Job posts', icon: Briefcase },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/locations', label: 'Locations', icon: MapPin },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-60 shrink-0">
      <div className="lg:sticky lg:top-6 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Moderation
          </p>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                    active
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors px-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to app
        </Link>
      </div>
    </aside>
  );
}
