'use client';

import { useState } from 'react';
import type { Destination } from '@/types';
import { PriceCard } from './PriceCard';

interface DestinationListProps {
  destinations: Destination[];
  onAdd: (code: string) => void;
  onRemove: (code: string) => void;
}

export function DestinationList({ destinations, onAdd, onRemove }: DestinationListProps) {
  const [newCode, setNewCode] = useState('');
  const [error, setError] = useState('');

  const handleAdd = async () => {
    const code = newCode.toUpperCase().trim();
    if (!code) return;
    
    if (code.length !== 3) {
      setError('Airport code must be 3 characters');
      return;
    }
    
    if (destinations.some((d) => d.code === code)) {
      setError('Already tracking this destination');
      return;
    }
    
    setError('');
    onAdd(code);
    setNewCode('');
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Tracked Destinations</h2>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value.toUpperCase())}
          placeholder="Add airport code (e.g., JFK)"
          maxLength={3}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '4px',
            color: '#fff',
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          type="button"
          onClick={handleAdd}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#0070f3',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>
      
      {error && (
        <p style={{ color: '#f44', marginBottom: '1rem' }}>{error}</p>
      )}
      
      {destinations.length === 0 ? (
        <p style={{ color: '#888' }}>No destinations yet. Add some above!</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {destinations.map((dest) => (
            <PriceCard key={dest.code} destination={dest} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
