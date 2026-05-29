"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Sparkles, Settings, Trophy, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccumulatorResult } from "@/components/accumulator/AccumulatorResult";
import type { AccumulatorConfig } from "@/types";

const markets = [
  { id: "over15", label: "Over 1.5 Goals", defaultEnabled: true },
  { id: "over25", label: "Over 2.5 Goals", defaultEnabled: true },
  { id: "btts", label: "BTTS", defaultEnabled: true },
  { id: "homeWin", label: "Home Win", defaultEnabled: true },
  { id: "awayWin", label: "Away Win", defaultEnabled: false },
  { id: "draw", label: "Draw", defaultEnabled: false },
  { id: "doubleChance", label: "Double Chance", defaultEnabled: false },
  { id: "drawNoBet", label: "Draw No Bet", defaultEnabled: false },
];

const riskLevels = [
  { value: "low", label: "Conservative", description: "75%+ confidence", color: "sport-green" },
  { value: "medium", label: "Balanced", description: "55-75% confidence", color: "sport-yellow" },
  { value: "high", label: "Aggressive", description: "40%+ confidence", color: "sport-red" },
];

export default function AccumulatorPage() {
  const [config, setConfig] = useState<AccumulatorConfig>({
    targetOdds: 5.0,
    allowedMarkets: ["over15", "over25", "btts", "homeWin"],
    riskLevel: "medium",
    minConfidence: 60,
    maxSelections: 5,
    dateRange: "today",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setShowResults(true);
  };

  const toggleMarket = (marketId: string) => {
    setConfig((prev) => ({
      ...prev,
      allowedMarkets: prev.allowedMarkets.includes(marketId)
        ? prev.allowedMarkets.filter((m) => m !== marketId)
        : [...prev.allowedMarkets, marketId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="w-8 h-8 text-sport-purple" />
            Smart Accumulator
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-generated accumulator based on your risk preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Target Odds</Label>
                  <span className="font-mono font-bold text-sport-green">{config.targetOdds.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[config.targetOdds]}
                  onValueChange={([v]) => setConfig((p) => ({ ...p, targetOdds: v }))}
                  min={2}
                  max={20}
                  step={0.5}
                />
              </div>

              <div className="space-y-2">
                <Label>Risk Level</Label>
                <div className="grid grid-cols-3 gap-2">
                  {riskLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setConfig((p) => ({ ...p, riskLevel: level.value as any }))}
                      className={`p-2 rounded-lg border text-xs transition-all ${
                        config.riskLevel === level.value
                          ? `border-${level.color} bg-${level.color}/10 text-${level.color}`
                          : "border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="font-semibold">{level.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Min Confidence</Label>
                  <span className="font-mono">{config.minConfidence}%</span>
                </div>
                <Slider
                  value={[config.minConfidence]}
                  onValueChange={([v]) => setConfig((p) => ({ ...p, minConfidence: v }))}
                  min={40}
                  max={90}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Selections</Label>
                <Select
                  value={config.maxSelections.toString()}
                  onValueChange={(v) => setConfig((p) => ({ ...p, maxSelections: parseInt(v) }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8].map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n} picks</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select
                  value={config.dateRange}
                  onValueChange={(v) => setConfig((p) => ({ ...p, dateRange: v as any }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today Only</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Allowed Markets</Label>
                <div className="grid grid-cols-2 gap-2">
                  {markets.map((market) => (
                    <div key={market.id} className="flex items-center gap-2">
                      <Checkbox
                        id={market.id}
                        checked={config.allowedMarkets.includes(market.id)}
                        onCheckedChange={() => toggleMarket(market.id)}
                      />
                      <label htmlFor={market.id} className="text-xs cursor-pointer">{market.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full gap-2" onClick={handleGenerate} disabled={isGenerating || config.allowedMarkets.length === 0}>
                {isGenerating ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isGenerating ? "Generating..." : "Generate Accumulator"}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Odds Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Stake ($)</Label>
                <Input type="number" defaultValue={10} min={1} className="bg-background/50" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target Odds</span>
                <span className="font-mono font-bold">{config.targetOdds.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Potential Return</span>
                <span className="font-mono font-bold text-sport-green">${(10 * config.targetOdds).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {showResults ? (
            <AccumulatorResult config={config} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 glass-card">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Trophy className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate Your Accumulator</h3>
              <p className="text-muted-foreground max-w-md">
                Configure your preferences and let our AI engine find the optimal combination of
                high-confidence predictions to reach your target odds.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
