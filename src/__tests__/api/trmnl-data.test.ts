import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getDb, closeDb } from '@/lib/db';
import { addDestination, setHomeAirport } from '@/lib/price-history';
import { buildTrmnlPayload, validateTrmnlPayload } from '@/lib/trmnl-payload';
import { getConfig, getDestinationWithPrices, getPriceHistory } from '@/lib/price-history';
import { generatePriceHistory } from '@/lib/mock-flight-data';

const TEST_DB_PATH = path.join(process.cwd(), 'flight-tracker.db');

describe('TRMNL data API logic', () => {
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

  it('generates valid TRMNL payload with default destinations', () => {
    const config = getConfig();
    const destinations = config.destinations.map((code) =>
      getDestinationWithPrices(config.homeAirport, code)
    );
    const payload = buildTrmnlPayload(config.homeAirport, destinations, new Map());

    const validation = validateTrmnlPayload(payload);
    expect(validation.valid).toBe(true);
    expect(payload.merge_variables.destinations).toHaveLength(3);
    expect(payload.merge_variables.destinations.map(d => d.code)).toEqual(['JFK', 'LIS', 'BKK']);
  });

  it('generates valid TRMNL payload with destinations', () => {
    setHomeAirport('BER');
    addDestination('JFK');
    addDestination('LIS');

    const config = getConfig();
    const destinations = config.destinations.map((code) =>
      getDestinationWithPrices(config.homeAirport, code)
    );

    const priceHistories = new Map<string, number[]>();
    for (const code of config.destinations) {
      const mockHistory = generatePriceHistory(config.homeAirport, code, 30);
      priceHistories.set(code, mockHistory.map((h) => h.price));
    }

    const payload = buildTrmnlPayload(config.homeAirport, destinations, priceHistories);

    const validation = validateTrmnlPayload(payload);
    expect(validation.valid).toBe(true);
    expect(payload.merge_variables.destinations).toHaveLength(2);
    expect(payload.merge_variables.home_airport).toContain('BER');
  });

  it('includes chart URLs for destinations', () => {
    addDestination('JFK');

    const config = getConfig();
    const destinations = config.destinations.map((code) =>
      getDestinationWithPrices(config.homeAirport, code)
    );

    const priceHistories = new Map<string, number[]>();
    priceHistories.set('JFK', [400, 420, 380, 410, 450]);

    const payload = buildTrmnlPayload(config.homeAirport, destinations, priceHistories);

    expect(payload.merge_variables.destinations[0].chart_url).toContain('quickchart.io');
  });

  it('payload structure matches TRMNL webhook format', () => {
    addDestination('LHR');

    const config = getConfig();
    const destinations = config.destinations.map((code) =>
      getDestinationWithPrices(config.homeAirport, code)
    );
    const priceHistories = new Map<string, number[]>();

    const payload = buildTrmnlPayload(config.homeAirport, destinations, priceHistories);

    expect(payload).toHaveProperty('merge_variables');
    expect(payload.merge_variables).toHaveProperty('home_airport');
    expect(payload.merge_variables).toHaveProperty('last_updated');
    expect(payload.merge_variables).toHaveProperty('destinations');
    
    if (payload.merge_variables.destinations.length > 0) {
      const dest = payload.merge_variables.destinations[0];
      expect(dest).toHaveProperty('code');
      expect(dest).toHaveProperty('name');
      expect(dest).toHaveProperty('current_price');
      expect(dest).toHaveProperty('currency');
      expect(dest).toHaveProperty('trend');
      expect(dest).toHaveProperty('best_airline');
      expect(dest).toHaveProperty('best_site');
      expect(dest).toHaveProperty('chart_url');
    }
  });
});
