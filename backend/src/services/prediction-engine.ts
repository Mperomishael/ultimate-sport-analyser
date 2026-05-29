/**
 * Prediction Engine Modes (SAFE, BALANCED, AGGRESSIVE)
 * Configurable prediction generation with different risk profiles
 */

import { PredictionReasoningEngine } from "./prediction-reasoning";
import { LeagueReliabilityEngine } from "./league-reliability";
import { CorrelationDetectionEngine } from "./correlation-detection";

export interface EngineMode {
  name: "SAFE" | "BALANCED" | "AGGRESSIVE";
  minConfidenceThreshold: number;
  maxMatchesPerSlip: number;
  allowedMarkets: string[];
  allowVolatileLeagues: boolean;
  minimumLeagueRating: number;
  maxCorrelationScore: number;
}

export interface PredictionRequest {
  fixtureId: number;
  homeTeam: { id: number; name: string; form: string };
  awayTeam: { id: number; name: string; form: string };
  league: { id: number; name: string; reliability: any };
  marketType: string; // Over1.5, DoubleChance, etc
  engineMode: "SAFE" | "BALANCED" | "AGGRESSIVE";
  leagueStats: any;
  injuries?: string;
}

export interface EnginePrediction {
  fixtureId: number;
  market: string;
  selectedOutcome: string;
  confidence: number;
  reasoning: string;
  factors: any[];
  isSafe: boolean;
  shouldWarn: boolean;
  warningMessage?: string;
  engineMode: string;
}

export class PredictionEngineManager {
  private static modes: Record<"SAFE" | "BALANCED" | "AGGRESSIVE", EngineMode> = {
    SAFE: {
      name: "SAFE",
      minConfidenceThreshold: 78,
      maxMatchesPerSlip: 5,
      allowedMarkets: [
        "Over 1.5 Goals",
        "Under 4.5 Goals",
        "Double Chance",
        "Team Over 0.5 Goals",
      ],
      allowVolatileLeagues: false,
      minimumLeagueRating: 75,
      maxCorrelationScore: 0.5,
    },
    BALANCED: {
      name: "BALANCED",
      minConfidenceThreshold: 72,
      maxMatchesPerSlip: 6,
      allowedMarkets: [
        "Over 1.5 Goals",
        "Under 4.5 Goals",
        "Over 2.5 Goals",
        "Double Chance",
        "Draw No Bet",
        "Team Over 0.5 Goals",
      ],
      allowVolatileLeagues: true,
      minimumLeagueRating: 60,
      maxCorrelationScore: 0.65,
    },
    AGGRESSIVE: {
      name: "AGGRESSIVE",
      minConfidenceThreshold: 65,
      maxMatchesPerSlip: 7,
      allowedMarkets: [
        "Over 1.5 Goals",
        "Over 2.5 Goals",
        "Under 4.5 Goals",
        "Double Chance",
        "Draw No Bet",
        "BTTS",
        "Handicap",
        "Team Over 0.5 Goals",
      ],
      allowVolatileLeagues: true,
      minimumLeagueRating: 40,
      maxCorrelationScore: 0.75,
    },
  };

