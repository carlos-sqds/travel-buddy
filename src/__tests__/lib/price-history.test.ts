import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getDb, closeDb } from '@/lib/db';
import {
  getConfig,
  setHomeAirport,
  addDestination,
  removeDestination,
  getDestinations,
  recordPrice,
  getPriceHistory,
  getDestinationWithPrices,
} from '@/lib/price-history';

const TEST_DB_PATH = path.join(process.cwd(), 'flight-tracker.db');

describe('price-history', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    getDb();
  });

  afterEach(() => {
    closeDb();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  describe('getConfig', () => {
    it('returns default config with seeded destinations', () => {
      const config = getConfig();
      expect(config.homeAirport).toBe('BER');
      expect(config.destinations).toEqual(['JFK', 'LIS', 'BKK']);
      expect(config.trmnlWebhookUrl).toBeNull();
    });
  });

  describe('setHomeAirport', () => {
    it('sets and retrieves home airport', () => {
      setHomeAirport('JFK');
      const config = getConfig();
      expect(config.homeAirport).toBe('JFK');
    });

    it('overwrites existing home airport', () => {
      setHomeAirport('JFK');
      setHomeAirport('LHR');
      const config = getConfig();
      expect(config.homeAirport).toBe('LHR');
    });
  });

  describe('addDestination / removeDestination', () => {
    it('adds valid destination', () => {
      const result = addDestination('JFK');
      expect(result).toBe(true);
      expect(getDestinations()).toContain('JFK');
    });

    it('rejects invalid airport code', () => {
      const result = addDestination('XXX');
      expect(result).toBe(false);
    });

    it('removes destination', () => {
      addDestination('JFK');
      const removed = removeDestination('JFK');
      expect(removed).toBe(true);
      expect(getDestinations()).not.toContain('JFK');
    });

    it('handles duplicate adds gracefully', () => {
      addDestination('JFK');
      const result = addDestination('JFK');
      expect(result).toBe(true);
      expect(getDestinations().filter(d => d === 'JFK')).toHaveLength(1);
    });
  });

  describe('recordPrice / getPriceHistory', () => {
    it('records and retrieves price', () => {
      addDestination('LIS');
      recordPrice('LIS', 180, 'EUR', 'TAP', 'Google Flights');
      
      const history = getPriceHistory('LIS');
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].price).toBe(180);
      expect(history[0].airline).toBe('TAP');
    });

    it('returns empty array for unknown destination', () => {
      const history = getPriceHistory('XXX');
      expect(history).toHaveLength(0);
    });
  });

  describe('getDestinationWithPrices', () => {
    it('returns destination with mock data when no history', () => {
      const dest = getDestinationWithPrices('BER', 'JFK');
      
      expect(dest.code).toBe('JFK');
      expect(dest.name).toBe('New York');
      expect(dest.currentPrice).toBeGreaterThan(0);
      expect(dest.trend).toBeDefined();
    });

    it('uses real history when available', () => {
      addDestination('LIS');
      recordPrice('LIS', 150, 'EUR', 'TAP', 'Skyscanner');
      
      const dest = getDestinationWithPrices('BER', 'LIS');
      expect(dest.currentPrice).toBe(150);
      expect(dest.bestAirline).toBe('TAP');
    });
  });
});
