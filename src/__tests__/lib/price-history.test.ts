import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getDb, closeDb, createUser } from '@/lib/db';
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
const TEST_USER_ID = 'test-user-123';

describe('price-history', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    getDb();
    createUser(TEST_USER_ID);
  });

  afterEach(() => {
    closeDb();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  describe('getConfig', () => {
    it('returns default config with seeded destinations', () => {
      const config = getConfig(TEST_USER_ID);
      expect(config.homeAirport).toBe('BER');
      expect(config.destinations).toEqual(['JFK', 'LIS', 'BKK']);
      expect(config.trmnlWebhookUrl).toBeNull();
    });
  });

  describe('setHomeAirport', () => {
    it('sets and retrieves home airport', () => {
      setHomeAirport(TEST_USER_ID, 'JFK');
      const config = getConfig(TEST_USER_ID);
      expect(config.homeAirport).toBe('JFK');
    });

    it('overwrites existing home airport', () => {
      setHomeAirport(TEST_USER_ID, 'JFK');
      setHomeAirport(TEST_USER_ID, 'LHR');
      const config = getConfig(TEST_USER_ID);
      expect(config.homeAirport).toBe('LHR');
    });
  });

  describe('addDestination / removeDestination', () => {
    it('adds valid destination', () => {
      const result = addDestination(TEST_USER_ID, 'SFO');
      expect(result).toBe(true);
      expect(getDestinations(TEST_USER_ID)).toContain('SFO');
    });

    it('rejects invalid airport code', () => {
      const result = addDestination(TEST_USER_ID, 'XXX');
      expect(result).toBe(false);
    });

    it('removes destination', () => {
      addDestination(TEST_USER_ID, 'SFO');
      const removed = removeDestination(TEST_USER_ID, 'SFO');
      expect(removed).toBe(true);
      expect(getDestinations(TEST_USER_ID)).not.toContain('SFO');
    });

    it('handles duplicate adds gracefully', () => {
      addDestination(TEST_USER_ID, 'SFO');
      const result = addDestination(TEST_USER_ID, 'SFO');
      expect(result).toBe(true);
      expect(getDestinations(TEST_USER_ID).filter(d => d === 'SFO')).toHaveLength(1);
    });
  });

  describe('recordPrice / getPriceHistory', () => {
    it('records and retrieves price', () => {
      addDestination(TEST_USER_ID, 'LIS');
      recordPrice(TEST_USER_ID, 'LIS', 180, 'EUR', 'TAP', 'Google Flights');
      
      const history = getPriceHistory(TEST_USER_ID, 'LIS');
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].price).toBe(180);
      expect(history[0].airline).toBe('TAP');
    });

    it('returns empty array for unknown destination', () => {
      const history = getPriceHistory(TEST_USER_ID, 'XXX');
      expect(history).toHaveLength(0);
    });
  });

  describe('getDestinationWithPrices', () => {
    it('returns destination with mock data when no history', () => {
      const dest = getDestinationWithPrices(TEST_USER_ID, 'BER', 'JFK');
      
      expect(dest.code).toBe('JFK');
      expect(dest.name).toBe('New York');
      expect(dest.currentPrice).toBeGreaterThan(0);
      expect(dest.trend).toBeDefined();
    });

    it('uses real history when available', () => {
      addDestination(TEST_USER_ID, 'LIS');
      recordPrice(TEST_USER_ID, 'LIS', 150, 'EUR', 'TAP', 'Skyscanner');
      
      const dest = getDestinationWithPrices(TEST_USER_ID, 'BER', 'LIS');
      expect(dest.currentPrice).toBe(150);
      expect(dest.bestAirline).toBe('TAP');
    });
  });

  describe('user isolation', () => {
    it('isolates data between users', () => {
      const otherUser = 'other-user-456';
      createUser(otherUser);
      
      setHomeAirport(TEST_USER_ID, 'JFK');
      setHomeAirport(otherUser, 'LHR');
      
      expect(getConfig(TEST_USER_ID).homeAirport).toBe('JFK');
      expect(getConfig(otherUser).homeAirport).toBe('LHR');
    });
  });
});
