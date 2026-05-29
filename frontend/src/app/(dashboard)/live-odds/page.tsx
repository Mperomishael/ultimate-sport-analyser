"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Activity, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockLiveMatches = [
  {
    id: 1,
    homeTeam: { name: "Man City", logo: "https://media.api-sports.io/football/teams/50.png", score: 2 },
    awayTeam: { name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png", score: 1 },
    league: "Premier League",
    elapsed: 67,
    status: "2H",
    odds: {
      home: { current: 1.35, opening: 1.55, trend: "down" },
      draw: { current: 5.2, opening: 4.5, trend: "up" },
      away: { current: 9.5, opening: 6.0, trend: "up" },
      over25: { current: 1.45, opening: 1.65, trend: "down" },
    },
  },
  {
    id: 2,
    homeTeam: { name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png", score: 0 },
    awayTeam: { name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png", score: 0 },
    league: "La Liga",
    elapsed: 23,
    status: "1H",
    odds: {
      home: { current: 2.1, opening: 2.05, trend: "up" },
      draw: { current: 3.4, opening: 3.5, trend: "down" },
      away: { current: 3.6, opening: 3.7, trend: "down" },
      over25: { current: 1.85, opening: 1.75, trend: "up" },
    },
  },
  {
    id: 3,
    homeTeam: { name: "Bayern", logo: "https://media.api-sports.io/football/teams/157.png", score: 3 },
    awayTeam: { name: "Dortmund", logo: "https://media.api-sports.io/football/teams/165.png", score: 1 },
    league: "Bundesliga",
    elapsed: 78,
    status: "2H",
    odds: {
      home: { current: 1.05, opening: 1.45, trend: "down" },
      draw: { current: 15.0, opening: 5.0, trend: "up" },
      away: { current: 35.0, opening: 7.0, trend: "up" },
      over25: { current: 1.15, opening: 1.55, trend: "down" },
    },
  },
];

function OddsMovement({ current, opening, trend }: { current: number; opening: number; trend: string }) {
  const change = ((current - opening) / opening * 100).toFixed(1);
  const isPositive = parseFloat(change) > 0;

  return (
    <div className="flex items-center gap-1">
      <span className="font-mono font-bold">{current.toFixed(2)}</span>
      <span className={`text-xs flex items-center gap-0.5 ${isPositive ? "text-sport-red" : "text-sport-green"}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(parseFloat(change)).toFixed(1)}%
      </span>
    </div>
  );
}

export default function LiveOddsPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="w-8 h-8 text-sport-green animate-pulse" />
            Live Odds
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time odds movement and live match tracking
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleRefresh}>
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockLiveMatches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{match.league}</Badge>
                    <Badge className="bg-sport-red/20 text-sport-red border-sport-red/30">
                      LIVE {match.elapsed}'
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">Odds updated: 2m ago</span>
                </div>

                <div className="flex items-center justify-center gap-8 mb-6">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <Image src={match.homeTeam.logo} alt="" fill className="object-contain" />
                    </div>
                    <p className="font-semibold">{match.homeTeam.name}</p>
                  </div>

                  <div className="text-center px-8">
                    <p className="text-5xl font-bold tabular-nums">
                      {match.homeTeam.score} - {match.awayTeam.score}
                    </p>
                    <p className="text-sm text-sport-red font-medium mt-1">
                      {match.status === "HT" ? "HALF TIME" : `${match.elapsed}'`}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <Image src={match.awayTeam.logo} alt="" fill className="object-contain" />
                    </div>
                    <p className="font-semibold">{match.awayTeam.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(match.odds).map(([market, data]) => (
                    <div key={market} className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground capitalize mb-1">
                        {market === "over25" ? "Over 2.5" : market}
                      </p>
                      <OddsMovement {...data} />
                      <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            data.trend === "up" ? "bg-sport-red" : "bg-sport-green"
                          }`}
                          style={{ width: `${Math.min(Math.abs((data.current - data.opening) / data.opening * 100 * 3), 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
