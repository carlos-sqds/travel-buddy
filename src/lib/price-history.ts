import { getDb, seedDefaults } from './db';
import type { PriceHistory, AppConfig, Destination } from '@/types';
import {
  generateFlightPrice,
  generatePriceHistory,
  calculateTrend,
  getAirportByCode,
} from './mock-flight-data';

export function getConfig(): AppConfig {
  const db = getDb();
  seedDefaults();
  
  const homeRow = db.prepare('SELECT value FROM config WHERE key = ?').get('home_airport') as { value: string } | undefined;
  const webhookRow = db.prepare('SELECT value FROM config WHERE key = ?').get('trmnl_webhook_url') as { value: string } | undefined;
  
  const destinations = db.prepare('SELECT code FROM destinations ORDER BY added_at').all() as { code: string }[];
  
  return {
    homeAirport: homeRow?.value || 'BER',
    destinations: destinations.map(d => d.code),
    trmnlWebhookUrl: webhookRow?.value || null,
  };
}

export function setHomeAirport(code: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO config (key, value) VALUES ('home_airport', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(code);
}

export function setTrmnlWebhookUrl(url: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO config (key, value) VALUES ('trmnl_webhook_url', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(url);
}

export function addDestination(code: string): boolean {
  const db = getDb();
  const airport = getAirportByCode(code);
  if (!airport) return false;
  
  try {
    db.prepare('INSERT OR IGNORE INTO destinations (code) VALUES (?)').run(code);
    return true;
  } catch {
    return false;
  }
}

export function removeDestination(code: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM destinations WHERE code = ?').run(code);
  return result.changes > 0;
}

export function getDestinations(): string[] {
  const db = getDb();
  const rows = db.prepare('SELECT code FROM destinations ORDER BY added_at').all() as { code: string }[];
  return rows.map(r => r.code);
}

export function recordPrice(
  destinationCode: string,
  price: number,
  currency: string,
  airline: string,
  bookingSite: string
): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO price_history (destination_code, price, currency, airline, booking_site)
    VALUES (?, ?, ?, ?, ?)
  `).run(destinationCode, price, currency, airline, bookingSite);
}

export function getPriceHistory(destinationCode: string, days: number = 30): PriceHistory[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, destination_code as destinationCode, price, airline, booking_site as bookingSite, recorded_at as timestamp
    FROM price_history
    WHERE destination_code = ?
    AND recorded_at >= datetime('now', '-' || ? || ' days')
    ORDER BY recorded_at ASC
  `).all(destinationCode, days) as PriceHistory[];
  
  return rows;
}

export function getDestinationWithPrices(homeAirport: string, destinationCode: string): Destination {
  const airport = getAirportByCode(destinationCode);
  const dbHistory = getPriceHistory(destinationCode, 30);
  
  let currentPrice: number | null = null;
  let trend: string | null = null;
  let bestAirline: string | null = null;
  let bestSite: string | null = null;
  let lastUpdated: string | null = null;

  if (dbHistory.length > 0) {
    const latest = dbHistory[dbHistory.length - 1];
    currentPrice = latest.price;
    bestAirline = latest.airline;
    bestSite = latest.bookingSite;
    lastUpdated = latest.timestamp;
    
    if (dbHistory.length >= 2) {
      const weekAgo = dbHistory[Math.max(0, dbHistory.length - 7)];
      const change = ((currentPrice - weekAgo.price) / weekAgo.price) * 100;
      const arrow = change < 0 ? '↓' : change > 0 ? '↑' : '';
      trend = `${arrow} ${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
    }
  } else {
    const mockHistory = generatePriceHistory(homeAirport, destinationCode, 30);
    const latest = mockHistory[mockHistory.length - 1];
    currentPrice = latest.price;
    bestAirline = latest.airline;
    bestSite = latest.bookingSite;
    lastUpdated = latest.timestamp;
    trend = calculateTrend(mockHistory);
  }

  return {
    id: destinationCode,
    code: destinationCode,
    name: airport?.city || destinationCode,
    currentPrice,
    trend,
    bestAirline,
    bestSite,
    lastUpdated,
  };
}

export function refreshPrices(homeAirport: string): void {
  const destinations = getDestinations();
  
  for (const dest of destinations) {
    const price = generateFlightPrice(homeAirport, dest);
    recordPrice(dest, price.price, price.currency, price.airline, price.bookingSite);
  }
}
