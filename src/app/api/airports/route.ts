import { NextRequest, NextResponse } from 'next/server';
import { AIRPORTS, searchAirports } from '@/lib/mock-flight-data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (query) {
    const results = searchAirports(query);
    return NextResponse.json({ airports: results });
  }

  return NextResponse.json({ airports: AIRPORTS });
}
