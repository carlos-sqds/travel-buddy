import { NextRequest, NextResponse } from 'next/server';
import {
  generateFlightPrice,
  generatePriceHistory,
  calculateTrend,
  getAirportByCode,
} from '@/lib/mock-flight-data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from')?.toUpperCase();
  const to = searchParams.get('to')?.toUpperCase();
  const history = searchParams.get('history') === 'true';

  if (!from || !to) {
    return NextResponse.json(
      { error: 'Missing required parameters: from and to' },
      { status: 400 }
    );
  }

  const fromAirport = getAirportByCode(from);
  const toAirport = getAirportByCode(to);

  if (!fromAirport) {
    return NextResponse.json(
      { error: `Unknown airport code: ${from}` },
      { status: 400 }
    );
  }

  if (!toAirport) {
    return NextResponse.json(
      { error: `Unknown airport code: ${to}` },
      { status: 400 }
    );
  }

  if (history) {
    const prices = generatePriceHistory(from, to, 30);
    const trend = calculateTrend(prices);
    
    return NextResponse.json({
      from: fromAirport,
      to: toAirport,
      current: prices[prices.length - 1],
      trend,
      history: prices,
    });
  }

  const price = generateFlightPrice(from, to);
  
  return NextResponse.json({
    from: fromAirport,
    to: toAirport,
    price,
  });
}
