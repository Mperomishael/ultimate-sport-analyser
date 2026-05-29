/**
 * Slip Diversification Engine
 * Generates multiple diverse betting slips to avoid repetitive combinations
 */

export interface DiversificationConfig {
  numberOfSlips: number;
  matchesPerSlip: number;
  targetOdds: number;
  allowedMarkets: string[];
  minConfidence: number;
  diversificationPriority: "league" | "fixture" | "market" | "balanced";
}

export interface DiversifiedSlip {
  slipId: string;
  selections: {
    fixtureId: number;
    league: string;
    homeTeam: string;
    awayTeam: string;
    market: string;
    selection: string;
    odds: number;
    confidence: number;
  }[];
  totalOdds: number;
  estimatedReturn: number;
  diversificationScore: number; // 0-100, higher = more diverse
  leagueDistribution: Record<string, number>;
  marketDistribution: Record<string, number>;
}

export class SlipDiversificationEngine {
  /**
   * Generate diverse betting slips
   */
  static generateDiverseSlips(
    availablePredictions: any[],
    config: DiversificationConfig
  ): DiversifiedSlip[] {
    const slips: DiversifiedSlip[] = [];

    // Filter predictions by confidence and markets
    const validPredictions = availablePredictions.filter(
      (p) =>
        p.overallConfidence >= config.minConfidence &&
        config.allowedMarkets.includes(p.market)
    );

    if (validPredictions.length < config.matchesPerSlip) {
      return []; // Not enough predictions
    }

    // Sort by different criteria for diversity
    const predictionSets = [
      this.sortByLeague(validPredictions),
      this.sortByMarket(validPredictions),
      this.sortByFixtureDate(validPredictions),
      this.sortByConfidence(validPredictions),
    ];

    // Generate slips from each sorted set
    for (let setIndex = 0; setIndex < config.numberOfSlips; setIndex++) {
      const sortedSet = predictionSets[setIndex % predictionSets.length];
      const slip = this.buildSlipFromSet(
        sortedSet,
        config,
        setIndex,
        validPredictions
      );

      if (slip && this.isValidSlip(slip, config.targetOdds)) {
        slips.push(slip);
      }

      if (slips.length >= config.numberOfSlips) break;
    }

    // If not enough slips generated, try balanced approach
    if (slips.length < config.numberOfSlips) {
      while (slips.length < config.numberOfSlips) {
        const slip = this.buildBalancedSlip(
          validPredictions,
          config,
          slips
        );
        if (slip && this.isValidSlip(slip, config.targetOdds)) {
          slips.push(slip);
        } else {
          break;
        }
      }
    }

    return slips;
  }

  /**
   * Sort predictions by league for league-diverse slips
   */
  private static sortByLeague(predictions: any[]): any[] {
    const grouped = new Map<number, any[]>();

    predictions.forEach((p) => {
      if (!grouped.has(p.leagueId)) {
        grouped.set(p.leagueId, []);
      }
      grouped.get(p.leagueId)!.push(p);
    });

    // Return flattened with league rotation
    const result: any[] = [];
    let round = 0;

    while (result.length < predictions.length) {
      let addedThisRound = false;
      grouped.forEach((league, key) => {
        if (round < league.length) {
          result.push(league[round]);
          addedThisRound = true;
        }
      });
      if (!addedThisRound) break;
      round++;
    }

    return result;
  }

  /**
   * Sort predictions by market type
   */
  private static sortByMarket(predictions: any[]): any[] {
    const grouped = new Map<string, any[]>();

    predictions.forEach((p) => {
      if (!grouped.has(p.market)) {
        grouped.set(p.market, []);
      }
      grouped.get(p.market)!.push(p);
    });

    // Rotate through markets
    const result: any[] = [];
    let round = 0;

    while (result.length < predictions.length) {
      let addedThisRound = false;
      grouped.forEach((market, key) => {
        if (round < market.length) {
          result.push(market[round]);
          addedThisRound = true;
        }
      });
      if (!addedThisRound) break;
      round++;
    }

    return result;
  }

  /**
   * Sort by fixture date
   */
  private static sortByFixtureDate(predictions: any[]): any[] {
    return [...predictions].sort(
      (a, b) =>
        new Date(a.fixtureDate).getTime() -
        new Date(b.fixtureDate).getTime()
    );
  }

  /**
   * Sort by confidence (highest first)
   */
  private static sortByConfidence(predictions: any[]): any[] {
    return [...predictions].sort((a, b) => b.overallConfidence - a.overallConfidence);
  }

  /**
   * Build a slip from a sorted set, with variation
   */
  private static buildSlipFromSet(
    sortedPredictions: any[],
    config: DiversificationConfig,
    slipIndex: number,
    allPredictions: any[]
  ): DiversifiedSlip | null {
    const selections: any[] = [];
    const offset = slipIndex * 2; // Stagger through predictions

    for (
      let i = offset;
      i < sortedPredictions.length && selections.length < config.matchesPerSlip;
      i++
    ) {
      const pred = sortedPredictions[i % sortedPredictions.length];
      if (!selections.find((s) => s.fixtureId === pred.fixtureId)) {
        selections.push(this.mapPredictionToSelection(pred));
      }
    }

    if (selections.length < config.matchesPerSlip) return null;

    return this.constructSlip(selections, slipIndex);
  }

