"use server";

import { prisma } from "@/lib/prisma";
import { LeagueReliabilityEngine } from "@/services/league-reliability";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get("leagueId");
    const minSampleSize = parseInt(searchParams.get("minSampleSize") || "10");

    // Fetch all leagues with prediction history
    const leagues = await prisma.league.findMany({
      where: {
        isBlacklisted: false,
        isActive: true,
      },
    });

    const leagueReliabilities = [];

    for (const league of leagues) {
      const predictions = await prisma.predictionHistory.findMany({
        where: {
          leagueId: league.id,
          resultStatus: { in: ["WON", "LOST", "PUSH"] },
        },
      });

      if (predictions.length >= minSampleSize) {
        const fixtures = await prisma.fixture.findMany({
          where: {
            leagueId: league.id,
            status: "FT",
          },
        });

        const reliability = LeagueReliabilityEngine.calculateLeagueReliability(
          league.name,
          predictions,
          fixtures
        );

        leagueReliabilities.push({
          ...reliability,
          leagueId: league.id,
          sampleSize: predictions.length,
        });
      }
    }

    // Sort by reliability/predictability
    leagueReliabilities.sort((a, b) => b.predictabilityScore - a.predictabilityScore);

    // Get specific league if requested
    if (leagueId) {
      const specific = leagueReliabilities.find(
        (l) => l.leagueId === parseInt(leagueId)
      );

      if (!specific) {
        return Response.json(
          {
            success: false,
            error: "LEAGUE_NOT_FOUND",
            message: `No sufficient prediction history for this league (minimum ${minSampleSize} predictions required)`,
          },
          { status: 404 }
        );
      }

      return Response.json(
        {
          success: true,
          data: specific,
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        data: {
          leagues: leagueReliabilities,
          summary: {
            totalLeagues: leagueReliabilities.length,
            averagePredictability:
              leagueReliabilities.reduce(
                (sum, l) => sum + l.predictabilityScore,
                0
              ) / leagueReliabilities.length,
            safeLeagues: leagueReliabilities.filter(
              (l) => l.riskRating === "LOW"
            ).length,
            mediumRiskLeagues: leagueReliabilities.filter(
              (l) => l.riskRating === "MEDIUM"
            ).length,
            highRiskLeagues: leagueReliabilities.filter(
              (l) => l.riskRating === "HIGH"
            ).length,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching league reliability:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
