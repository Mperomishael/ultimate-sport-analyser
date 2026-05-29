"use server";

import { prisma } from "@/lib/prisma";
import { SlipDiversificationEngine } from "@/services/slip-diversification";
import { PredictionEngineManager } from "@/services/prediction-engine";
import { CorrelationDetectionEngine } from "@/services/correlation-detection";

export async function POST(request: Request) {
  try {
    const {
      numberOfSlips,
      matchesPerSlip,
      targetOdds,
      allowedMarkets,
      minConfidence,
      engineMode,
      excludeLeagues = [],
    } = await request.json();

    // Validate safety settings for SAFE mode
    if (engineMode === "SAFE") {
      const avgOddsPerSlip = Math.pow(targetOdds, 1 / numberOfSlips);
      if (avgOddsPerSlip > 2.5) {
        return Response.json(
          {
            success: false,
            error: "UNREALISTIC_ODDS",
            message: `SAFE mode cannot achieve ${targetOdds} odds with ${numberOfSlips} slips (avg ${avgOddsPerSlip.toFixed(2)} per slip). Recommend lowering target to ~${Math.pow(2.5, numberOfSlips).toFixed(2)} or switching to BALANCED mode.`,
            recommendation: {
              recommendedOdds: Math.pow(2.5, numberOfSlips),
              recommendedMode: "BALANCED",
            },
          },
          { status: 400 }
        );
      }
    }

    // Fetch available predictions
    const modeConfig = PredictionEngineManager.getMode(engineMode);
    const predictions = await prisma.prediction.findMany({
      where: {
        status: "CONFIRMED",
        overallConfidence: {
          gte: minConfidence || modeConfig.minConfidenceThreshold,
        },
        fixture: {
          league: {
            isBlacklisted: false,
            id: excludeLeagues.length > 0 ? { notIn: excludeLeagues } : undefined,
          },
        },
      },
      include: {
        fixture: {
          include: {
            league: true,
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
      take: 100,
    });

    if (predictions.length < matchesPerSlip * 2) {
      return Response.json(
        {
          success: false,
          error: "INSUFFICIENT_PREDICTIONS",
          message: `Only ${predictions.length} valid predictions available. Need at least ${matchesPerSlip * 2} for ${numberOfSlips} diverse slips.`,
        },
        { status: 400 }
      );
    }

    // Map predictions to format expected by diversification engine
    const mappedPredictions = predictions.map((p) => ({
      ...p,
      market: p.recommendedBet?.split("_")[0] || "Unknown",
      leagueId: p.fixture.leagueId,
      league: p.fixture.league.name,
      homeTeam: p.fixture.homeTeam.name,
      awayTeam: p.fixture.awayTeam.name,
      fixtureDate: p.fixture.date,
      marketOdds: p.valueRating ? 1 + p.valueRating * 0.2 : 1.5,
    }));

    // Generate diverse slips
    const diverseSlips = SlipDiversificationEngine.generateDiverseSlips(
      mappedPredictions,
      {
        numberOfSlips,
        matchesPerSlip,
        targetOdds,
        allowedMarkets,
        minConfidence: minConfidence || modeConfig.minConfidenceThreshold,
        diversificationPriority: "balanced",
      }
    );

    if (diverseSlips.length === 0) {
      return Response.json(
        {
          success: false,
          error: "NO_DIVERSE_SLIPS",
          message: "Could not generate diverse slips with current parameters",
        },
        { status: 400 }
      );
    }

    // Check correlations for each slip
    const slipsWithAnalysis = diverseSlips.map((slip) => {
      const correlationResult = CorrelationDetectionEngine.detectCorrelations(
        slip.selections.map((s) => ({
          fixtureId: s.fixtureId,
          market: s.market,
          selection: s.selection,
          odds: s.odds,
          confidence: s.confidence,
        }))
      );

      return {
        ...slip,
        correlationAnalysis: correlationResult,
      };
    });

    return Response.json(
      {
        success: true,
        data: {
          slips: slipsWithAnalysis,
          generatedAt: new Date(),
          engineMode,
          summary: {
            totalSlips: slipsWithAnalysis.length,
            avgDiversificationScore:
              slipsWithAnalysis.reduce((sum, s) => sum + s.diversificationScore, 0) /
              slipsWithAnalysis.length,
            avgTotalOdds:
              slipsWithAnalysis.reduce((sum, s) => sum + s.totalOdds, 0) /
              slipsWithAnalysis.length,
            highCorrelationCount: slipsWithAnalysis.filter(
              (s) => s.correlationAnalysis.riskLevel === "HIGH"
            ).length,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating diverse slips:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
