/**
 * Correlation Detection System
 * Identifies and alerts on correlated predictions that increase slip risk
 */

export interface BetSelection {
  fixtureId: number;
  market: string;
  selection: string;
  odds: number;
  confidence: number;
}

export interface CorrelationResult {
  hasHighCorrelation: boolean;
  correlationScore: number; // 0-1
  correlatedPairs: CorrelatedPair[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  recommendation: string;
}

export interface CorrelatedPair {
  pick1: string;
  pick2: string;
  correlationScore: number;
  riskReason: string;
}

export class CorrelationDetectionEngine {
  /**
   * Analyze a bet slip for correlated selections
   */
  static detectCorrelations(selections: BetSelection[]): CorrelationResult {
    const correlatedPairs: CorrelatedPair[] = [];
    let maxCorrelation = 0;

    // Check all pairs
    for (let i = 0; i < selections.length; i++) {
      for (let j = i + 1; j < selections.length; j++) {
        const correlation = this.calculatePairCorrelation(
          selections[i],
          selections[j]
        );

        if (correlation.score > 0.5) {
          correlatedPairs.push({
            pick1: `${selections[i].market} (Fixture ${selections[i].fixtureId})`,
            pick2: `${selections[j].market} (Fixture ${selections[j].fixtureId})`,
            correlationScore: correlation.score,
            riskReason: correlation.reason,
          });

          maxCorrelation = Math.max(maxCorrelation, correlation.score);
        }
      }
    }

    // Determine risk level
    let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (maxCorrelation > 0.8) riskLevel = "HIGH";
    else if (maxCorrelation > 0.6) riskLevel = "MEDIUM";

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      riskLevel,
      correlatedPairs
    );

    return {
      hasHighCorrelation: maxCorrelation > 0.6,
      correlationScore: maxCorrelation,
      correlatedPairs,
      riskLevel,
      recommendation,
    };
  }

  /**
   * Calculate correlation between two individual selections
   */
  private static calculatePairCorrelation(
    sel1: BetSelection,
    sel2: BetSelection
  ): { score: number; reason: string } {
    const reasons: string[] = [];
    let correlationScore = 0;

    // Same fixture = high correlation
    if (sel1.fixtureId === sel2.fixtureId) {
      correlationScore += 0.9;
      reasons.push("Same fixture - outcome failure affects both");
    }

    // Same team exposure (derived from market + fixture analysis)
    const sameTeamScore = this.detectSameTeamExposure(sel1.market, sel2.market);
    if (sameTeamScore > 0) {
      correlationScore += sameTeamScore * 0.5;
      reasons.push("Same team exposure detected");
    }

    // Redundant market selections
    const redundancyScore = this.detectMarketRedundancy(
      sel1.market,
      sel2.market
    );
    if (redundancyScore > 0) {
      correlationScore += redundancyScore * 0.4;
      reasons.push("Redundant market selections");
    }

    // High confidence overlap risk
    if (sel1.confidence > 85 && sel2.confidence > 85) {
      correlationScore += 0.2;
      reasons.push("Both high confidence - correlation of overconfidence");
    }

    // Normalize to 0-1
    correlationScore = Math.min(correlationScore, 1);

    return {
      score: correlationScore,
      reason: reasons.join(" | "),
    };
  }

  /**
   * Detect same team exposure (e.g., Arsenal Win + Arsenal Over 2.5)
   */
  private static detectSameTeamExposure(market1: string, market2: string): number {
    // BAD: Arsenal Win + Arsenal BTTS
    const bothTeamMarkets = (market1.includes("Win") ||
      market1.includes("Over") ||
      market1.includes("BTTS")) &&
      (market2.includes("Win") ||
        market2.includes("Over") ||
        market2.includes("BTTS"));

    if (bothTeamMarkets) {
      // If both reference attacking performance, high correlation
      if (
        (market1.includes("Over") && market2.includes("Win")) ||
        (market1.includes("Win") && market2.includes("BTTS"))
      ) {
        return 0.85;
      }
      return 0.5;
    }

    return 0;
  }

  /**
   * Detect redundant market selections (e.g., Over 1.5 + Over 2.5)
   */
  private static detectMarketRedundancy(market1: string, market2: string): number {
    // Over 1.5 and Over 2.5 are redundant (if 2.5 hits, so does 1.5)
    if (
      (market1.includes("Over 1.5") && market2.includes("Over")) ||
      (market1.includes("Over") && market2.includes("Over 1.5"))
    ) {
      return 0.7; // High redundancy

      // Under 4.5 and Under 3.5 similar redundancy
    } else if (
      (market1.includes("Under 4.5") && market2.includes("Under")) ||
      (market1.includes("Under") && market2.includes("Under 4.5"))
    ) {
      return 0.65;
    }

    return 0;
  }

  /**
   * Generate user-friendly recommendation
   */
  private static generateRecommendation(
    riskLevel: "LOW" | "MEDIUM" | "HIGH",
    correlatedPairs: CorrelatedPair[]
  ): string {
    if (riskLevel === "HIGH") {
      return `⚠️ HIGH CORRELATION RISK: ${correlatedPairs.length} correlated pairs detected. Your slip has concentrated risk - if one selection fails, others likely follow. Consider removing redundant selections or diversifying to independent fixtures/markets.`;
    } else if (riskLevel === "MEDIUM") {
      return `⚠️ MODERATE CORRELATION: Some selections show moderate correlation (${correlatedPairs.length} pairs). Consider diversifying to independent fixtures for better slip resilience.`;
    } else {
      return `✓ Good diversification: Selections show low correlation. Slip risk is well-distributed.`;
    }
  }

  /**
   * Get correlation matrix for visualization
   */
  static getCorrelationMatrix(selections: BetSelection[]): number[][] {
    const n = selections.length;
    const matrix: number[][] = Array(n)
      .fill(null)
      .map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      matrix[i][i] = 1; // Diagonal is 1
      for (let j = i + 1; j < n; j++) {
        const corr = this.calculatePairCorrelation(selections[i], selections[j]);
        matrix[i][j] = corr.score;
        matrix[j][i] = corr.score;
      }
    }

    return matrix;
  }
}
