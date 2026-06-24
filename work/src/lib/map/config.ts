import type { MapProviderId, MapViewport } from '@/types';

/**
 * Map provider configuration.
 * Set NEXT_PUBLIC_MAP_PROVIDER to google | yandex | leaflet when API keys are added.
 * Defaults to placeholder (no API key required).
 */
export const MAP_PROVIDER: MapProviderId =
  (process.env.NEXT_PUBLIC_MAP_PROVIDER as MapProviderId | undefined) ?? 'placeholder';

export const MAP_API_KEYS = {
  google: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  yandex: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? '',
} as const;

export function isMapProviderConfigured(provider: MapProviderId): boolean {
  switch (provider) {
    case 'placeholder':
      return true;
    case 'leaflet':
      return true;
    case 'google':
      return MAP_API_KEYS.google.length > 0;
    case 'yandex':
      return MAP_API_KEYS.yandex.length > 0;
    default:
      return false;
  }
}

/** Active provider — falls back to placeholder when keys are missing */
export function getActiveMapProvider(): MapProviderId {
  if (MAP_PROVIDER !== 'placeholder' && isMapProviderConfigured(MAP_PROVIDER)) {
    return MAP_PROVIDER;
  }
  return 'placeholder';
}

/** Default viewport for coordinate → percent projection (continental US demo) */
export const DEFAULT_MAP_VIEWPORT: MapViewport = {
  center: { lat: 39.8283, lng: -98.5795 },
  zoom: 4,
  bounds: {
    north: 49.38,
    south: 24.52,
    west: -124.77,
    east: -66.95,
  },
};
