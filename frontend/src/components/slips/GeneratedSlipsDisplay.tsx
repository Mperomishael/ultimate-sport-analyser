"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  PieChart,
} from "lucide-react";

interface Selection {
  fixtureId: number;
  league: string;
  homeTeam: string;
  awayTeam: string;
  market: string;
  selection: string;
  odds: number;
  confidence: number;
}

interface DiversifiedSlip {
  slipId: string;
  selections: Selection[];
  totalOdds: number;
  estimatedReturn: number;
  diversificationScore: number;
  leagueDistribution: Record<string, number>;
  marketDistribution: Record<string, number>;
  correlationAnalysis: {
    hasHighCorrelation: boolean;
    correlationScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    recommendation: string;
  };
}

interface GeneratedSlipsDisplayProps {
  slips: DiversifiedSlip[];
  summary: {
    totalSlips: number;
    avgDiversificationScore: number;
    avgTotalOdds: number;
    highCorrelationCount: number;
  };
}

export function GeneratedSlipsDisplay({
  slips,
  summary,
}: GeneratedSlipsDisplayProps) {
  const getCorrelationColor = (level: "LOW" | "MEDIUM" | "HIGH") => {
    switch (level) {
      case "LOW":
        return "bg-green-500/20 text-green-700 border-green-200";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-200";
      case "HIGH":
        return "bg-red-500/20 text-red-700 border-red-200";
    }
  };

  const getDiversificationBadgeColor = (score: number) => {
    if (score >= 85) return "bg-green-500/20 text-green-700 border-green-200";
    if (score >= 70) return "bg-blue-500/20 text-blue-700 border-blue-200";
    if (score >= 50) return "bg-yellow-500/20 text-yellow-700 border-yellow-200";
    return "bg-orange-500/20 text-orange-700 border-orange-200";
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Generation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-sport-blue">
                {summary.totalSlips}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Slips Generated</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-sport-purple">
                {summary.avgDiversificationScore.toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Avg Diversity</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {summary.avgTotalOdds.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Avg Total Odds</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${summary.highCorrelationCount > 0 ? "text-orange-600" : "text-green-600"}`}>
                {summary.highCorrelationCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1">High Corr.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Slips */}
      {slips.map((slip, idx) => (
        <Card key={slip.slipId} className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-3 bg-secondary/30">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">Slip {idx + 1}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {slip.selections.length} selections • Odds: {slip.totalOdds.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge
                  className={`border ${getDiversificationBadgeColor(slip.diversificationScore)}`}
                >
                  Diversity {slip.diversificationScore}%
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            {/* Correlation Alert */}
            <div
              className={`p-3 rounded-lg border ${getCorrelationColor(slip.correlationAnalysis.riskLevel)}`}
            >
              <div className="flex gap-2">
                {slip.correlationAnalysis.riskLevel === "LOW" && (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                {slip.correlationAnalysis.riskLevel === "MEDIUM" && (
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                {slip.correlationAnalysis.riskLevel === "HIGH" && (
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <div className="text-sm">
                  <p className="font-medium">
                    {slip.correlationAnalysis.riskLevel === "LOW"
                      ? "✓ Low Correlation Risk"
                      : slip.correlationAnalysis.riskLevel === "MEDIUM"
                      ? "⚠ Moderate Correlation Risk"
                      : "⚠⚠ High Correlation Risk"}
                  </p>
                  <p className="text-xs mt-1 opacity-90">
                    {slip.correlationAnalysis.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Selections */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Selections:</p>
              <div className="space-y-2">
                {slip.selections.map((sel, selIdx) => (
                  <div
                    key={selIdx}
                    className="p-3 bg-secondary/50 rounded-lg border border-border/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {sel.homeTeam} vs {sel.awayTeam}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {sel.league} • {sel.market}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-foreground">
                          {sel.selection}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @ {sel.odds.toFixed(2)} • {sel.confidence.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* League & Market Distribution */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-secondary/30 p-2 rounded">
                <p className="font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <PieChart className="h-3 w-3" />
                  League Distribution
                </p>
                <div className="space-y-0.5">
                  {Object.entries(slip.leagueDistribution).map(([league, count]) => (
                    <div key={league} className="flex justify-between text-muted-foreground">
                      <span>{league}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-secondary/30 p-2 rounded">
                <p className="font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Market Distribution
                </p>
                <div className="space-y-0.5">
                  {Object.entries(slip.marketDistribution).map(([market, count]) => (
                    <div key={market} className="flex justify-between text-muted-foreground">
                      <span className="truncate">{market}</span>
                      <span className="font-medium ml-2">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slip Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Odds</p>
                <p className="text-lg font-bold text-sport-blue">
                  {slip.totalOdds.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Est. Return</p>
                <p className="text-lg font-bold text-green-600">
                  ${slip.estimatedReturn.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">On $100 Stake</p>
                <p className="text-lg font-bold text-sport-purple">
                  +${(slip.estimatedReturn - 100).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                View Details
              </Button>
              <Button
                size="sm"
                className="w-full bg-sport-blue hover:bg-sport-blue/90"
              >
                Place Bet
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Safety Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-green-800">
            <p className="font-medium">📊 Disclaimer</p>
            <p className="text-xs">
              These slips are generated using statistical analysis and historical patterns. They are
              not guaranteed to win. Betting involves risk. Please bet responsibly within your means.
              This system is a decision-support tool, not a guaranteed profit generator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
