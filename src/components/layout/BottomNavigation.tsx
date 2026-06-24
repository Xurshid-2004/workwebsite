'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bookmark, Plus, MessageCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChats } from '@/context/ChatsContext';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  isCenter?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/favorites', icon: Bookmark, label: 'Favorites' },
  { href: '/create', icon: Plus, label: 'Create', isCenter: true },
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { totalUnread, isHydrated } = useChats();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe"
      aria-label="Main navigation"
    >
      <div className="glass border-t border-[var(--color-border)] mx-3 mb-3 rounded-2xl shadow-[var(--shadow-nav)]">
        <div className="flex justify-between items-end px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/home' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -top-5 flex flex-col items-center"
                  aria-label="Create job"
                >
                  <div className="w-[3.25rem] h-[3.25rem] bg-[var(--color-accent)] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all ring-4 ring-[var(--color-background)]">
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-semibold text-[var(--color-accent)] mt-1">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem] py-2 rounded-xl transition-colors',
                  isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-secondary)]'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                    isActive && 'bg-[var(--color-primary-light)]'
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {item.href === '/chat' && isHydrated && totalUnread > 0 && (
                  <span className="absolute top-1 right-2 min-w-[16px] h-4 px-1 bg-[var(--color-accent)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
