"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TrendingUp, Clock, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfidenceMeter } from "./ConfidenceMeter";
import type { Prediction } from "@/types";

interface PredictionCardProps {
  prediction: Prediction;
  compact?: boolean;
}

export function PredictionCard({ prediction, compact = false }: PredictionCardProps) {
  const { fixture, overallConfidence, recommendedBet, valueRating } = prediction;

  const getConfidenceColor = (score: number) => {
    if (score >= 75) return "confidence-high";
    if (score >= 55) return "confidence-medium";
    return "confidence-low";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 75) return "High";
    if (score >= 55) return "Medium";
    return "Low";
  };

  const matchTime = new Date(fixture.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      className="glass-card-hover p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px]">
            {fixture.league.name}
          </Badge>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {matchTime}
          </span>
          {fixture.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {fixture.venue}
            </span>
          )}
        </div>
        <Badge className={`${getConfidenceColor(overallConfidence)} text-[10px]`}>
          {getConfidenceLabel(overallConfidence)} Confidence
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        {/* Teams */}
        <div className="flex items-center gap-6 flex-1">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-10 h-10">
              <Image
                src={fixture.homeTeam.logo || "/placeholder-team.png"}
                alt={fixture.homeTeam.name}
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="font-semibold text-sm">{fixture.homeTeam.name}</p>
              <p className="text-xs text-muted-foreground">Home</p>
            </div>
          </div>

          <div className="text-center px-4">
            <span className="text-lg font-bold text-muted-foreground">VS</span>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="text-right">
              <p className="font-semibold text-sm">{fixture.awayTeam.name}</p>
              <p className="text-xs text-muted-foreground">Away</p>
            </div>
            <div className="relative w-10 h-10">
              <Image
                src={fixture.awayTeam.logo || "/placeholder-team.png"}
                alt={fixture.awayTeam.name}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Details */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ConfidenceMeter value={overallConfidence} size="sm" />
              <div>
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="text-lg font-bold">{overallConfidence}%</p>
              </div>
            </div>

            <div className="h-8 w-px bg-border" />

            <div>
              <p className="text-xs text-muted-foreground">Best Bet</p>
              <p className="text-sm font-semibold text-sport-green flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {recommendedBet}
              </p>
            </div>

            {valueRating && (
              <>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-xs text-muted-foreground">Value</p>
                  <p className="text-sm font-semibold text-sport-yellow">{valueRating}/10</p>
                </div>
              </>
            )}
          </div>

          <Button size="sm" variant="outline" className="gap-1">
            <Plus className="w-3 h-3" />
            Add to Slip
          </Button>
        </div>

        {/* Market Probabilities */}
        {!compact && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              { label: "Over 1.5", value: prediction.over15 },
              { label: "Over 2.5", value: prediction.over25 },
              { label: "BTTS", value: prediction.btts },
              { label: "Home Win", value: prediction.homeWin },
            ].map((market) => (
              <div key={market.label} className="bg-white/5 rounded-lg p-2 text-center">
                <p className="text-[10px] text-muted-foreground">{market.label}</p>
                <p className="text-sm font-bold">{market.value}%</p>
                <div className="stat-bar mt-1">
                  <div
                    className="stat-bar-fill bg-sport-blue"
                    style={{ width: `${market.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