  /**
   * Build a balanced slip (mix of high confidence, different leagues)
   */
  private static buildBalancedSlip(
    predictions: any[],
    config: DiversificationConfig,
    existingSlips: DiversifiedSlip[]
  ): DiversifiedSlip | null {
    const usedFixtures = new Set<number>();
    existingSlips.forEach((slip) => {
      slip.selections.forEach((sel) => usedFixtures.add(sel.fixtureId));
    });

    const availableLeagues = new Map<number, any[]>();
    predictions
      .filter((p) => !usedFixtures.has(p.fixtureId))
      .forEach((p) => {
        if (!availableLeagues.has(p.leagueId)) {
          availableLeagues.set(p.leagueId, []);
        }
        availableLeagues.get(p.leagueId)!.push(p);
      });

    const selections: any[] = [];
    const selectedLeagues = new Set<number>();

    // Pick best from each league for balance
    for (const [leagueId, leaguePreds] of availableLeagues) {
      if (selections.length >= config.matchesPerSlip) break;

      // Prefer diversified leagues
      if (selectedLeagues.size < config.matchesPerSlip / 2 || !selectedLeagues.has(leagueId)) {
        const best = leaguePreds.sort(
          (a, b) => b.overallConfidence - a.overallConfidence
        )[0];

        if (best) {
          selections.push(this.mapPredictionToSelection(best));
          selectedLeagues.add(leagueId);
        }
      }
    }

    if (selections.length < config.matchesPerSlip) return null;

    return this.constructSlip(selections, existingSlips.length);
  }

  /**
   * Map prediction to selection format
   */
  private static mapPredictionToSelection(pred: any): any {
    return {
      fixtureId: pred.fixtureId,
      league: pred.league,
      homeTeam: pred.homeTeam,
      awayTeam: pred.awayTeam,
      market: pred.market,
      selection: pred.recommendedBet,
      odds: pred.marketOdds,
      confidence: pred.overallConfidence,
    };
  }

  /**
   * Construct a complete slip object
   */
  private static constructSlip(
    selections: any[],
    slipIndex: number
  ): DiversifiedSlip {
    const totalOdds = selections.reduce((prod, sel) => prod * sel.odds, 1);

    // Calculate distributions
    const leagueDistribution: Record<string, number> = {};
    const marketDistribution: Record<string, number> = {};

    selections.forEach((sel) => {
      leagueDistribution[sel.league] =
        (leagueDistribution[sel.league] || 0) + 1;
      marketDistribution[sel.market] =
        (marketDistribution[sel.market] || 0) + 1;
    });

    // Calculate diversification score
    const diversificationScore = this.calculateDiversificationScore(
      selections,
      leagueDistribution,
      marketDistribution
    );

    return {
      slipId: `slip_${slipIndex}_${Date.now()}`,
      selections,
      totalOdds,
      estimatedReturn: totalOdds * 100, // Assuming $100 stake
      diversificationScore,
      leagueDistribution,
      marketDistribution,
    };
  }

  /**
   * Calculate how diverse this slip is
   */
  private static calculateDiversificationScore(
    selections: any[],
    leagueDistribution: Record<string, number>,
    marketDistribution: Record<string, number>
  ): number {
    const n = selections.length;

    // Check for unique fixtures (ideal is all different)
    const fixtureUniqueness =
      new Set(selections.map((s) => s.fixtureId)).size / n;

    // Check for league spread
    const leagueCount = Object.keys(leagueDistribution).length;
    const leagueSpread = Math.min(leagueCount / n, 1);

    // Check for market diversity
    const marketCount = Object.keys(marketDistribution).length;
    const marketSpread = Math.min(marketCount / (n / 2), 1);

    // Check confidence spread
    const confidences = selections.map((s) => s.confidence);
    const avgConfidence =
      confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const confVariance =
      confidences.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) /
      confidences.length;
    const confSpread = Math.min(Math.sqrt(confVariance) / 20, 1); // Lower variance is better

    // Weight the factors
    const score =
      fixtureUniqueness * 0.4 +
      leagueSpread * 0.35 +
      marketSpread * 0.15 +
      (1 - confSpread) * 0.1;

    return Math.round(score * 100);
  }

  /**
   * Check if slip is valid for target odds
   */
  private static isValidSlip(
    slip: DiversifiedSlip,
    targetOdds: number,
    tolerance: number = 0.15
  ): boolean {
    if (targetOdds === 0) return true; // No target limit

    const lowerBound = targetOdds * (1 - tolerance);
    const upperBound = targetOdds * (1 + tolerance);

    return slip.totalOdds >= lowerBound && slip.totalOdds <= upperBound;
  }
}