  /**
   * Generate prediction using specified engine mode
   */
  static generatePrediction(
    request: PredictionRequest,
    formulas: any
  ): EnginePrediction {
    const mode = this.modes[request.engineMode];
    const isMarketAllowed = mode.allowedMarkets.includes(request.marketType);

    if (!isMarketAllowed) {
      return {
        fixtureId: request.fixtureId,
        market: request.marketType,
        selectedOutcome: "SKIP",
        confidence: 0,
        reasoning: `Market ${request.marketType} not allowed in ${request.engineMode} mode`,
        factors: [],
        isSafe: false,
        shouldWarn: true,
        warningMessage: `${request.marketType} excluded from ${request.engineMode} predictions`,
        engineMode: request.engineMode,
      };
    }

    // Calculate confidence scores
    const confidence = formulas.calculateConfidence(
      request.homeTeam,
      request.awayTeam,
      request.league,
      request.marketType
    );

    // Check league reliability
    const leagueRating = request.leagueStats?.predictabilityScore || 50;
    if (!mode.allowVolatileLeagues && leagueRating < mode.minimumLeagueRating) {
      return {
        fixtureId: request.fixtureId,
        market: request.marketType,
        selectedOutcome: "SKIP",
        confidence,
        reasoning: `League ${request.league.name} too volatile for ${request.engineMode} mode (rating: ${leagueRating})`,
        factors: [],
        isSafe: false,
        shouldWarn: true,
        warningMessage: `${request.league.name} excluded from ${request.engineMode} - insufficient reliability`,
        engineMode: request.engineMode,
      };
    }

    // Check confidence threshold
    if (confidence < mode.minConfidenceThreshold) {
      return {
        fixtureId: request.fixtureId,
        market: request.marketType,
        selectedOutcome: "SKIP",
        confidence,
        reasoning: `Confidence ${confidence.toFixed(1)}% below ${request.engineMode} threshold (${mode.minConfidenceThreshold}%)`,
        factors: [],
        isSafe: false,
        shouldWarn: false,
        engineMode: request.engineMode,
      };
    }

    // Generate reasoning
    const { reasoning, factors } = PredictionReasoningEngine.generateReasoning({
      homeTeam: request.homeTeam.name,
      awayTeam: request.awayTeam.name,
      league: request.league.name,
      market: request.marketType,
      selectedOutcome: "TBD",
      homeFormScore: 0.7,
      awayFormScore: 0.6,
      h2hScore: 0.65,
      homeAwayScore: 0.75,
      goalsTrendScore: 0.7,
      injuryScore: 1.0,
      oddsMovementScore: 0.5,
      homeTeamForm: request.homeTeam.form,
      awayTeamForm: request.awayTeam.form,
      homeGoalsConceded: 8,
      awayGoalsConceded: 6,
      homeGoalsScored: 12,
      awayGoalsScored: 10,
      leagueAverageGoals: 2.7,
      injuryDetails: request.injuries,
    });

    // Determine outcome
    const outcome = this.determineOutcome(
      request.marketType,
      request.homeTeam.form,
      request.awayTeam.form,
      request.leagueStats
    );

    // Final safety checks
    let shouldWarn = false;
    let warningMessage = "";

    if (request.engineMode === "SAFE" && confidence < 85) {
      shouldWarn = true;
      warningMessage = `Confidence slightly below SAFE optimal range (${confidence.toFixed(1)}%)`;
    }

    if (request.injuries) {
      shouldWarn = true;
      warningMessage =
        warningMessage +
        (warningMessage ? " | " : "") +
        "Key player injuries detected";
    }

    return {
      fixtureId: request.fixtureId,
      market: request.marketType,
      selectedOutcome: outcome,
      confidence,
      reasoning,
      factors,
      isSafe: confidence >= mode.minConfidenceThreshold,
      shouldWarn,
      warningMessage: warningMessage || undefined,
      engineMode: request.engineMode,
    };
  }

  /**
   * Determine the recommended outcome
   */
  private static determineOutcome(
    market: string,
    homeForm: string,
    awayForm: string,
    leagueStats: any
  ): string {
    const homeWins = (homeForm.match(/W/g) || []).length;
    const awayWins = (awayForm.match(/W/g) || []).length;

    if (market.includes("Over")) {
      return "OVER";
    } else if (market.includes("Under")) {
      return "UNDER";
    } else if (market.includes("Double Chance")) {
      return homeWins >= awayWins ? "HOME_OR_DRAW" : "AWAY_OR_DRAW";
    } else if (market.includes("BTTS")) {
      return "BOTH_TO_SCORE";
    } else if (market.includes("Draw No Bet")) {
      return homeWins > awayWins ? "HOME_WIN" : "AWAY_WIN";
    } else {
      return "RECOMMENDATION_PENDING";
    }
  }

  /**
   * Validate prediction for slip inclusion
   */
  static validateForSlip(
    prediction: EnginePrediction,
    mode: "SAFE" | "BALANCED" | "AGGRESSIVE"
  ): { valid: boolean; reason?: string } {
    if (prediction.selectedOutcome === "SKIP") {
      return { valid: false, reason: "Market/League excluded for this mode" };
    }

    if (prediction.confidence < this.modes[mode].minConfidenceThreshold) {
      return {
        valid: false,
        reason: `Below confidence threshold (${prediction.confidence.toFixed(1)}%)`,
      };
    }

    return { valid: true };
  }

  /**
   * Get mode configuration
   */
  static getMode(name: "SAFE" | "BALANCED" | "AGGRESSIVE"): EngineMode {
    return this.modes[name];
  }

  /**
   * Validate odds are realistic for requested mode
   */
  static validateOddsRealistic(
    targetOdds: number,
    slipCount: number,
    mode: "SAFE" | "BALANCED" | "AGGRESSIVE"
  ): { feasible: boolean; recommendation: string } {
    const modeConfig = this.modes[mode];
    const minPerSlipOdds = 1.3;
    const minTotalOdds = Math.pow(minPerSlipOdds, modeConfig.maxMatchesPerSlip);

    if (targetOdds && slipCount > 0) {
      const avgOddsPerSlip = Math.pow(targetOdds, 1 / slipCount);

      if (mode === "SAFE" && avgOddsPerSlip > 2.5) {
        return {
          feasible: false,
          recommendation: `SAFE mode targets ${avgOddsPerSlip.toFixed(2)} avg odds per slip - typically unrealistic. Try BALANCED or lower odds target.`,
        };
      }

      if (mode === "BALANCED" && avgOddsPerSlip > 3.2) {
        return {
          feasible: false,
          recommendation: `BALANCED mode targets ${avgOddsPerSlip.toFixed(2)} avg odds - very ambitious. Consider realistic ${(2.8).toFixed(2)} instead.`,
        };
      }
    }

    return {
      feasible: true,
      recommendation: `${mode} mode can accommodate target odds`,
    };
  }
}
