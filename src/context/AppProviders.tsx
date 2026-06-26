'use client';

import React from 'react';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { AuthProvider } from './AuthContext';
import { FavoritesProvider } from './FavoritesContext';
import { ChatsProvider } from './ChatsContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <ChatsProvider>
          <OfflineBanner />
          {children}
        </ChatsProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
