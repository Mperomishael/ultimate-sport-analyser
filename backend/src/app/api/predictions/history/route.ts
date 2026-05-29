"use server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status"); // WON, LOST, PENDING
    const market = searchParams.get("market");
    const leagueId = searchParams.get("leagueId");
    const period = searchParams.get("period") || "30d";

    // Parse period
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 999999;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const skip = (page - 1) * limit;

    // Build query
    const where: any = {
      generatedAt: { gte: startDate },
    };

    if (status && status !== "ALL") {
      where.resultStatus = status;
    }
    if (market) {
      where.market = market;
    }
    if (leagueId) {
      where.leagueId = parseInt(leagueId);
    }

    // Fetch predictions
    const predictions = await prisma.predictionHistory.findMany({
      where,
      skip,
      take: limit,
      orderBy: { generatedAt: "desc" },
    });

    // Get total count
    const total = await prisma.predictionHistory.count({ where });

    // Calculate stats
    const wonCount = await prisma.predictionHistory.count({
      where: { ...where, resultStatus: "WON" },
    });
    const lostCount = await prisma.predictionHistory.count({
      where: { ...where, resultStatus: "LOST" },
    });
    const pushCount = await prisma.predictionHistory.count({
      where: { ...where, resultStatus: "PUSH" },
    });
    const pendingCount = await prisma.predictionHistory.count({
      where: { ...where, resultStatus: "PENDING" },
    });

    return Response.json(
      {
        success: true,
        data: {
          predictions: predictions.map((p) => ({
            id: p.id,
            fixtureId: p.fixtureId,
            market: p.market,
            selectedOutcome: p.selectedOutcome,
            odds: p.odds,
            confidence: p.confidence,
            reasoning: p.reasoning,
            resultStatus: p.resultStatus,
            finalResult: p.finalResult,
            wasAccurate: p.wasAccurate,
            roi: p.roi,
            generatedAt: p.generatedAt,
            resultFetchedAt: p.resultFetchedAt,
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
          stats: {
            total,
            won: wonCount,
            lost: lostCount,
            push: pushCount,
            pending: pendingCount,
            winRate: total > 0 ? ((wonCount / (total - pendingCount)) * 100).toFixed(2) : 0,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching prediction history:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
