interface FlightCache {
  data: SerpApiFlightResponse;
  timestamp: number;
  key: string;
}

const cache: Map<string, FlightCache> = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface SerpApiFlight {
  departure_airport: {
    name: string;
    id: string;
    time: string;
  };
  arrival_airport: {
    name: string;
    id: string;
    time: string;
  };
  duration: number;
  airplane: string;
  airline: string;
  airline_logo: string;
  travel_class: string;
  flight_number: string;
  legroom: string;
  extensions: string[];
  overnight?: boolean;
}

export interface SerpApiLayover {
  duration: number;
  name: string;
  id: string;
}

export interface SerpApiBestFlight {
  flights: SerpApiFlight[];
  layovers: SerpApiLayover[];
  total_duration: number;
  carbon_emissions: {
    this_flight: number;
    typical_for_this_route: number;
    difference_percent: number;
  };
  price: number;
  type: string;
  airline_logo: string;
  booking_token: string;
}

export interface SerpApiFlightResponse {
  best_flights: SerpApiBestFlight[];
  other_flights?: SerpApiBestFlight[];
}

const DEFAULT_FROM = 'BER';
const DEFAULT_TO = 'ICN';
const DEFAULT_DATE = '2026-03-03';

function getCacheKey(from: string, to: string, date: string): string {
  return `${from}-${to}-${date}`;
}

export async function fetchFlights(
  from?: string,
  to?: string,
  date?: string
): Promise<SerpApiBestFlight | null> {
  const departure = from || DEFAULT_FROM;
  const arrival = to || DEFAULT_TO;
  const outboundDate = date || DEFAULT_DATE;
  const cacheKey = getCacheKey(departure, arrival, outboundDate);

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[SerpApi] Cache hit for ${cacheKey}`);
    return cached.data.best_flights[0] || null;
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error('[SerpApi] SERPAPI_KEY not configured');
    return null;
  }

  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google_flights');
  url.searchParams.set('departure_id', departure);
  url.searchParams.set('arrival_id', arrival);
  url.searchParams.set('outbound_date', outboundDate);
  url.searchParams.set('currency', 'USD');
  url.searchParams.set('type', '2'); // One-way
  url.searchParams.set('api_key', apiKey);

  console.log(`[SerpApi] Fetching flights ${departure} -> ${arrival} on ${outboundDate}`);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error(`[SerpApi] API error: ${response.status}`);
      return null;
    }

    const data: SerpApiFlightResponse = await response.json();

    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      key: cacheKey,
    });

    console.log(`[SerpApi] Cached ${data.best_flights?.length || 0} flights for ${cacheKey}`);
    return data.best_flights?.[0] || null;
  } catch (error) {
    console.error('[SerpApi] Fetch error:', error);
    return null;
  }
}
