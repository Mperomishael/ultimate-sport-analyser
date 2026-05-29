/**
 * Prediction Reasoning Engine
 * Generates detailed textual explanations for all predictions
 */

interface ReasoningFactor {
  factor: string;
  value: number | string;
  weight: number; // 0-1
  explanation: string;
}

interface PredictionReasoningContext {
  homeTeam: string;
  awayTeam: string;
  league: string;
  market: string;
  selectedOutcome: string;
  homeFormScore: number;
  awayFormScore: number;
  h2hScore: number;
  homeAwayScore: number;
  goalsTrendScore: number;
  injuryScore: number;
  oddsMovementScore: number;
  homeTeamForm: string; // e.g., "WDLWW"
  awayTeamForm: string;
  homeGoalsConceded: number;
  awayGoalsConceded: number;
  homeGoalsScored: number;
  awayGoalsScored: number;
  leagueAverageGoals: number;
  injuryDetails?: string;
}

export class PredictionReasoningEngine {
  /**
   * Generate comprehensive reasoning for a prediction
   */
  static generateReasoning(
    context: PredictionReasoningContext
  ): {
    reasoning: string;
    factors: ReasoningFactor[];
  } {
    const factors: ReasoningFactor[] = [];
    const reasoningParts: string[] = [];

    // Home Form Analysis
    const homeFormFactor = this.analyzeTeamForm(
      context.homeTeam,
      context.homeTeamForm,
      context.homeFormScore,
      "home"
    );
    if (homeFormFactor) {
      factors.push(homeFormFactor);
      reasoningParts.push(homeFormFactor.explanation);
    }

    // Away Form Analysis
    const awayFormFactor = this.analyzeTeamForm(
      context.awayTeam,
      context.awayTeamForm,
      context.awayFormScore,
      "away"
    );
    if (awayFormFactor) {
      factors.push(awayFormFactor);
      reasoningParts.push(awayFormFactor.explanation);
    }

    // Head to Head Analysis
    if (context.h2hScore > 0) {
      const h2hFactor = this.analyzeH2H(
        context.homeTeam,
        context.awayTeam,
        context.h2hScore
      );
      factors.push(h2hFactor);
      reasoningParts.push(h2hFactor.explanation);
    }

    // Home/Away Strength
    const homeAwayFactor = this.analyzeHomeAwayStrength(
      context.homeTeam,
      context.awayTeam,
      context.homeAwayScore
    );
    factors.push(homeAwayFactor);
    reasoningParts.push(homeAwayFactor.explanation);

    // Goals Trend Analysis
    const goalsTrendFactor = this.analyzeGoalsTrend(
      context.market,
      context.homeGoalsScored,
      context.homeGoalsConceded,
      context.awayGoalsScored,
      context.awayGoalsConceded,
      context.leagueAverageGoals,
      context.goalsTrendScore
    );
    factors.push(goalsTrendFactor);
    reasoningParts.push(goalsTrendFactor.explanation);

    // Injury Impact
    if (context.injuryScore < 1.0 && context.injuryDetails) {
      const injuryFactor = this.analyzeInjuryImpact(
        context.injuryDetails,
        context.injuryScore
      );
      factors.push(injuryFactor);
      reasoningParts.push(injuryFactor.explanation);
    }

    // Odds Movement
    if (context.oddsMovementScore > 0) {
      const oddsFactor = this.analyzeOddsMovement(
        context.oddsMovementScore,
        context.selectedOutcome
      );
      factors.push(oddsFactor);
      reasoningParts.push(oddsFactor.explanation);
    }

    // League-specific insights
    const leagueFactor = this.analyzeLeagueCharacteristics(
      context.league,
      context.market
    );
    factors.push(leagueFactor);
    reasoningParts.push(leagueFactor.explanation);

    const reasoning = reasoningParts.join(" | ");

    return { reasoning, factors };
  }

