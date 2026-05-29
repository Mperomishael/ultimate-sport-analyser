"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const mockLiveOdds = [
  { match: "Man Utd vs Newcastle", market: "Over 2.5", odds: 1.85, change: 0.05, trend: "up" },
  { match: "Barcelona vs Real Madrid", market: "BTTS Yes", odds: 1.72, change: -0.03, trend: "down" },
  { match: "Bayern vs Dortmund", market: "Home Win", odds: 1.55, change: 0.02, trend: "up" },
  { match: "Liverpool vs Arsenal", market: "Over 1.5", odds: 1.25, change: 0.0, trend: "stable" },
  { match: "PSG vs Marseille", market: "Away Win", odds: 4.2, change: 0.15, trend: "up" },
  { match: "Inter vs Juventus", market: "Draw", odds: 3.4, change: -0.1, trend: "down" },
  { match: "Ajax vs Feyenoord", market: "Over 2.5", odds: 1.68, change: 0.08, trend: "up" },
];

export function LiveOddsTicker() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    let animationId: number;
    let scrollPos = 0;

    const animate = () => {
      scrollPos += 0.5;
      if (scrollPos >= scrollContainer.scrollWidth / 2) {
        scrollPos = 0;
      }
      scrollContainer.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  return (
    <div
      className="glass-card overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
        <Activity className="w-4 h-4 text-sport-green animate-pulse" />
        <span className="text-sm font-medium">Live Odds Movement</span>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 px-4 py-3 overflow-hidden whitespace-nowrap"
        style={{ scrollbarWidth: "none" }}
      >
        {[...mockLiveOdds, ...mockLiveOdds].map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 flex-shrink-0"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-sm font-medium">{item.match}</span>
            <span className="text-xs text-muted-foreground">{item.market}</span>
            <span className="font-mono font-bold text-sm">{item.odds.toFixed(2)}</span>
            <span
              className={`flex items-center gap-0.5 text-xs ${
                item.trend === "up"
                  ? "text-sport-green"
                  : item.trend === "down"
                  ? "text-sport-red"
                  : "text-muted-foreground"
              }`}
            >
              {item.trend === "up" ? (
                <TrendingUp className="w-3 h-3" />
              ) : item.trend === "down" ? (
                <TrendingDown className="w-3 h-3" />
              ) : null}
              {item.change !== 0 && `${item.change > 0 ? "+" : ""}${item.change.toFixed(2)}`}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
