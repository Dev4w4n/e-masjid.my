 'use client';

import dynamic from 'next/dynamic';

const HomeClient = dynamic(() => import('./home-client'), {
  ssr: false,
  loading: () => null,
});

export default function HomePage() {
  return <HomeClient />;
}