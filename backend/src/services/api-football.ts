"use server";

import axios from "axios";
import axiosRetry from "axios-retry";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || "api-football-v1.p.rapidapi.com";
const RAPIDAPI_FOOTBALL_ENDPOINT = process.env.RAPIDAPI_FOOTBALL_ENDPOINT || "https://api-football-v1.p.rapidapi.com";

const apiFootballClient = axios.create({
  baseURL: RAPIDAPI_FOOTBALL_ENDPOINT,
  headers: {
    "x-rapidapi-key": RAPIDAPI_KEY,
    "x-rapidapi-host": RAPIDAPI_HOST,
  },
  timeout: 10000,
});

// Retry logic for API failures
axiosRetry(apiFootballClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response?.status ?? 0) >= 500;
  },
});

export interface ApiFootballFixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    status: {
      short: string;
      elapsed: number | null;
    };
    venue: { name: string | null; city: string | null };
  };
  league: {
    id: number;
    name: string;
    country: string;
    season: number;
    logo: string;
    flag: string | null;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}

export interface ApiFootballStanding {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
}

export interface ApiFootballH2H {
  fixture: {
    id: number;
    date: string;
    timestamp: number;
  };
  league: { name: string };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
}

export interface ApiFootballInjury {
  player: { id: number; name: string; photo: string };
  team: { id: number; name: string; logo: string };
  fixture: { id: number; date: string };
  league: { id: number };
  type: string;
  reason: string;
}

export interface ApiFootballStatistic {
  team: { id: number; name: string; logo: string };
  statistics: Array<{ type: string; value: string | number | null }>;
}

/**
 * Fetch fixtures by date range
 */
export async function getFixtures(
  date: string,
  league?: number,
  season?: number,
  status?: string
): Promise<ApiFootballFixture[]> {
  const params: Record<string, string | number> = { date };
  if (league) params.league = league;
  if (season) params.season = season;
  if (status) params.status = status;

  const response = await apiFootballClient.get("/fixtures", { params });
  return response.data.response || [];
}

/**
 * Fetch fixture by ID with all details
 */
export async function getFixtureById(fixtureId: number): Promise<ApiFootballFixture | null> {
  const response = await apiFootballClient.get("/fixtures", {
    params: { id: fixtureId },
  });
  const data = response.data.response;
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Fetch league standings
 */
export async function getStandings(
  league: number,
  season: number
): Promise<ApiFootballStanding[]> {
  const response = await apiFootballClient.get("/standings", {
    params: { league, season },
  });
  const data = response.data.response;
  return data && data.length > 0 ? data[0].league.standings[0] : [];
}

/**
 * Fetch head-to-head between two teams
 */
export async function getHeadToHead(
  team1Id: number,
  team2Id: number,
  last: number = 10
): Promise<ApiFootballH2H[]> {
  const h2h = `${team1Id}-${team2Id}`;
  const response = await apiFootballClient.get("/fixtures/headtohead", {
    params: { h2h, last },
  });
  return response.data.response || [];
}

/**
 * Fetch team injuries
 */
export async function getInjuries(
  team: number,
  fixture?: number
): Promise<ApiFootballInjury[]> {
  const params: Record<string, number> = { team };
  if (fixture) params.fixture = fixture;

  const response = await apiFootballClient.get("/injuries", { params });
  return response.data.response || [];
}

/**
 * Fetch fixture statistics
 */
export async function getFixtureStatistics(
  fixture: number,
  team?: number
): Promise<ApiFootballStatistic[]> {
  const params: Record<string, number> = { fixture };
  if (team) params.team = team;

  const response = await apiFootballClient.get("/fixtures/statistics", { params });
  return response.data.response || [];
}

/**
 * Fetch team form (last N fixtures)
 */
export async function getTeamForm(
  teamId: number,
  last: number = 5,
  season?: number
): Promise<ApiFootballFixture[]> {
  const params: Record<string, number> = { team: teamId, last };
  if (season) params.season = season;

  const response = await apiFootballClient.get("/fixtures", { params });
  return response.data.response || [];
}

/**
 * Fetch all available leagues
 */
export async function getLeagues(
  season?: number,
  country?: string
): Promise<any[]> {
  const params: Record<string, string | number> = {};
  if (season) params.season = season;
  if (country) params.country = country;

  const response = await apiFootballClient.get("/leagues", { params });
  return response.data.response || [];
}

/**
 * Fetch live fixtures
 */
export async function getLiveFixtures(): Promise<ApiFootballFixture[]> {
  const response = await apiFootballClient.get("/fixtures", {
    params: { live: "all" },
  });
  return response.data.response || [];
}
