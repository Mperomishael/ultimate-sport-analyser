/**
 * League Reliability & Statistical Scoring System
 * Tracks league-specific patterns and predictability metrics
 */

export interface LeagueStats {
  leagueId: number;
  leagueName: string;
  totalPredictions: number;
  successfulPredictions: number;
  winRate: number;
  averageGoals: number;
  goalsVariance: number;
  upsetFrequency: number;
  predictabilityScore: number; // 0-100
  marketReliability: Record<string, number>;
  volatilityIndex: number;
  riskRating: "LOW" | "MEDIUM" | "HIGH";
}

export interface MarketPerformance {
  market: string;
  successRate: number; // 0-1
  totalAttempts: number;
  avgOdds: number;
  expectedValue: number; // ROI expectation
}

export class LeagueReliabilityEngine {
  /**
   * Calculate league reliability score based on historical data
   */
  static calculateLeagueReliability(
    leagueName: string,
    predictions: any[], // Array of past predictions with results
    fixtures: any[] // Array of fixtures in league
  ): LeagueStats {
    if (predictions.length === 0) {
      return this.getDefaultLeagueStats(leagueName, 0);
    }

    // Calculate basic metrics
    const successful = predictions.filter(
      (p) => p.resultStatus === "WON"
    ).length;
    const winRate = successful / predictions.length;

    // Calculate goals statistics
    const allGoals = fixtures
      .filter((f) => f.status === "FT") // Only finished matches
      .map((f) => (f.homeGoals || 0) + (f.awayGoals || 0));

    const averageGoals =
      allGoals.length > 0 ? allGoals.reduce((a, b) => a + b, 0) / allGoals.length : 0;
    const variance =
      allGoals.length > 0
        ? allGoals.reduce((sum, g) => sum + Math.pow(g - averageGoals, 2), 0) /
          allGoals.length
        : 0;
    const goalsVariance = Math.sqrt(variance);

    // Detect upsets (draw in win-heavy leagues, underdog wins, etc.)
    const expectedResults = predictions.map((p) => p.recommendedBet);
    const actualResults = predictions.map((p) => p.finalResult);
    const upsets = predictions.filter(
      (p) => !this.isExpectedResult(p.recommendedBet, p.finalResult)
    ).length;
    const upsetFrequency = upsets / predictions.length;

    // Calculate predictability (higher win rate = more predictable)
    const predictabilityScore = Math.min(winRate * 100, 100);

    // Analyze market reliability
    const marketReliability = this.analyzeMarketPerformance(predictions);

    // Calculate volatility index (higher variance = higher volatility)
    const volatilityIndex = Math.min(goalsVariance / 2, 1); // Normalize to 0-1

    // Determine risk rating
    const riskRating = this.determineRiskRating(
      winRate,
      upsetFrequency,
      volatilityIndex
    );

    return {
      leagueId: 0, // Would be populated with actual ID
      leagueName,
      totalPredictions: predictions.length,
      successfulPredictions: successful,
      winRate,
      averageGoals,
      goalsVariance,
      upsetFrequency,
      predictabilityScore,
      marketReliability,
      volatilityIndex,
      riskRating,
    };
  }

  /**
   * Analyze performance by market type
   */
  private static analyzeMarketPerformance(
    predictions: any[]
  ): Record<string, number> {
    const markets = new Map<string, { won: number; total: number }>();

    predictions.forEach((p) => {
      if (!markets.has(p.market)) {
        markets.set(p.market, { won: 0, total: 0 });
      }
      const stats = markets.get(p.market)!;
      stats.total++;
      if (p.resultStatus === "WON") {
        stats.won++;
      }
    });

    const result: Record<string, number> = {};
    markets.forEach((stats, market) => {
      result[market] = stats.total > 0 ? stats.won / stats.total : 0;
    });

    return result;
  }

