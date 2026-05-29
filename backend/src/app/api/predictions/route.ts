import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/middleware/api";
import { PredictionReasoningEngine } from "@/services/prediction-reasoning";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request);
  if (authResult.status !== 200) return authResult;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const status = searchParams.get("status");
  const minConfidence = searchParams.get("minConfidence");
  const includeReasoning = searchParams.get("includeReasoning") === "true";

  try {
    const where: any = {};
    if (status) where.status = status;
    if (minConfidence) where.overallConfidence = { gte: parseFloat(minConfidence) };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.createdAt = { gte: startDate, lt: endDate };
    }

    const predictions = await prisma.prediction.findMany({
      where,
      include: {
        fixture: {
          include: {
            homeTeam: true,
            awayTeam: true,
            league: true,
          },
        },
      },
      orderBy: { overallConfidence: "desc" },
    });

    // Enrich predictions with reasoning if requested
    if (includeReasoning) {
      const enrichedPredictions = predictions.map((pred) => {
        const { reasoning, factors } = PredictionReasoningEngine.generateReasoning({
          homeTeam: pred.fixture.homeTeam.name,
          awayTeam: pred.fixture.awayTeam.name,
          league: pred.fixture.league.name,
          market: pred.recommendedBet || "Match Outcome",
          selectedOutcome: pred.recommendedBet || "Unknown",
          homeFormScore: pred.homeFormScore,
          awayFormScore: pred.awayFormScore,
          h2hScore: pred.h2hScore,
          homeAwayScore: pred.homeAwayScore,
          goalsTrendScore: pred.goalsTrendScore,
          injuryScore: pred.injuryScore,
          oddsMovementScore: pred.oddsMovementScore,
          homeTeamForm: "W",
          awayTeamForm: "W",
          homeGoalsConceded: 1.2,
          awayGoalsConceded: 1.1,
          homeGoalsScored: 1.8,
          awayGoalsScored: 1.6,
          leagueAverageGoals: 2.7,
        });

        return {
          ...pred,
          reasoning,
          reasoningFactors: factors,
        };
      });

      return NextResponse.json(enrichedPredictions);
    }

    return NextResponse.json(predictions);
  } catch (error) {
    console.error("Predictions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await authMiddleware(request);
  if (authResult.status !== 200) return authResult;

  try {
    const body = await request.json();
    const { fixtureId } = body;

    const predictionServiceUrl = process.env.PREDICTION_SERVICE_URL;
    const response = await fetch(`${predictionServiceUrl}/api/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.PREDICTION_SERVICE_API_KEY || "",
      },
      body: JSON.stringify({ fixture_id: fixtureId }),
    });

    if (!response.ok) {
      throw new Error("Prediction service error");
    }

    const predictionData = await response.json();

    const prediction = await prisma.prediction.create({
      data: {
        fixtureId,
        over15: predictionData.over_1_5,
        over25: predictionData.over_2_5,
        btts: predictionData.btts,
        homeWin: predictionData.home_win,
        awayWin: predictionData.away_win,
        draw: predictionData.draw,
        doubleChanceHomeDraw: predictionData.double_chance_hd,
        doubleChanceHomeAway: predictionData.double_chance_ha,
        doubleChanceDrawAway: predictionData.double_chance_da,
        drawNoBetHome: predictionData.dnb_home,
        drawNoBetAway: predictionData.dnb_away,
        homeFormScore: predictionData.scores.home_form,
        awayFormScore: predictionData.scores.away_form,
        h2hScore: predictionData.scores.h2h,
        homeAwayScore: predictionData.scores.home_away,
        goalsTrendScore: predictionData.scores.goals_trend,
        injuryScore: predictionData.scores.injuries,
        oddsMovementScore: predictionData.scores.odds_movement,
        overallConfidence: predictionData.overall_confidence,
        recommendedBet: predictionData.recommended_bet,
        valueRating: predictionData.value_rating,
        mlProbability: predictionData.ml_probability,
        featureVector: predictionData.feature_vector,
        status: "PENDING",
      },
    });

    return NextResponse.json(prediction, { status: 201 });
  } catch (error) {
    console.error("Create prediction error:", error);
    return NextResponse.json(
      { error: "Failed to create prediction" },
      { status: 500 }
    );
  }
}
