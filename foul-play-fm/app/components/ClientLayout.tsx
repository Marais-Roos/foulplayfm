'use client';

import dynamic from 'next/dynamic';

const RadioPlayer = dynamic(() => import('./RadioPlayer'), {
  ssr: false,
});

export default function ClientLayout() {
  return <RadioPlayer />;
}
