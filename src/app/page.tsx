'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const existingUuid = localStorage.getItem('flight-tracker-uuid');
    
    if (existingUuid) {
      router.replace(`/dashboard/${existingUuid}`);
    } else {
      const newUuid = crypto.randomUUID();
      localStorage.setItem('flight-tracker-uuid', newUuid);
      router.replace(`/dashboard/${newUuid}`);
    }
  }, [router]);

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Creating your dashboard...</p>
    </main>
  );
}
