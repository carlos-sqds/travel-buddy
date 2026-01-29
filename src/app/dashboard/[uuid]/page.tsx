'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import type { Destination } from '@/types';
import { AirportSelector } from '@/components/AirportSelector';
import { DestinationList } from '@/components/DestinationList';
import { TrmnlConnect } from '@/components/TrmnlConnect';

interface ConfigState {
  homeAirport: string;
  destinations: Destination[];
  trmnlWebhookUrl: string | null;
}

export default function Dashboard() {
  const params = useParams();
  const uuid = params.uuid as string;
  
  const [config, setConfig] = useState<ConfigState | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollingUrl, setPollingUrl] = useState('');

  const fetchConfig = useCallback(async () => {
    const res = await fetch(`/api/config/${uuid}`);
    if (res.ok) {
      const data = await res.json();
      setConfig(data);
    }
    setLoading(false);
  }, [uuid]);

  useEffect(() => {
    fetchConfig();
    setPollingUrl(`${window.location.origin}/api/trmnl/${uuid}`);
  }, [fetchConfig, uuid]);

  const handleSetHomeAirport = async (code: string) => {
    await fetch(`/api/config/${uuid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setHomeAirport', code }),
    });
    fetchConfig();
  };

  const handleAddDestination = async (code: string) => {
    const res = await fetch(`/api/config/${uuid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addDestination', code }),
    });
    if (res.ok) {
      fetchConfig();
    }
  };

  const handleRemoveDestination = async (code: string) => {
    await fetch(`/api/config/${uuid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'removeDestination', code }),
    });
    fetchConfig();
  };

  const handleSaveWebhook = async (url: string) => {
    await fetch(`/api/config/${uuid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setWebhookUrl', url }),
    });
    fetchConfig();
  };

  if (loading) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Flight Price Tracker</h1>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Bookmark this page to return to your dashboard
      </p>

      <TrmnlConnect
        webhookUrl={config?.trmnlWebhookUrl || null}
        pollingUrl={pollingUrl}
        onSave={handleSaveWebhook}
      />

      <AirportSelector
        value={config?.homeAirport || 'BER'}
        onChange={handleSetHomeAirport}
        label="Home Airport"
      />

      <DestinationList
        destinations={config?.destinations || []}
        onAdd={handleAddDestination}
        onRemove={handleRemoveDestination}
      />
    </main>
  );
}
