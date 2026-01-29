'use client';

import { useState, useEffect } from 'react';
import type { Airport } from '@/types';

interface AirportSelectorProps {
  value: string;
  onChange: (code: string) => void;
  label: string;
}

export function AirportSelector({ value, onChange, label }: AirportSelectorProps) {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('/api/airports')
      .then((res) => res.json())
      .then((data) => setAirports(data.airports));
  }, []);

  const filtered = search
    ? airports.filter(
        (a) =>
          a.code.toLowerCase().includes(search.toLowerCase()) ||
          a.city.toLowerCase().includes(search.toLowerCase())
      )
    : airports;

  const selected = airports.find((a) => a.code === value);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '4px',
            color: '#fff',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          {selected ? `${selected.code} - ${selected.city}` : 'Select airport...'}
        </button>
        
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '4px',
              marginTop: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 10,
            }}
          >
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: '#222',
                border: 'none',
                borderBottom: '1px solid #333',
                color: '#fff',
              }}
              autoFocus
            />
            {filtered.map((airport) => (
              <button
                key={airport.code}
                type="button"
                onClick={() => {
                  onChange(airport.code);
                  setIsOpen(false);
                  setSearch('');
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: airport.code === value ? '#333' : 'transparent',
                  border: 'none',
                  color: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {airport.code} - {airport.city}, {airport.country}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
