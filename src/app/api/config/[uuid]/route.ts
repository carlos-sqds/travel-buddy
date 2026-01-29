import { NextRequest, NextResponse } from 'next/server';
import {
  getConfig,
  setHomeAirport,
  setTrmnlWebhookUrl,
  addDestination,
  removeDestination,
  getDestinationWithPrices,
} from '@/lib/price-history';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  const config = getConfig(uuid);
  
  const destinations = config.destinations.map((code) =>
    getDestinationWithPrices(uuid, config.homeAirport, code)
  );

  return NextResponse.json({
    ...config,
    destinations,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  const body = await request.json();
  const { action, ...data } = body;

  switch (action) {
    case 'setHomeAirport':
      setHomeAirport(uuid, data.code);
      return NextResponse.json({ success: true });

    case 'setWebhookUrl':
      setTrmnlWebhookUrl(uuid, data.url);
      return NextResponse.json({ success: true });

    case 'addDestination':
      const added = addDestination(uuid, data.code);
      if (!added) {
        return NextResponse.json(
          { error: 'Invalid airport code' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true });

    case 'removeDestination':
      removeDestination(uuid, data.code);
      return NextResponse.json({ success: true });

    default:
      return NextResponse.json(
        { error: 'Unknown action' },
        { status: 400 }
      );
  }
}
