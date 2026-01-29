import { NextResponse } from 'next/server';
import { getConfig, getDestinationWithPrices, getPriceHistory } from '@/lib/price-history';
import { buildTrmnlPayload } from '@/lib/trmnl-payload';
import { generatePriceHistory } from '@/lib/mock-flight-data';

export async function GET() {
  const config = getConfig();
  
  const destinations = config.destinations.map((code) =>
    getDestinationWithPrices(config.homeAirport, code)
  );

  const priceHistories = new Map<string, number[]>();
  
  for (const code of config.destinations) {
    const dbHistory = getPriceHistory(code, 30);
    
    if (dbHistory.length > 0) {
      priceHistories.set(code, dbHistory.map((h) => h.price));
    } else {
      const mockHistory = generatePriceHistory(config.homeAirport, code, 30);
      priceHistories.set(code, mockHistory.map((h) => h.price));
    }
  }

  const payload = buildTrmnlPayload(config.homeAirport, destinations, priceHistories);

  return NextResponse.json(payload);
}
