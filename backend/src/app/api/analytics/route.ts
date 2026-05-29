"use server";

import { prisma } from "@/lib/prisma";
import { ConfidenceCalibrationEngine } from "@/services/confidence-calibration";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d"; // 7d, 30d, 90d, all
    const leagueId = searchParams.get("leagueId");

    // Parse period
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 999999;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch prediction history
    const predictions = await prisma.predictionHistory.findMany({
      where: {
        generatedAt: { gte: startDate },
        leagueId: leagueId ? parseInt(leagueId) : undefined,
      },
      include: {
        // Include fixture data if available
      },
    });

    // Market performance analytics
    const marketStats = new Map<string, any>();
    predictions.forEach((p) => {
      if (!marketStats.has(p.market)) {
        marketStats.set(p.market, {
          market: p.market,
          total: 0,
          won: 0,
          lost: 0,
          push: 0,
          totalStake: 0,
          totalReturn: 0,
        });
      }
      const stat = marketStats.get(p.market);
      stat.total++;
      if (p.resultStatus === "WON") stat.won++;
      else if (p.resultStatus === "LOST") stat.lost++;
      else if (p.resultStatus === "PUSH") stat.push++;

      stat.totalStake += p.odds || 0;
      if (p.resultStatus === "WON") {
        stat.totalReturn += (p.odds || 0) * 100;
      }
    });

    const marketAnalytics = Array.from(marketStats.values()).map((m) => ({
      ...m,
      winRate: m.total > 0 ? m.won / m.total : 0,
      roi: m.totalStake > 0 ? ((m.totalReturn - m.totalStake) / m.totalStake) * 100 : 0,
    }));

    // League performance analytics
    const leagueStats = new Map<number, any>();
    predictions.forEach((p) => {
      if (!leagueStats.has(p.leagueId)) {
        leagueStats.set(p.leagueId, {
          leagueId: p.leagueId,
          total: 0,
          won: 0,
          lost: 0,
          confidence: [],
        });
      }
      const stat = leagueStats.get(p.leagueId);
      stat.total++;
      if (p.resultStatus === "WON") stat.won++;
      else if (p.resultStatus === "LOST") stat.lost++;
      stat.confidence.push(p.confidence);
    });

    const leagueAnalytics = Array.from(leagueStats.values()).map((l) => {
      const avg = l.confidence.reduce((a: number, b: number) => a + b, 0) / l.confidence.length;
      return {
        leagueId: l.leagueId,
        totalPredictions: l.total,
        winRate: l.total > 0 ? l.won / l.total : 0,
        lossRate: l.total > 0 ? l.lost / l.total : 0,
        avgConfidence: avg,
      };
    });

    // Confidence calibration analysis
    const calibrationAnalysis = ConfidenceCalibrationEngine.analyzeCalibration(
      predictions
    );

    // Overall statistics
    const totalPredictions = predictions.length;
    const wonPredictions = predictions.filter((p) => p.resultStatus === "WON").length;
    const lostPredictions = predictions.filter((p) => p.resultStatus === "LOST").length;
    const pushPredictions = predictions.filter((p) => p.resultStatus === "PUSH").length;

    const overallWinRate = totalPredictions > 0 ? wonPredictions / totalPredictions : 0;
    const avgConfidence =
      predictions.length > 0
        ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
        : 0;

    // ROI calculation
    const totalStake = predictions.length * 100;
    const totalReturn = wonPredictions * 100 * (avgConfidence / 100) * 2; // Simplified
    const roi = ((totalReturn - totalStake) / totalStake) * 100;

    // Streaks
    let currentStreak = 0;
    let bestWinStreak = 0;
    let currentWinStreak = 0;

    predictions.forEach((p) => {
      if (p.resultStatus === "WON") {
        currentWinStreak++;
        bestWinStreak = Math.max(bestWinStreak, currentWinStreak);
      } else {
        currentWinStreak = 0;
      }
    });

    // Market accuracy analysis
    const marketAccuracy = marketAnalytics.map((m) => ({
      market: m.market,
      accuracy: ((m.won / (m.won + m.lost)) * 100).toFixed(2),
      volume: m.total,
      roi: m.roi.toFixed(2),
    }));

    // Confidence distribution analysis
    const confidenceBuckets = {
      veryHigh: predictions.filter((p) => p.confidence >= 80).length,
      high: predictions.filter((p) => p.confidence >= 70 && p.confidence < 80).length,
      medium: predictions.filter((p) => p.confidence >= 60 && p.confidence < 70).length,
      low: predictions.filter((p) => p.confidence < 60).length,
    };

    const confidenceDistribution = {
      veryHigh: { count: confidenceBuckets.veryHigh, percentage: ((confidenceBuckets.veryHigh / totalPredictions) * 100).toFixed(2) },
      high: { count: confidenceBuckets.high, percentage: ((confidenceBuckets.high / totalPredictions) * 100).toFixed(2) },
      medium: { count: confidenceBuckets.medium, percentage: ((confidenceBuckets.medium / totalPredictions) * 100).toFixed(2) },
      low: { count: confidenceBuckets.low, percentage: ((confidenceBuckets.low / totalPredictions) * 100).toFixed(2) },
    };

    return Response.json(
      {
        success: true,
        data: {
          period,
          generatedAt: new Date(),
          overall: {
            totalPredictions,
            wonPredictions,
            lostPredictions,
            pushPredictions,
            winRate: (overallWinRate * 100).toFixed(2),
            avgConfidence: avgConfidence.toFixed(2),
            estimatedROI: roi.toFixed(2),
            bestWinStreak,
          },
          marketAnalytics: marketAnalytics.sort(
            (a, b) => b.winRate - a.winRate
          ),
          marketAccuracy,
          leagueAnalytics: leagueAnalytics.sort(
            (a, b) => b.winRate - a.winRate
          ),
          confidenceDistribution,
          calibrationAnalysis,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
