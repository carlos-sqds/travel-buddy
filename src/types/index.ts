export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface FlightPrice {
  id: string;
  from: string;
  to: string;
  price: number;
  currency: string;
  airline: string;
  bookingSite: string;
  timestamp: string;
}

export interface Destination {
  id: string;
  code: string;
  name: string;
  currentPrice: number | null;
  trend: string | null;
  bestAirline: string | null;
  bestSite: string | null;
  lastUpdated: string | null;
}

export interface PriceHistory {
  id: number;
  destinationCode: string;
  price: number;
  airline: string;
  bookingSite: string;
  timestamp: string;
}

export interface TrmnlPayload {
  merge_variables: {
    home_airport: string;
    last_updated: string;
    destinations: TrmnlDestination[];
  };
}

export interface TrmnlDestination {
  code: string;
  name: string;
  current_price: number;
  currency: string;
  trend: string;
  best_airline: string;
  best_site: string;
  chart_url: string;
}

export interface AppConfig {
  homeAirport: string;
  destinations: string[];
  trmnlWebhookUrl: string | null;
}
