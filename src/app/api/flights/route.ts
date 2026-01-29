import { NextRequest, NextResponse } from 'next/server';
import {
  MOCK_SERPAPI_FLIGHT,
  generatePriceHistory,
  calculateTrend,
} from '@/lib/mock-flight-data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fromParam = searchParams.get('from')?.toUpperCase();
  const toParam = searchParams.get('to')?.toUpperCase();
  const date = searchParams.get('date');
  const history = searchParams.get('history') === 'true';

  const firstFlight = MOCK_SERPAPI_FLIGHT.flights[0];
  const lastFlight = MOCK_SERPAPI_FLIGHT.flights[MOCK_SERPAPI_FLIGHT.flights.length - 1];
  const from = firstFlight.departure_airport;
  const to = lastFlight.arrival_airport;

  if (history) {
    const prices = generatePriceHistory(from.id, to.id, 30);
    const trend = calculateTrend(prices);

    return NextResponse.json({
      from,
      to,
      current: prices[prices.length - 1],
      trend,
      history: prices,
    });
  }

  return NextResponse.json({
    from,
    to,
    date: date || null,
    flight: MOCK_SERPAPI_FLIGHT,
  });
}
