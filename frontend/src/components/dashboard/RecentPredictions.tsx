"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Minus, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const recentPredictions = [
  {
    id: "1",
    match: "Chelsea vs Tottenham",
    prediction: "Over 2.5",
    odds: 1.85,
    result: "won",
    confidence: 76,
    score: "3-1",
  },
  {
    id: "2",
    match: "Atletico vs Sevilla",
    prediction: "Home Win",
    odds: 1.65,
    result: "won",
    confidence: 68,
    score: "2-0",
  },
  {
    id: "3",
    match: "Napoli vs Roma",
    prediction: "BTTS Yes",
    odds: 1.75,
    result: "lost",
    confidence: 62,
    score: "0-0",
  },
  {
    id: "4",
    match: "Leverkusen vs Leipzig",
    prediction: "Over 1.5",
    odds: 1.25,
    result: "won",
    confidence: 82,
    score: "2-2",
  },
  {
    id: "5",
    match: "Porto vs Benfica",
    prediction: "Draw No Bet Home",
    odds: 1.45,
    result: "pending",
    confidence: 71,
    score: null,
  },
];

export function RecentPredictions() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Predictions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentPredictions.map((pred, index) => (
          <motion.div
            key={pred.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  pred.result === "won"
                    ? "bg-sport-green/20 text-sport-green"
                    : pred.result === "lost"
                    ? "bg-sport-red/20 text-sport-red"
                    : "bg-sport-yellow/20 text-sport-yellow"
                }`}
              >
                {pred.result === "won" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : pred.result === "lost" ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{pred.match}</p>
                <p className="text-xs text-muted-foreground">
                  {pred.prediction} @ {pred.odds}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono">{pred.score || "Live"}</p>
              <p className="text-[10px] text-muted-foreground">{pred.confidence}% conf</p>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
