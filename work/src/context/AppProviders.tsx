'use client';

import React from 'react';
import { AuthProvider } from './AuthContext';
import { FavoritesProvider } from './FavoritesContext';
import { ChatsProvider } from './ChatsContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <ChatsProvider>{children}</ChatsProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
