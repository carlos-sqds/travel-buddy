import { describe, it, expect } from 'vitest';
import {
  generateFlightPrice,
  generatePriceHistory,
  calculateTrend,
  getAirportByCode,
  searchAirports,
  getBasePrice,
  AIRPORTS,
} from '@/lib/mock-flight-data';

describe('mock-flight-data', () => {
  describe('generateFlightPrice', () => {
    it('returns a valid flight price object', () => {
      const price = generateFlightPrice('BER', 'JFK');
      
      expect(price).toHaveProperty('id');
      expect(price).toHaveProperty('from', 'BER');
      expect(price).toHaveProperty('to', 'JFK');
      expect(price).toHaveProperty('price');
      expect(price).toHaveProperty('currency', 'EUR');
      expect(price).toHaveProperty('airline');
      expect(price).toHaveProperty('bookingSite');
      expect(price).toHaveProperty('timestamp');
    });

    it('generates consistent prices for the same date', () => {
      const date = new Date('2025-06-15');
      const price1 = generateFlightPrice('BER', 'JFK', date);
      const price2 = generateFlightPrice('BER', 'JFK', date);
      
      expect(price1.price).toBe(price2.price);
    });

    it('generates prices within reasonable range of base price', () => {
      const basePrice = getBasePrice('BER', 'JFK');
      const price = generateFlightPrice('BER', 'JFK');
      
      expect(price.price).toBeGreaterThan(basePrice * 0.7);
      expect(price.price).toBeLessThan(basePrice * 1.3);
    });
  });

  describe('generatePriceHistory', () => {
    it('returns correct number of days', () => {
      const history = generatePriceHistory('BER', 'LHR', 7);
      expect(history).toHaveLength(7);
    });

    it('returns prices in chronological order', () => {
      const history = generatePriceHistory('BER', 'CDG', 5);
      
      for (let i = 1; i < history.length; i++) {
        const prev = new Date(history[i - 1].timestamp);
        const curr = new Date(history[i].timestamp);
        expect(curr.getTime()).toBeGreaterThan(prev.getTime());
      }
    });
  });

  describe('calculateTrend', () => {
    it('returns 0% for single price', () => {
      const prices = [generateFlightPrice('BER', 'JFK')];
      expect(calculateTrend(prices)).toBe('0%');
    });

    it('returns correct trend direction', () => {
      const trend = calculateTrend([
        { ...generateFlightPrice('BER', 'JFK'), price: 500 },
        { ...generateFlightPrice('BER', 'JFK'), price: 450 },
      ]);
      
      expect(trend).toMatch(/↓.*-\d+%/);
    });
  });

  describe('getAirportByCode', () => {
    it('finds existing airport', () => {
      const airport = getAirportByCode('BER');
      expect(airport).toBeDefined();
      expect(airport?.city).toBe('Berlin');
    });

    it('returns undefined for unknown code', () => {
      expect(getAirportByCode('XXX')).toBeUndefined();
    });
  });

  describe('searchAirports', () => {
    it('finds airports by code', () => {
      const results = searchAirports('jfk');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].code).toBe('JFK');
    });

    it('finds airports by city', () => {
      const results = searchAirports('berlin');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].city).toBe('Berlin');
    });

    it('returns empty array for no matches', () => {
      const results = searchAirports('xyz123');
      expect(results).toHaveLength(0);
    });
  });

  describe('AIRPORTS', () => {
    it('contains expected airports', () => {
      expect(AIRPORTS.length).toBeGreaterThan(5);
      expect(AIRPORTS.some(a => a.code === 'BER')).toBe(true);
      expect(AIRPORTS.some(a => a.code === 'JFK')).toBe(true);
    });
  });
});
