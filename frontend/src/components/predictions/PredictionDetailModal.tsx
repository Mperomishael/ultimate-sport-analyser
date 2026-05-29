"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  TrendingUp,
  Shield,
  Activity,
  Users,
  Target,
  Zap,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfidenceMeter } from "./ConfidenceMeter";
import type { PredictionDetail } from "@/types";

interface PredictionDetailModalProps {
  prediction: PredictionDetail | null;
  open: boolean;
  onClose: () => void;
}

export function PredictionDetailModal({ prediction, open, onClose }: PredictionDetailModalProps) {
  if (!prediction) return null;

  const { fixture } = prediction;

  const analysisScores = [
    { label: "Home Form", value: prediction.homeFormScore, icon: Target, color: "sport-green" },
    { label: "Away Form", value: prediction.awayFormScore, icon: Activity, color: "sport-blue" },
    { label: "H2H Record", value: prediction.h2hScore, icon: Users, color: "sport-purple" },
    { label: "Home/Away", value: prediction.homeAwayScore, icon: Shield, color: "sport-yellow" },
    { label: "Goals Trend", value: prediction.goalsTrendScore, icon: TrendingUp, color: "sport-orange" },
    { label: "Injuries", value: prediction.injuryScore, icon: AlertTriangle, color: "sport-red" },
    { label: "Odds Movement", value: prediction.oddsMovementScore, icon: Zap, color: "sport-green" },
  ];

  const marketOdds = [
    { label: "Over 1.5", probability: prediction.over15, bookmakerOdds: 1.25 },
    { label: "Over 2.5", probability: prediction.over25, bookmakerOdds: 1.85 },
    { label: "BTTS Yes", probability: prediction.btts, bookmakerOdds: 1.72 },
    { label: "Home Win", probability: prediction.homeWin, bookmakerOdds: 2.1 },
    { label: "Away Win", probability: prediction.awayWin, bookmakerOdds: 3.4 },
    { label: "Draw", probability: prediction.draw, bookmakerOdds: 3.6 },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-white/10">
        <DialogHeader>
          <DialogTitle className="sr-only">Prediction Details</DialogTitle>
        </DialogHeader>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Match Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{fixture.league.name}</Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(fixture.date).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Teams */}
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <Image
                    src={fixture.homeTeam.logo || "/placeholder-team.png"}
                    alt={fixture.homeTeam.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="font-bold text-lg">{fixture.homeTeam.name}</p>
                <p className="text-sm text-muted-foreground">Home</p>
              </div>

              <div className="text-center px-8">
                <p className="text-3xl font-bold text-muted-foreground">VS</p>
                <div className="mt-2">
                  <ConfidenceMeter value={prediction.overallConfidence} size="md" showLabel />
                </div>
              </div>

              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <Image
                    src={fixture.awayTeam.logo || "/placeholder-team.png"}
                    alt={fixture.awayTeam.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="font-bold text-lg">{fixture.awayTeam.name}</p>
                <p className="text-sm text-muted-foreground">Away</p>
              </div>
            </div>

            {/* Recommended Bet Banner */}
            <div className="bg-gradient-to-r from-sport-green/20 to-sport-blue/20 border border-sport-green/30 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recommended Bet</p>
                <p className="text-xl font-bold text-sport-green">{prediction.recommendedBet}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Value Rating</p>
                <p className="text-2xl font-bold text-sport-yellow">{prediction.valueRating}/10</p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="markets" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/5">
                <TabsTrigger value="markets">Markets & Odds</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="stats">Team Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="markets" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {marketOdds.map((market) => (
                    <div
                      key={market.label}
                      className="glass-card p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{market.label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={market.probability} className="w-24 h-2" />
                          <span className="text-sm font-mono">{market.probability}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Best Odds</p>
                        <p className="text-lg font-bold font-mono text-sport-green">
                          {market.bookmakerOdds.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="mt-4">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-sport-blue" />
                    Score Breakdown
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysisScores.map((score) => (
                      <div key={score.label} className="glass-card p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <score.icon className={`w-4 h-4 text-${score.color}`} />
                            <span className="text-sm">{score.label}</span>
                          </div>
                          <span className="font-bold">{score.value}%</span>
                        </div>
                        <Progress value={score.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-card p-4">
                    <h4 className="font-semibold mb-3">{fixture.homeTeam.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Last 5</span><span className="font-mono">W-W-D-L-W</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Goals Scored (5)</span><span className="font-mono">12</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Goals Conceded (5)</span><span className="font-mono">6</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Home Record</span><span className="font-mono">8-2-1</span></div>
                    </div>
                  </div>
                  <div className="glass-card p-4">
                    <h4 className="font-semibold mb-3">{fixture.awayTeam.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Last 5</span><span className="font-mono">L-W-W-D-L</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Goals Scored (5)</span><span className="font-mono">8</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Goals Conceded (5)</span><span className="font-mono">9</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Away Record</span><span className="font-mono">4-3-4</span></div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
