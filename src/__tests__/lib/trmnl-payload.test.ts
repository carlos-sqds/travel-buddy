import { describe, it, expect } from 'vitest';
import {
  generateChartUrl,
  destinationToTrmnl,
  buildTrmnlPayload,
  validateTrmnlPayload,
} from '@/lib/trmnl-payload';
import type { Destination, TrmnlPayload } from '@/types';

describe('trmnl-payload', () => {
  describe('generateChartUrl', () => {
    it('returns empty string for empty prices', () => {
      const url = generateChartUrl('JFK', []);
      expect(url).toBe('');
    });

    it('returns QuickChart URL with encoded config', () => {
      const url = generateChartUrl('JFK', [400, 450, 380]);
      expect(url).toContain('quickchart.io/chart');
      expect(url).toContain('w=400');
      expect(url).toContain('h=150');
    });

    it('includes all price data points', () => {
      const prices = [100, 200, 300];
      const url = generateChartUrl('TEST', prices);
      const decoded = decodeURIComponent(url);
      expect(decoded).toContain('100');
      expect(decoded).toContain('200');
      expect(decoded).toContain('300');
    });
  });

  describe('destinationToTrmnl', () => {
    it('converts destination to TRMNL format', () => {
      const dest: Destination = {
        id: 'jfk',
        code: 'JFK',
        name: 'New York',
        currentPrice: 450,
        trend: '↓ -5%',
        bestAirline: 'Delta',
        bestSite: 'Google Flights',
        lastUpdated: '2025-01-01T00:00:00Z',
      };

      const trmnl = destinationToTrmnl(dest, [400, 450, 430]);

      expect(trmnl.code).toBe('JFK');
      expect(trmnl.name).toBe('New York');
      expect(trmnl.current_price).toBe(450);
      expect(trmnl.trend).toBe('↓ -5%');
      expect(trmnl.best_airline).toBe('Delta');
      expect(trmnl.chart_url).toContain('quickchart.io');
    });

    it('handles missing optional fields', () => {
      const dest: Destination = {
        id: 'xxx',
        code: 'XXX',
        name: 'Unknown',
        currentPrice: null,
        trend: null,
        bestAirline: null,
        bestSite: null,
        lastUpdated: null,
      };

      const trmnl = destinationToTrmnl(dest);

      expect(trmnl.current_price).toBe(0);
      expect(trmnl.trend).toBe('0%');
      expect(trmnl.best_airline).toBe('Unknown');
    });
  });

  describe('buildTrmnlPayload', () => {
    it('builds valid payload structure', () => {
      const destinations: Destination[] = [
        {
          id: 'jfk',
          code: 'JFK',
          name: 'New York',
          currentPrice: 450,
          trend: '↓ -5%',
          bestAirline: 'Delta',
          bestSite: 'Google Flights',
          lastUpdated: '2025-01-01T00:00:00Z',
        },
      ];

      const priceHistories = new Map([['JFK', [400, 420, 450]]]);

      const payload = buildTrmnlPayload('BER', destinations, priceHistories);

      expect(payload.merge_variables).toBeDefined();
      expect(payload.merge_variables.home_airport).toContain('BER');
      expect(payload.merge_variables.last_updated).toBeDefined();
      expect(payload.merge_variables.destinations).toHaveLength(1);
      expect(payload.merge_variables.destinations[0].code).toBe('JFK');
    });

    it('handles empty destinations', () => {
      const payload = buildTrmnlPayload('BER', [], new Map());

      expect(payload.merge_variables.destinations).toHaveLength(0);
    });
  });

  describe('validateTrmnlPayload', () => {
    it('validates correct payload', () => {
      const payload: TrmnlPayload = {
        merge_variables: {
          home_airport: 'BER (Berlin)',
          last_updated: '2025-01-01T00:00:00Z',
          destinations: [
            {
              code: 'JFK',
              name: 'New York',
              current_price: 450,
              currency: 'EUR',
              trend: '↓ -5%',
              best_airline: 'Delta',
              best_site: 'Google Flights',
              chart_url: 'https://example.com/chart',
            },
          ],
        },
      };

      const result = validateTrmnlPayload(payload);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('catches missing merge_variables', () => {
      const payload = {} as TrmnlPayload;
      const result = validateTrmnlPayload(payload);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing merge_variables');
    });

    it('catches missing required fields', () => {
      const payload: TrmnlPayload = {
        merge_variables: {
          home_airport: '',
          last_updated: '',
          destinations: [],
        },
      };

      const result = validateTrmnlPayload(payload);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('validates destination structure', () => {
      const payload = {
        merge_variables: {
          home_airport: 'BER',
          last_updated: '2025-01-01',
          destinations: [
            { code: '', current_price: 'invalid' },
          ],
        },
      } as unknown as TrmnlPayload;

      const result = validateTrmnlPayload(payload);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('missing code'))).toBe(true);
    });
  });
});
