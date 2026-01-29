import { NextRequest, NextResponse } from 'next/server';
import {
  getConfig,
  setHomeAirport,
  setTrmnlWebhookUrl,
  addDestination,
  removeDestination,
  getDestinationWithPrices,
} from '@/lib/price-history';

export async function GET() {
  const config = getConfig();
  
  const destinations = config.destinations.map((code) =>
    getDestinationWithPrices(config.homeAirport, code)
  );

  return NextResponse.json({
    ...config,
    destinations,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, ...data } = body;

  switch (action) {
    case 'setHomeAirport':
      setHomeAirport(data.code);
      return NextResponse.json({ success: true });

    case 'setWebhookUrl':
      setTrmnlWebhookUrl(data.url);
      return NextResponse.json({ success: true });

    case 'addDestination':
      const added = addDestination(data.code);
      if (!added) {
        return NextResponse.json(
          { error: 'Invalid airport code' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true });

    case 'removeDestination':
      removeDestination(data.code);
      return NextResponse.json({ success: true });

    default:
      return NextResponse.json(
        { error: 'Unknown action' },
        { status: 400 }
      );
  }
}
