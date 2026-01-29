import { getDb, seedDefaultsForUser } from './db';
import type { PriceHistory, AppConfig, Destination } from '@/types';
import {
  generateFlightPrice,
  generatePriceHistory,
  calculateTrend,
  getAirportByCode,
} from './mock-flight-data';

export function getConfig(userId: string): AppConfig {
  const db = getDb();
  seedDefaultsForUser(userId);
  
  const homeRow = db.prepare('SELECT value FROM config WHERE user_id = ? AND key = ?').get(userId, 'home_airport') as { value: string } | undefined;
  const webhookRow = db.prepare('SELECT value FROM config WHERE user_id = ? AND key = ?').get(userId, 'trmnl_webhook_url') as { value: string } | undefined;
  
  const destinations = db.prepare('SELECT code FROM destinations WHERE user_id = ? ORDER BY added_at').all(userId) as { code: string }[];
  
  return {
    homeAirport: homeRow?.value || 'BER',
    destinations: destinations.map(d => d.code),
    trmnlWebhookUrl: webhookRow?.value || null,
  };
}

export function setHomeAirport(userId: string, code: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO config (user_id, key, value) VALUES (?, 'home_airport', ?)
    ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value
  `).run(userId, code);
}

export function setTrmnlWebhookUrl(userId: string, url: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO config (user_id, key, value) VALUES (?, 'trmnl_webhook_url', ?)
    ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value
  `).run(userId, url);
}

export function addDestination(userId: string, code: string): boolean {
  const db = getDb();
  const airport = getAirportByCode(code);
  if (!airport) return false;
  
  try {
    db.prepare('INSERT OR IGNORE INTO destinations (user_id, code) VALUES (?, ?)').run(userId, code);
    return true;
  } catch {
    return false;
  }
}

export function removeDestination(userId: string, code: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM destinations WHERE user_id = ? AND code = ?').run(userId, code);
  return result.changes > 0;
}

export function getDestinations(userId: string): string[] {
  const db = getDb();
  const rows = db.prepare('SELECT code FROM destinations WHERE user_id = ? ORDER BY added_at').all(userId) as { code: string }[];
  return rows.map(r => r.code);
}

export function recordPrice(
  userId: string,
  destinationCode: string,
  price: number,
  currency: string,
  airline: string,
  bookingSite: string
): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO price_history (user_id, destination_code, price, currency, airline, booking_site)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, destinationCode, price, currency, airline, bookingSite);
}

export function getPriceHistory(userId: string, destinationCode: string, days: number = 30): PriceHistory[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, destination_code as destinationCode, price, airline, booking_site as bookingSite, recorded_at as timestamp
    FROM price_history
    WHERE user_id = ? AND destination_code = ?
    AND recorded_at >= datetime('now', '-' || ? || ' days')
    ORDER BY recorded_at ASC
  `).all(userId, destinationCode, days) as PriceHistory[];
  
  return rows;
}

export function getDestinationWithPrices(userId: string, homeAirport: string, destinationCode: string): Destination {
  const airport = getAirportByCode(destinationCode);
  const dbHistory = getPriceHistory(userId, destinationCode, 30);
  
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

export function refreshPrices(userId: string, homeAirport: string): void {
  const destinations = getDestinations(userId);
  
  for (const dest of destinations) {
    const price = generateFlightPrice(homeAirport, dest);
    recordPrice(userId, dest, price.price, price.currency, price.airline, price.bookingSite);
  }
}
