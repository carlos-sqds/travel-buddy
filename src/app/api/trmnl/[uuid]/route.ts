import { NextRequest, NextResponse } from 'next/server';
import { getDb, userExists } from '@/lib/db';
import { getConfig, getDestinationWithPrices, getPriceHistory } from '@/lib/price-history';
import { buildTrmnlPayload } from '@/lib/trmnl-payload';
import { generatePriceHistory } from '@/lib/mock-flight-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  
  getDb();
  
  if (!userExists(uuid)) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  const config = getConfig(uuid);
  
  const destinations = config.destinations.map((code) =>
    getDestinationWithPrices(uuid, config.homeAirport, code)
  );

  const priceHistories = new Map<string, number[]>();
  
  for (const code of config.destinations) {
    const dbHistory = getPriceHistory(uuid, code, 30);
    
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
