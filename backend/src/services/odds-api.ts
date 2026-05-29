"use server";

import axios from "axios";
import axiosRetry from "axios-retry";

const THE_ODDS_API_KEY = process.env.THE_ODDS_API_KEY;
const THE_ODDS_API_BASE = "https://api.the-odds-api.com/v4";

const oddsApiClient = axios.create({
  baseURL: THE_ODDS_API_BASE,
  timeout: 10000,
});

axiosRetry(oddsApiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response?.status ?? 0) >= 500;
  },
});

export interface OddsApiMarket {
  key: string;
  outcomes: Array<{
    name: string;
    price: number;
    point?: number;
  }>;
}

export interface OddsApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsApiMarket[];
}

export interface OddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

export interface OddsApiSport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

/**
 * Fetch available sports
 */
export async function getSports(): Promise<OddsApiSport[]> {
  const response = await oddsApiClient.get("/sports", {
    params: { apiKey: THE_ODDS_API_KEY },
  });
  return response.data || [];
}

/**
 * Fetch odds for a specific sport/region
 */
export async function getOdds(
  sport: string = "soccer_epl",
  regions: string = "eu",
  markets: string = "h2h,totals,btts",
  oddsFormat: string = "decimal",
  dateFormat: string = "iso"
): Promise<OddsApiEvent[]> {
  const response = await oddsApiClient.get(`/sports/${sport}/odds`, {
    params: {
      apiKey: THE_ODDS_API_KEY,
      regions,
      markets,
      oddsFormat,
      dateFormat,
    },
  });
  return response.data || [];
}

/**
 * Fetch odds for a specific event
 */
export async function getEventOdds(
  eventId: string,
  sport: string = "soccer_epl",
  regions: string = "eu",
  markets: string = "h2h,totals,btts"
): Promise<OddsApiEvent | null> {
  const response = await oddsApiClient.get(`/sports/${sport}/events/${eventId}/odds`, {
    params: {
      apiKey: THE_ODDS_API_KEY,
      regions,
      markets,
    },
  });
  return response.data || null;
}

/**
 * Get historical odds (requires paid tier)
 */
export async function getHistoricalOdds(
  sport: string,
  date: string,
  regions: string = "eu"
): Promise<OddsApiEvent[]> {
  const response = await oddsApiClient.get(`/historical/sports/${sport}/odds`, {
    params: {
      apiKey: THE_ODDS_API_KEY,
      regions,
      date,
    },
  });
  return response.data?.data || [];
}

/**
 * Map API-Football fixture to Odds API event for odds lookup
 */
export function mapFixtureToOddsSport(leagueId: number): string {
  const leagueMap: Record<number, string> = {
    39: "soccer_epl",
    40: "soccer_epl",
    140: "soccer_spain_la_liga",
    141: "soccer_spain_la_liga",
    78: "soccer_germany_bundesliga",
    79: "soccer_germany_bundesliga",
    135: "soccer_italy_serie_a",
    136: "soccer_italy_serie_a",
    61: "soccer_france_ligue_one",
    62: "soccer_france_ligue_one",
    2: "soccer_uefa_champs_league",
    3: "soccer_uefa_europa_league",
    848: "soccer_uefa_europa_conference_league",
  };
  return leagueMap[leagueId] || "soccer_epl";
}

/**
 * Extract best odds for a market across all bookmakers
 */
export function extractBestOdds(
  event: OddsApiEvent,
  marketKey: string
): { bookmaker: string; odds: number; selection: string }[] {
  const bestOdds: { bookmaker: string; odds: number; selection: string }[] = [];

  for (const bookmaker of event.bookmakers) {
    const market = bookmaker.markets.find((m) => m.key === marketKey);
    if (market) {
      for (const outcome of market.outcomes) {
        const existing = bestOdds.find((b) => b.selection === outcome.name);
        if (!existing || outcome.price > existing.odds) {
          if (existing) {
            existing.odds = outcome.price;
            existing.bookmaker = bookmaker.title;
          } else {
            bestOdds.push({
              bookmaker: bookmaker.title,
              odds: outcome.price,
              selection: outcome.name,
            });
          }
        }
      }
    }
  }

  return bestOdds;
}
