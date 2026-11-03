import React from 'react';
import { AuthProvider } from '@/lib/auth';
import { SolanaProvider } from '@/lib/solana';
import { GeolocationProvider } from '@/lib/GeolocationProvider';
import { APIProvider, APIProviderContext } from '@vis.gl/react-google-maps';
import { ThemeProvider } from '@/lib/theme';

interface AppProvidersProps {
  children: React.ReactNode;
}

const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey =
  Boolean(GOOGLE_MAPS_API_KEY) &&
  GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY' &&
  GOOGLE_MAPS_API_KEY !== 'placeholder' &&
  GOOGLE_MAPS_API_KEY.trim() !== '';

const mockMapsContext = {
  mapQueue: [],
  googleMapsAPIs: {},
  loadedLibraries: {},
  importLibrary: async () => null,
};

export function AppProviders({ children }: AppProvidersProps) {
  const content = (
    <ThemeProvider>
      <AuthProvider>
        <SolanaProvider>
          <GeolocationProvider>
            {children}
          </GeolocationProvider>
        </SolanaProvider>
      </AuthProvider>
    </ThemeProvider>
  );

  if (hasValidKey) {
    return (
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly">
        {content}
      </APIProvider>
    );
  }

  return (
    <APIProviderContext.Provider value={mockMapsContext as any}>
      {content}
    </APIProviderContext.Provider>
  );
}