  /**
   * Determine if result matches expected outcome
   */
  private static isExpectedResult(expected: string, actual: string): boolean {
    if (!expected || !actual) return false;

    // Normalize for comparison
    const exp = expected.toUpperCase();
    const act = actual.toUpperCase();

    return (
      exp.includes(act.split("_")[0]) ||
      act.includes(exp.split("_")[0])
    );
  }

  /**
   * Determine risk rating for league
   */
  private static determineRiskRating(
    winRate: number,
    upsetFrequency: number,
    volatilityIndex: number
  ): "LOW" | "MEDIUM" | "HIGH" {
    // High wins + low upsets + low volatility = LOW risk
    if (winRate > 0.65 && upsetFrequency < 0.2 && volatilityIndex < 0.4) {
      return "LOW";
    }

    // Low wins + high upsets + high volatility = HIGH risk
    if (winRate < 0.55 && upsetFrequency > 0.35 && volatilityIndex > 0.6) {
      return "HIGH";
    }

    return "MEDIUM";
  }

  /**
   * Get default stats for new leagues (conservative)
   */
  private static getDefaultLeagueStats(
    leagueName: string,
    leagueId: number
  ): LeagueStats {
    return {
      leagueId,
      leagueName,
      totalPredictions: 0,
      successfulPredictions: 0,
      winRate: 0.5,
      averageGoals: 2.7,
      goalsVariance: 1.0,
      upsetFrequency: 0.25,
      predictabilityScore: 50,
      marketReliability: {},
      volatilityIndex: 0.5,
      riskRating: "MEDIUM",
    };
  }

  /**
   * Filter leagues by reliability score for SAFE mode
   */
  static filterSafeLeagues(
    leagues: LeagueStats[],
    minReliabilityScore: number = 70
  ): LeagueStats[] {
    return leagues.filter(
      (league) =>
        league.riskRating !== "HIGH" &&
        league.predictabilityScore >= minReliabilityScore
    );
  }

  /**
   * Get league recommendation for a specific market
   */
  static getMarketRecommendation(
    league: LeagueStats,
    market: string
  ): { recommended: boolean; confidence: number; reason: string } {
    const marketSuccess = league.marketReliability[market];

    if (!marketSuccess) {
      return {
        recommended: false,
        confidence: 0,
        reason: `No historical data for ${market} in ${league.leagueName}`,
      };
    }

    const confidence = Math.min(marketSuccess * 100, 100);
    const recommended = marketSuccess > 0.65 && league.riskRating !== "HIGH";

    const reason = recommended
      ? `${market} has ${(marketSuccess * 100).toFixed(1)}% success rate in ${league.leagueName}`
      : `${market} underperforms (${(marketSuccess * 100).toFixed(1)}% success) in ${league.leagueName} - risky`;

    return {
      recommended,
      confidence,
      reason,
    };
  }

  /**
   * Estimate probability of specific outcome type
   */
  static estimateOutcomeProbability(
    league: LeagueStats,
    outcomeType: "over15" | "under45" | "doubleChance" | "btts"
  ): number {
    // Use league averages to estimate
    const baselineMap: Record<string, number> = {
      over15: 0.85, // Most matches have >1.5 goals
      under45: 0.65, // Most matches have <4.5 goals
      doubleChance: 0.88, // Non-draw or specific team win
      btts: 0.60, // Depends heavily on league
    };

    let estimate = baselineMap[outcomeType] || 0.5;

    // Adjust based on league characteristics
    if (league.averageGoals > 3) {
      if (outcomeType === "over15") estimate = Math.min(0.95, estimate + 0.1);
      if (outcomeType === "under45") estimate = Math.max(0.5, estimate - 0.15);
    } else if (league.averageGoals < 2.5) {
      if (outcomeType === "under45") estimate = Math.min(0.85, estimate + 0.2);
      if (outcomeType === "over15") estimate = Math.max(0.75, estimate - 0.1);
    }

    return Math.max(0.1, Math.min(estimate, 0.95));
  }
}
