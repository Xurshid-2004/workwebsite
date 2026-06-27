'use client';

import { useEffect, useState } from 'react';

export function useOnlineStatus(): boolean {
  // Start "online" so SSR and the first client render agree; read the real
  // status after mount to avoid a hydration mismatch when offline at load.
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return online;
}
