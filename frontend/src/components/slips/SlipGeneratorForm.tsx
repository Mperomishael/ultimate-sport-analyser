"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, Zap, Shield, AlertTriangle } from "lucide-react";

interface GenerateSlipsFormProps {
  onSubmit: (config: SlipGenerationConfig) => void;
  isLoading?: boolean;
}

export interface SlipGenerationConfig {
  numberOfSlips: number;
  matchesPerSlip: number;
  targetOdds: number;
  allowedMarkets: string[];
  minConfidence: number;
  engineMode: "SAFE" | "BALANCED" | "AGGRESSIVE";
  excludeLeagues: number[];
}

const MARKET_OPTIONS = [
  { value: "Over 1.5 Goals", label: "Over 1.5 Goals", category: "safe" },
  { value: "Under 4.5 Goals", label: "Under 4.5 Goals", category: "safe" },
  { value: "Double Chance", label: "Double Chance", category: "safe" },
  { value: "Team Over 0.5 Goals", label: "Team Over 0.5 Goals", category: "safe" },
  { value: "Over 2.5 Goals", label: "Over 2.5 Goals", category: "balanced" },
  { value: "Draw No Bet", label: "Draw No Bet", category: "balanced" },
  { value: "BTTS", label: "Both Teams To Score", category: "aggressive" },
  { value: "Handicap", label: "Handicap", category: "aggressive" },
];

const ENGINE_MODES = [
  {
    id: "SAFE",
    label: "Safe Mode",
    description: "Conservative: High confidence, stable leagues, low correlation",
    icon: Shield,
    color: "text-green-600",
  },
  {
    id: "BALANCED",
    label: "Balanced Mode",
    description: "Moderate risk: Mix of proven and emerging patterns",
    icon: Zap,
    color: "text-blue-600",
  },
  {
    id: "AGGRESSIVE",
    label: "Aggressive Mode",
    description: "Higher risk: All markets available, lower confidence threshold",
    icon: AlertTriangle,
    color: "text-orange-600",
  },
];

export function SlipGeneratorForm({
  onSubmit,
  isLoading = false,
}: GenerateSlipsFormProps) {
  const [config, setConfig] = useState<SlipGenerationConfig>({
    numberOfSlips: 3,
    matchesPerSlip: 5,
    targetOdds: 12,
    allowedMarkets: ["Over 1.5 Goals", "Double Chance", "Team Over 0.5 Goals"],
    minConfidence: 75,
    engineMode: "SAFE",
    excludeLeagues: [],
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [oddsWarning, setOddsWarning] = useState<string | null>(null);

  // Validate odds
  React.useEffect(() => {
    const avgOddsPerSlip = Math.pow(
      config.targetOdds,
      1 / config.numberOfSlips
    );

    if (config.engineMode === "SAFE" && avgOddsPerSlip > 2.5) {
      setOddsWarning(
        `SAFE mode typically can't achieve ${config.targetOdds} odds (${avgOddsPerSlip.toFixed(2)} per slip). Try max ${Math.pow(2.5, config.numberOfSlips).toFixed(2)}.`
      );
    } else if (config.engineMode === "BALANCED" && avgOddsPerSlip > 3.2) {
      setOddsWarning(
        `BALANCED mode ambitious for ${config.targetOdds} odds. Recommend max ${Math.pow(3, config.numberOfSlips).toFixed(2)}.`
      );
    } else {
      setOddsWarning(null);
    }
  }, [config.targetOdds, config.numberOfSlips, config.engineMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  const getAvailableMarkets = () => {
    const allMarkets = MARKET_OPTIONS.map((m) => m.value);

    if (config.engineMode === "SAFE") {
      return allMarkets.filter(
        (m) =>
          MARKET_OPTIONS.find((opt) => opt.value === m)?.category === "safe"
      );
    } else if (config.engineMode === "BALANCED") {
      return allMarkets.filter(
        (m) =>
          ["safe", "balanced"].includes(
            MARKET_OPTIONS.find((opt) => opt.value === m)?.category || ""
          )
      );
    }
    return allMarkets;
  };

  const selectedMode = ENGINE_MODES.find((m) => m.id === config.engineMode);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Engine Mode Selection */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Prediction Engine Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {ENGINE_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() =>
                    setConfig({ ...config, engineMode: mode.id as any })
                  }
                  className={`p-4 rounded-lg border-2 transition-all ${
                    config.engineMode === mode.id
                      ? "border-sport-blue bg-sport-blue/10"
                      : "border-border bg-card hover:border-sport-blue/50"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${mode.color} mb-2`} />
                  <p className="font-medium text-sm text-foreground">
                    {mode.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {mode.description}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Basic Settings */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Slip Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Number of Slips
              </label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[config.numberOfSlips]}
                  onValueChange={(val) =>
                    setConfig({ ...config, numberOfSlips: val[0] })
                  }
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="outline">{config.numberOfSlips}</Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Matches Per Slip
              </label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[config.matchesPerSlip]}
                  onValueChange={(val) =>
                    setConfig({ ...config, matchesPerSlip: val[0] })
                  }
                  min={2}
                  max={7}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="outline">{config.matchesPerSlip}</Badge>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Target Total Odds (leave 0 for any)
            </label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={config.targetOdds}
              onChange={(e) =>
                setConfig({
                  ...config,
                  targetOdds: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="e.g., 12.5"
              className="bg-background/50 border-white/5"
            />
            {oddsWarning && (
              <div className="mt-2 flex gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>{oddsWarning}</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Minimum Confidence Threshold
            </label>
            <div className="flex items-center gap-4">
              <Slider
                value={[config.minConfidence]}
                onValueChange={(val) =>
                  setConfig({ ...config, minConfidence: val[0] })
                }
                min={60}
                max={95}
                step={5}
                className="flex-1"
              />
              <Badge variant="outline">{config.minConfidence}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Selection */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Allowed Markets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {getAvailableMarkets().map((market) => (
            <div key={market} className="flex items-center space-x-2">
              <Checkbox
                id={market}
                checked={config.allowedMarkets.includes(market)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setConfig({
                      ...config,
                      allowedMarkets: [...config.allowedMarkets, market],
                    });
                  } else {
                    setConfig({
                      ...config,
                      allowedMarkets: config.allowedMarkets.filter(
                        (m) => m !== market
                      ),
                    });
                  }
                }}
              />
              <label
                htmlFor={market}
                className="text-sm font-medium cursor-pointer"
              >
                {market}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card className="border-border bg-card">
        <CardHeader>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 w-full"
          >
            <CardTitle className="text-base">Advanced Options</CardTitle>
            <span className="text-xs text-muted-foreground ml-auto">
              {showAdvanced ? "▼" : "▶"}
            </span>
          </button>
        </CardHeader>
        {showAdvanced && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Additional filtering and customization options coming soon...
            </p>
          </CardContent>
        )}
      </Card>

      {/* Important Notes */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-green-800">
            <p className="font-medium">✓ Safety Features Active</p>
            <ul className="text-xs space-y-1 ml-4">
              <li>• Correlation detection enabled</li>
              <li>• League reliability filtering enabled</li>
              <li>• Slip diversification optimized</li>
              <li>• Confidence calibration applied</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || config.allowedMarkets.length === 0}
        className="w-full"
        size="lg"
      >
        {isLoading ? "Generating..." : "Generate Diverse Slips"}
      </Button>

      {config.allowedMarkets.length === 0 && (
        <p className="text-xs text-amber-600">
          Please select at least one market
        </p>
      )}
    </form>
  );
}