  private static analyzeTeamForm(
    teamName: string,
    form: string,
    score: number,
    venue: "home" | "away"
  ): ReasoningFactor | null {
    if (form.length === 0) return null;

    const recentMatches = form.slice(-5).split("");
    const wins = recentMatches.filter((m) => m === "W").length;
    const losses = recentMatches.filter((m) => m === "L").length;

    let formStatus = "inconsistent";
    if (wins >= 4) formStatus = "excellent";
    else if (wins >= 3) formStatus = "good";
    else if (wins <= 1) formStatus = "poor";

    const explanation = `${teamName} showing ${formStatus} ${venue} form with ${wins} wins in last 5 matches (${wins} W, ${losses} L)`;

    return {
      factor: `${teamName}_form`,
      value: `${wins}W-${losses}L`,
      weight: score,
      explanation,
    };
  }

  private static analyzeH2H(
    homeTeam: string,
    awayTeam: string,
    score: number
  ): ReasoningFactor {
    const strength =
      score > 0.7 ? "strong" : score > 0.4 ? "moderate" : "weak";
    return {
      factor: "h2h_advantage",
      value: `${strength} historical pattern`,
      weight: score,
      explanation: `Head-to-head record shows ${strength} pattern favoring prediction outcome`,
    };
  }

  private static analyzeHomeAwayStrength(
    homeTeam: string,
    awayTeam: string,
    score: number
  ): ReasoningFactor {
    let insight = "";
    if (score > 0.6) {
      insight = `${homeTeam} strong at home, ${awayTeam} struggles away`;
    } else if (score < 0.4) {
      insight = `${homeTeam} weak at home, ${awayTeam} strong away`;
    } else {
      insight = "balanced home/away dynamics";
    }

    return {
      factor: "home_away_dynamics",
      value: insight,
      weight: score,
      explanation: insight,
    };
  }

  private static analyzeGoalsTrend(
    market: string,
    homeGoalsScored: number,
    homeGoalsConceded: number,
    awayGoalsScored: number,
    awayGoalsConceded: number,
    leagueAvg: number,
    score: number
  ): ReasoningFactor {
    const totalGoalsAvg =
      (homeGoalsScored + awayGoalsScored + homeGoalsConceded + awayGoalsConceded) /
      2 /
      2;

    let goalInsight = "";

    if (market.includes("Over")) {
      if (totalGoalsAvg > leagueAvg) {
        goalInsight = `High-scoring pattern detected (${totalGoalsAvg.toFixed(1)} goals/game vs ${leagueAvg.toFixed(1)} league avg)`;
      } else {
        goalInsight = `Below-average goal scoring (${totalGoalsAvg.toFixed(1)} goals/game)`;
      }
    } else if (market.includes("Under")) {
      if (totalGoalsAvg < leagueAvg) {
        goalInsight = `Low-scoring pattern detected (${totalGoalsAvg.toFixed(1)} goals/game vs ${leagueAvg.toFixed(1)} league avg)`;
      } else {
        goalInsight = `Above-average goal scoring (${totalGoalsAvg.toFixed(1)} goals/game)`;
      }
    }

    return {
      factor: "goals_trend",
      value: `${totalGoalsAvg.toFixed(1)} avg goals`,
      weight: score,
      explanation: goalInsight,
    };
  }

  private static analyzeInjuryImpact(
    injuryDetails: string,
    score: number
  ): ReasoningFactor {
    return {
      factor: "injury_impact",
      value: `${Math.round((1 - score) * 100)}% impact`,
      weight: score,
      explanation: `Key player absence: ${injuryDetails}`,
    };
  }

  private static analyzeOddsMovement(
    score: number,
    outcome: string
  ): ReasoningFactor {
    const direction = score > 0.5 ? "strengthening" : "weakening";
    return {
      factor: "odds_movement",
      value: direction,
      weight: score,
      explanation: `Market odds ${direction} toward ${outcome}`,
    };
  }

  private static analyzeLeagueCharacteristics(
    league: string,
    market: string
  ): ReasoningFactor {
    const leagueTraits: Record<string, string> = {
      "Premier League":
        "High-paced, consistent goal-scoring, defensive reliability",
      "La Liga": "Tactical, variable scoring, strong favorite trends",
      Bundesliga: "Offensive emphasis, higher scoring than expected",
      "Serie A": "Defensive strength, lower scoring tendency",
      Ligue1: "Unpredictable, high upset frequency",
    };

    const trait = leagueTraits[league] || "mid-table league characteristics";

    return {
      factor: "league_trait",
      value: trait,
      weight: 0.3,
      explanation: `${league} known for: ${trait}`,
    };
  }
}
