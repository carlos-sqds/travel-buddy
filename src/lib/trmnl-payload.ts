import type { TrmnlPayload, TrmnlDestination, Destination } from '@/types';
import { getAirportByCode } from './mock-flight-data';

export function generateChartUrl(
  destinationCode: string,
  prices: number[]
): string {
  if (prices.length === 0) return '';

  const labels = prices.map((_, i) => `Day ${i + 1}`);
  const chartConfig = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Price (EUR)',
          data: prices,
          fill: false,
          borderColor: '#4ade80',
          tension: 0.1,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: false },
      },
    },
  };

  const encoded = encodeURIComponent(JSON.stringify(chartConfig));
  return `https://quickchart.io/chart?c=${encoded}&w=400&h=150&bkg=white`;
}

export function destinationToTrmnl(
  destination: Destination,
  historicalPrices: number[] = []
): TrmnlDestination {
  const airport = getAirportByCode(destination.code);
  
  return {
    code: destination.code,
    name: airport?.city || destination.name || destination.code,
    current_price: destination.currentPrice || 0,
    currency: 'EUR',
    trend: destination.trend || '0%',
    best_airline: destination.bestAirline || 'Unknown',
    best_site: destination.bestSite || 'Unknown',
    chart_url: generateChartUrl(destination.code, historicalPrices),
  };
}

export function buildTrmnlPayload(
  homeAirport: string,
  destinations: Destination[],
  priceHistories: Map<string, number[]>
): TrmnlPayload {
  const airport = getAirportByCode(homeAirport);
  
  return {
    merge_variables: {
      home_airport: airport ? `${homeAirport} (${airport.city})` : homeAirport,
      last_updated: new Date().toISOString(),
      destinations: destinations.map((dest) =>
        destinationToTrmnl(dest, priceHistories.get(dest.code) || [])
      ),
    },
  };
}

export function validateTrmnlPayload(payload: TrmnlPayload): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!payload.merge_variables) {
    errors.push('Missing merge_variables');
    return { valid: false, errors };
  }

  const mv = payload.merge_variables;

  if (!mv.home_airport) {
    errors.push('Missing home_airport');
  }

  if (!mv.last_updated) {
    errors.push('Missing last_updated');
  }

  if (!Array.isArray(mv.destinations)) {
    errors.push('destinations must be an array');
  } else {
    mv.destinations.forEach((dest, i) => {
      if (!dest.code) errors.push(`Destination ${i}: missing code`);
      if (typeof dest.current_price !== 'number') {
        errors.push(`Destination ${i}: invalid current_price`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
