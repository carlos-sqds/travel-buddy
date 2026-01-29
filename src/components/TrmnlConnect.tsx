'use client';

import { useState } from 'react';

interface TrmnlConnectProps {
  webhookUrl: string | null;
  pollingUrl: string;
  onSave: (url: string) => void;
}

export function TrmnlConnect({ webhookUrl, pollingUrl, onSave }: TrmnlConnectProps) {
  const [url, setUrl] = useState(webhookUrl || '');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pollingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        padding: '1.5rem',
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '8px',
        marginBottom: '2rem',
      }}
    >
      <h2 style={{ marginBottom: '1rem' }}>TRMNL Connection</h2>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
          Option 1: Polling (Recommended - Free)
        </h3>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          Create a Private Plugin in TRMNL with Polling strategy, then paste this URL:
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={pollingUrl}
            readOnly
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#222',
              border: '1px solid #333',
              borderRadius: '4px',
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
            }}
          />
          <button
            type="button"
            onClick={handleCopy}
            style={{
              padding: '0.75rem 1rem',
              background: copied ? '#22c55e' : '#333',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      
      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
          Option 2: Webhook (Requires Developer addon - $20)
        </h3>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          Paste your TRMNL webhook URL to enable push updates:
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://usetrmnl.com/api/custom_plugins/..."
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#222',
              border: '1px solid #333',
              borderRadius: '4px',
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
            }}
          />
          <button
            type="button"
            onClick={() => onSave(url)}
            style={{
              padding: '0.75rem 1rem',
              background: '#0070f3',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
