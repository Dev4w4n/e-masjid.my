'use client';

import React from 'react';
import { MasjidThemeProvider } from '@masjid-suite/ui-theme';
import { LandingPage } from './landing';

export default function HomeClient() {
  return (
    <MasjidThemeProvider defaultMode="dark">
      <LandingPage language="ms" />
    </MasjidThemeProvider>
  );
}