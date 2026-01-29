import type { FlightPrice, Airport } from '@/types';

export const AIRPORTS: Airport[] = [
  { code: 'BER', name: 'Berlin Brandenburg', city: 'Berlin', country: 'Germany' },
  { code: 'JFK', name: 'John F. Kennedy', city: 'New York', country: 'USA' },
  { code: 'LHR', name: 'Heathrow', city: 'London', country: 'UK' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
  { code: 'LIS', name: 'Lisbon Portela', city: 'Lisbon', country: 'Portugal' },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand' },
  { code: 'NRT', name: 'Narita', city: 'Tokyo', country: 'Japan' },
  { code: 'SIN', name: 'Changi', city: 'Singapore', country: 'Singapore' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
  { code: 'SFO', name: 'San Francisco', city: 'San Francisco', country: 'USA' },
];

const AIRLINES = [
  'Lufthansa',
  'British Airways',
  'Air France',
  'KLM',
  'United',
  'Delta',
  'Emirates',
  'Singapore Airlines',
  'Thai Airways',
  'Condor',
  'Norse Atlantic',
  'TAP Portugal',
];

const BOOKING_SITES = [
  'Google Flights',
  'Skyscanner',
  'Kayak',
  'Momondo',
  'Direct Airline',
];

const BASE_PRICES: Record<string, number> = {
  'BER-JFK': 450,
  'BER-LHR': 120,
  'BER-CDG': 100,
  'BER-LIS': 180,
  'BER-BKK': 650,
  'BER-NRT': 750,
  'BER-SIN': 700,
  'BER-DXB': 400,
  'BER-SFO': 550,
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDateSeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function getBasePrice(from: string, to: string): number {
  const key = `${from}-${to}`;
  const reverseKey = `${to}-${from}`;
  return BASE_PRICES[key] || BASE_PRICES[reverseKey] || 300;
}

export function generateFlightPrice(
  from: string,
  to: string,
  date?: Date
): FlightPrice {
  const now = date || new Date();
  const seed = getDateSeed(now) + from.charCodeAt(0) + to.charCodeAt(0);
  
  const basePrice = getBasePrice(from, to);
  const variation = (seededRandom(seed) - 0.5) * 0.3;
  const price = Math.round(basePrice * (1 + variation));
  
  const airlineIndex = Math.floor(seededRandom(seed + 1) * AIRLINES.length);
  const siteIndex = Math.floor(seededRandom(seed + 2) * BOOKING_SITES.length);
  
  return {
    id: `${from}-${to}-${now.toISOString()}`,
    from,
    to,
    price,
    currency: 'EUR',
    airline: AIRLINES[airlineIndex],
    bookingSite: BOOKING_SITES[siteIndex],
    timestamp: now.toISOString(),
  };
}

export function generatePriceHistory(
  from: string,
  to: string,
  days: number = 30
): FlightPrice[] {
  const history: FlightPrice[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    history.push(generateFlightPrice(from, to, date));
  }
  
  return history;
}

export function calculateTrend(prices: FlightPrice[]): string {
  if (prices.length < 2) return '0%';
  
  const recent = prices[prices.length - 1].price;
  const weekAgo = prices[Math.max(0, prices.length - 7)].price;
  
  const change = ((recent - weekAgo) / weekAgo) * 100;
  const arrow = change < 0 ? '↓' : change > 0 ? '↑' : '';
  
  return `${arrow} ${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
}

export function getAirportByCode(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code);
}

export function searchAirports(query: string): Airport[] {
  const q = query.toLowerCase();
  return AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q)
  );
}
