"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Target,
  Shield,
  Zap,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceMeter } from "@/components/predictions/ConfidenceMeter";
import { PredictionCard } from "@/components/predictions/PredictionCard";
import { LiveOddsTicker } from "@/components/dashboard/LiveOddsTicker";
import { RecentPredictions } from "@/components/dashboard/RecentPredictions";

const stats = [
  {
    title: "Today's Predictions",
    value: "24",
    change: "+12%",
    trend: "up",
    icon: Target,
    color: "sport-green",
  },
  {
    title: "Win Rate",
    value: "72.4%",
    change: "+3.2%",
    trend: "up",
    icon: TrendingUp,
    color: "sport-blue",
  },
  {
    title: "High Confidence",
    value: "8",
    change: "+2",
    trend: "up",
    icon: Shield,
    color: "sport-purple",
  },
  {
    title: "Live Matches",
    value: "16",
    change: "-4",
    trend: "down",
    icon: Activity,
    color: "sport-orange",
  },
];

const topPredictions = [
  {
    id: "1",
    fixture: {
      id: 1,
      homeTeam: { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png" },
      awayTeam: { id: 34, name: "Newcastle", logo: "https://media.api-sports.io/football/teams/34.png" },
      league: { id: 39, name: "Premier League", country: "England" },
      date: "2026-05-29T19:00:00Z",
      status: "NS",
    },
    over25: 78,
    btts: 72,
    homeWin: 45,
    overallConfidence: 78,
    recommendedBet: "Over 2.5 Goals",
    valueRating: 8.2,
  },
  {
    id: "2",
    fixture: {
      id: 2,
      homeTeam: { id: 50, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
      awayTeam: { id: 51, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
      league: { id: 140, name: "La Liga", country: "Spain" },
      date: "2026-05-29T20:00:00Z",
      status: "NS",
    },
    over25: 85,
    btts: 80,
    homeWin: 42,
    overallConfidence: 85,
    recommendedBet: "BTTS Yes",
    valueRating: 7.8,
  },
  {
    id: "3",
    fixture: {
      id: 3,
      homeTeam: { id: 157, name: "Bayern Munich", logo: "https://media.api-sports.io/football/teams/157.png" },
      awayTeam: { id: 160, name: "Dortmund", logo: "https://media.api-sports.io/football/teams/165.png" },
      league: { id: 78, name: "Bundesliga", country: "Germany" },
      date: "2026-05-29T18:30:00Z",
      status: "NS",
    },
    over25: 82,
    btts: 68,
    homeWin: 62,
    overallConfidence: 82,
    recommendedBet: "Home Win",
    valueRating: 7.5,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm text-sport-green">
            <Zap className="w-4 h-4" />
            Prediction Engine Active
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 text-xs">
                      {stat.trend === "up" ? (
                        <ArrowUpRight className={`w-3 h-3 text-sport-green`} />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-sport-red" />
                      )}
                      <span className={stat.trend === "up" ? "text-sport-green" : "text-sport-red"}>
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground">vs yesterday</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}/10`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Live Odds Ticker */}
      <LiveOddsTicker />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Predictions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-sport-green" />
              Top Predictions Today
            </h2>
            <a href="/predictions" className="text-sm text-primary hover:underline">
              View All
            </a>
          </div>
          <div className="space-y-3">
            {topPredictions.map((prediction, index) => (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PredictionCard prediction={prediction} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sport-blue" />
                Today's Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Matches</span>
                  <span className="font-medium">48</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-bar-fill bg-sport-blue" style={{ width: "60%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Predictions Generated</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-bar-fill bg-sport-green" style={{ width: "50%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">High Confidence</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-bar-fill bg-sport-purple" style={{ width: "16.6%" }} />
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Confidence</span>
                  <span className="font-bold text-sport-green">68.4%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <RecentPredictions />
        </div>
      </div>
    </div>
  );
}
