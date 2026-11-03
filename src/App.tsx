import React from 'react';
import { AppProviders } from './app/providers/AppProviders';
import { ScreenRouter } from './app/routes/ScreenRouter';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <ScreenRouter />
      </AppProviders>
    </ErrorBoundary>
  );
}

