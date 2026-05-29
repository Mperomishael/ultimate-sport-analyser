"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Trophy,
  Shield,
  TrendingUp,
  Copy,
  Check,
  Trash2,
  Plus,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ConfidenceMeter } from "@/components/predictions/ConfidenceMeter";
import type { AccumulatorConfig } from "@/types";

interface AccumulatorResultProps {
  config: AccumulatorConfig;
}

const mockAccumulator = {
  totalOdds: 5.23,
  combinedConfidence: 68.4,
  selections: [
    {
      id: "1",
      fixture: {
        id: 1,
        homeTeam: { id: 33, name: "Man Utd", logo: "https://media.api-sports.io/football/teams/33.png" },
        awayTeam: { id: 34, name: "Newcastle", logo: "https://media.api-sports.io/football/teams/34.png" },
        league: { id: 39, name: "Premier League", country: "England" },
        date: "2026-05-29T19:00:00Z",
      },
      market: "Over 2.5",
      selection: "Over 2.5 Goals",
      odds: 1.85,
      confidence: 78,
      reason: "Both teams averaging 2.8+ goals in last 5. H2H history shows high scoring games.",
    },
    {
      id: "2",
      fixture: {
        id: 2,
        homeTeam: { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
        awayTeam: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
        league: { id: 140, name: "La Liga", country: "Spain" },
        date: "2026-05-29T20:00:00Z",
      },
      market: "BTTS",
      selection: "BTTS Yes",
      odds: 1.72,
      confidence: 80,
      reason: "El Clasico averages 3.2 goals per game. Both teams have scored in 8 of last 10 meetings.",
    },
    {
      id: "3",
      fixture: {
        id: 3,
        homeTeam: { id: 157, name: "Bayern", logo: "https://media.api-sports.io/football/teams/157.png" },
        awayTeam: { id: 165, name: "Dortmund", logo: "https://media.api-sports.io/football/teams/165.png" },
        league: { id: 78, name: "Bundesliga", country: "Germany" },
        date: "2026-05-29T18:30:00Z",
      },
      market: "Home Win",
      selection: "Bayern Munich",
      odds: 1.65,
      confidence: 82,
      reason: "Bayern unbeaten at home this season. Dortmund struggling away with 3 losses in last 5.",
    },
  ],
};

export function AccumulatorResult({ config }: AccumulatorResultProps) {
  const [copied, setCopied] = useState(false);
  const [selections, setSelections] = useState(mockAccumulator.selections);

  const handleCopy = () => {
    const text = selections.map((s) => `${s.fixture.homeTeam.name} vs ${s.fixture.awayTeam.name} - ${s.selection} @ ${s.odds}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const removeSelection = (id: string) => {
    setSelections((prev) => prev.filter((s) => s.id !== id));
  };

  const currentOdds = selections.reduce((acc, s) => acc * s.odds, 1);
  const avgConfidence = selections.length > 0
    ? selections.reduce((acc, s) => acc + s.confidence, 0) / selections.length
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="glass-card border-sport-purple/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sport-purple to-sport-blue flex items-center justify-center">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Smart Accumulator</h3>
                <p className="text-sm text-muted-foreground">
                  {selections.length} selections · {config.riskLevel} risk
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Odds</p>
              <p className="text-3xl font-bold font-mono text-sport-green">{currentOdds.toFixed(2)}x</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-xs text-muted-foreground">Avg Confidence</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <ConfidenceMeter value={Math.round(avgConfidence)} size="sm" />
                <span className="font-bold">{avgConfidence.toFixed(1)}%</span>
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="text-lg font-bold font-mono">{config.targetOdds.toFixed(1)}x</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-xs text-muted-foreground">Potential Return</p>
              <p className="text-lg font-bold font-mono text-sport-green">${(10 * currentOdds).toFixed(2)}</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-sport-green" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Selections"}
            </Button>
            <Button className="flex-1 gap-2">
              <Zap className="w-4 h-4" />
              Place Bet
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selections */}
      <div className="space-y-3">
        {selections.map((selection, index) => (
          <motion.div
            key={selection.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8">
                        <Image src={selection.fixture.homeTeam.logo || ""} alt="" fill className="object-contain" />
                      </div>
                      <span className="text-sm font-medium">vs</span>
                      <div className="relative w-8 h-8">
                        <Image src={selection.fixture.awayTeam.logo || ""} alt="" fill className="object-contain" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {selection.fixture.homeTeam.name} vs {selection.fixture.awayTeam.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selection.fixture.league.name} · {new Date(selection.fixture.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-sport-red"
                    onClick={() => removeSelection(selection.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mt-3 flex items-center gap-4">
                  <Badge variant="outline" className="text-sport-green border-sport-green/30">
                    {selection.selection}
                  </Badge>
                  <span className="font-mono font-bold">@{selection.odds}</span>
                  <div className="flex items-center gap-1 text-xs">
                    <Shield className="w-3 h-3 text-sport-blue" />
                    <span>{selection.confidence}% confidence</span>
                  </div>
                </div>

                <div className="mt-2 p-2 rounded-lg bg-white/5 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  {selection.reason}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selections.length === 0 && (
        <div className="text-center py-8 glass-card">
          <p className="text-muted-foreground">No selections remaining</p>
          <Button variant="outline" className="mt-4 gap-2">
            <Plus className="w-4 h-4" />
            Add Selections
          </Button>
        </div>
      )}
    </div>
  );
}
