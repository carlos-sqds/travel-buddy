'use client';

import type { Destination } from '@/types';

interface PriceCardProps {
  destination: Destination;
  onRemove: (code: string) => void;
}

export function PriceCard({ destination, onRemove }: PriceCardProps) {
  const trendColor = destination.trend?.includes('↓')
    ? '#4ade80'
    : destination.trend?.includes('↑')
    ? '#f87171'
    : '#888';

  return (
    <div
      style={{
        padding: '1rem',
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{destination.code}</span>
            <span style={{ color: '#888' }}>{destination.name}</span>
          </div>
          
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              €{destination.currentPrice?.toLocaleString() || '---'}
            </span>
            {destination.trend && (
              <span style={{ marginLeft: '0.75rem', color: trendColor, fontSize: '1.1rem' }}>
                {destination.trend}
              </span>
            )}
          </div>
          
          {destination.bestAirline && (
            <div style={{ marginTop: '0.5rem', color: '#888', fontSize: '0.9rem' }}>
              Best: {destination.bestAirline} via {destination.bestSite}
            </div>
          )}
          
          {destination.lastUpdated && (
            <div style={{ marginTop: '0.25rem', color: '#666', fontSize: '0.8rem' }}>
              Updated: {new Date(destination.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={() => onRemove(destination.code)}
          style={{
            padding: '0.5rem',
            background: 'transparent',
            border: '1px solid #444',
            borderRadius: '4px',
            color: '#888',
            cursor: 'pointer',
          }}
          title="Remove destination"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
