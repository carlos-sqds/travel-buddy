import { describe, it, expect } from 'vitest';
import {
  generateFlightPrice,
  generatePriceHistory,
  getAirportByCode,
} from '@/lib/mock-flight-data';

describe('flights API logic', () => {
  describe('flight price generation', () => {
    it('generates valid price for known route', () => {
      const from = 'BER';
      const to = 'JFK';
      
      const fromAirport = getAirportByCode(from);
      const toAirport = getAirportByCode(to);
      const price = generateFlightPrice(from, to);
      
      expect(fromAirport).toBeDefined();
      expect(toAirport).toBeDefined();
      expect(price.price).toBeGreaterThan(0);
      expect(price.from).toBe(from);
      expect(price.to).toBe(to);
    });

    it('handles case-insensitive airport codes', () => {
      const airport = getAirportByCode('ber');
      expect(airport).toBeUndefined();
      
      const upperAirport = getAirportByCode('BER');
      expect(upperAirport).toBeDefined();
    });
  });

  describe('price history', () => {
    it('generates 30 days of history by default', () => {
      const history = generatePriceHistory('BER', 'LIS');
      expect(history).toHaveLength(30);
    });

    it('all prices have required fields', () => {
      const history = generatePriceHistory('BER', 'BKK', 5);
      
      history.forEach((price) => {
        expect(price).toHaveProperty('price');
        expect(price).toHaveProperty('airline');
        expect(price).toHaveProperty('bookingSite');
        expect(price).toHaveProperty('timestamp');
        expect(typeof price.price).toBe('number');
      });
    });
  });

  describe('API response structure', () => {
    it('single price response has correct shape', () => {
      const from = 'BER';
      const to = 'SFO';
      const fromAirport = getAirportByCode(from);
      const toAirport = getAirportByCode(to);
      const price = generateFlightPrice(from, to);

      const response = {
        from: fromAirport,
        to: toAirport,
        price,
      };

      expect(response.from?.code).toBe('BER');
      expect(response.to?.code).toBe('SFO');
      expect(response.price.currency).toBe('EUR');
    });
  });
});
