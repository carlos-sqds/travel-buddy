import { NextRequest, NextResponse } from 'next/server';
import { fetchFlights } from '@/lib/serpapi';
import { MOCK_SERPAPI_FLIGHT } from '@/lib/mock-flight-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  const searchParams = request.nextUrl.searchParams;
  const fromParam = searchParams.get('from')?.toUpperCase();
  const toParam = searchParams.get('to')?.toUpperCase();
  const date = searchParams.get('date');

  const flight = await fetchFlights(
    fromParam || undefined,
    toParam || undefined,
    date || undefined
  );
  const flightData = flight || MOCK_SERPAPI_FLIGHT;

  const firstFlight = flightData.flights[0];
  const lastFlight = flightData.flights[flightData.flights.length - 1];

  return NextResponse.json({
    uuid,
    from: firstFlight.departure_airport,
    to: lastFlight.arrival_airport,
    date: date || '2026-03-03',
    flight: flightData,
  });
}
