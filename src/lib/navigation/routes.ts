import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Bookmark,
  Plus,
  MessageCircle,
  Settings,
  Search,
  Map,
} from 'lucide-react';

/** Single source of truth for app paths — avoids typos and eases Django deep-link parity later. */
export const ROUTES = {
  home: '/home',
  search: '/search',
  map: '/map',
  favorites: '/favorites',
  create: '/create',
  chat: '/chat',
  settings: '/settings',
  profile: '/profile',
  login: '/login',
  register: '/register',
  job: (id: string) => `/job/${id}`,
  chatThread: (id: string) => `/chat/${id}`,
} as const;

export interface NavItemConfig {
  href: string;
  icon: LucideIcon;
  label: string;
  /** Shown in mobile bottom bar as elevated center action */
  isCenter?: boolean;
}

export const MOBILE_NAV_ITEMS: NavItemConfig[] = [
  { href: ROUTES.home, icon: Home, label: 'Home' },
  { href: ROUTES.favorites, icon: Bookmark, label: 'Favorites' },
  { href: ROUTES.create, icon: Plus, label: 'Create', isCenter: true },
  { href: ROUTES.chat, icon: MessageCircle, label: 'Chat' },
  { href: ROUTES.settings, icon: Settings, label: 'Settings' },
];

export const DESKTOP_NAV_ITEMS: NavItemConfig[] = [
  { href: ROUTES.home, icon: Home, label: 'Home' },
  { href: ROUTES.search, icon: Search, label: 'Search' },
  { href: ROUTES.map, icon: Map, label: 'Map View' },
  { href: ROUTES.favorites, icon: Bookmark, label: 'Favorites' },
  { href: ROUTES.chat, icon: MessageCircle, label: 'Messages' },
  { href: ROUTES.settings, icon: Settings, label: 'Settings' },
];

/**
 * Active state for nav links. Home is exact-match only so /job/[id] does not highlight Home.
 */
export function isRouteActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === ROUTES.home) return pathname === ROUTES.home;
  return pathname === href || pathname.startsWith(`${href}/`);
}
