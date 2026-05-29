export interface Fixture {
  id: number;
  date: string;
  timestamp: number;
  status: string;
  elapsed?: number;
  league: League;
  homeTeam: Team;
  awayTeam: Team;
  homeGoals?: number;
  awayGoals?: number;
  venue?: string;
  referee?: string;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo?: string;
  flag?: string;
  season: number;
}

export interface Team {
  id: number;
  name: string;
  logo?: string;
  country?: string;
}

export interface Prediction {
  id: string;
  fixtureId: number;
  fixture: Fixture;
  over15: number;
  over25: number;
  btts: number;
  homeWin: number;
  awayWin: number;
  draw: number;
  doubleChanceHomeDraw: number;
  doubleChanceHomeAway: number;
  doubleChanceDrawAway: number;
  drawNoBetHome: number;
  drawNoBetAway: number;
  overallConfidence: number;
  recommendedBet?: string;
  valueRating?: number;
  status: string;
  createdAt: string;
}

export interface PredictionDetail extends Prediction {
  homeFormScore: number;
  awayFormScore: number;
  h2hScore: number;
  homeAwayScore: number;
  goalsTrendScore: number;
  injuryScore: number;
  oddsMovementScore: number;
  mlProbability?: Record<string, number>;
}

export interface OddsData {
  id: string;
  bookmakerName: string;
  market: string;
  label: string;
  oddValue: number;
  oddChange?: number;
}

export interface TeamForm {
  id: string;
  result: string;
  goalsFor: number;
  goalsAgainst: number;
  venue: string;
  opponentName: string;
  date: string;
}

export interface Standing {
  rank: number;
  team: Team;
  points: number;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDiff: number;
  form?: string;
}

export interface BetSelection {
  id: string;
  fixtureId: number;
  fixture: Fixture;
  market: string;
  selection: string;
  odds: number;
  confidence: number;
  status: string;
}

export interface BetSlip {
  id: string;
  name?: string;
  selections: BetSelection[];
  totalOdds: number;
  stake?: number;
  potentialReturn?: number;
  status: string;
}

export interface AccumulatorConfig {
  targetOdds: number;
  allowedMarkets: string[];
  riskLevel: "low" | "medium" | "high";
  minConfidence: number;
  maxSelections: number;
  dateRange: "today" | "tomorrow" | "week";
  leagues?: number[];
}

export interface ApiUsage {
  id: string;
  provider: string;
  endpoint: string;
  requestsUsed: number;
  requestsRemaining?: number;
  cost: number;
  createdAt: string;
}

export interface PredictionWeight {
  id: string;
  name: string;
  recentForm: number;
  h2h: number;
  homeAwayForm: number;
  goalsTrend: number;
  injuries: number;
  oddsMovement: number;
  standings: number;
  motivation: number;
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: string;
}
