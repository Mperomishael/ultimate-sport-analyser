"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, SlidersHorizontal, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PredictionCard } from "@/components/predictions/PredictionCard";
import { PredictionDetailModal } from "@/components/predictions/PredictionDetailModal";
import type { Prediction } from "@/types";

const mockPredictions: Prediction[] = [
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
    over15: 88,
    over25: 78,
    btts: 72,
    homeWin: 45,
    awayWin: 28,
    draw: 27,
    doubleChanceHomeDraw: 72,
    doubleChanceHomeAway: 73,
    doubleChanceDrawAway: 55,
    drawNoBetHome: 62,
    drawNoBetAway: 38,
    overallConfidence: 78,
    recommendedBet: "Over 2.5 Goals",
    valueRating: 8.2,
    status: "PENDING",
    createdAt: "2026-05-29T07:00:00Z",
  },
  {
    id: "2",
    fixture: {
      id: 2,
      homeTeam: { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
      awayTeam: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
      league: { id: 140, name: "La Liga", country: "Spain" },
      date: "2026-05-29T20:00:00Z",
      status: "NS",
    },
    over15: 92,
    over25: 85,
    btts: 80,
    homeWin: 42,
    awayWin: 35,
    draw: 23,
    doubleChanceHomeDraw: 65,
    doubleChanceHomeAway: 77,
    doubleChanceDrawAway: 58,
    drawNoBetHome: 55,
    drawNoBetAway: 45,
    overallConfidence: 85,
    recommendedBet: "BTTS Yes",
    valueRating: 7.8,
    status: "PENDING",
    createdAt: "2026-05-29T07:00:00Z",
  },
  {
    id: "3",
    fixture: {
      id: 3,
      homeTeam: { id: 157, name: "Bayern Munich", logo: "https://media.api-sports.io/football/teams/157.png" },
      awayTeam: { id: 165, name: "Dortmund", logo: "https://media.api-sports.io/football/teams/165.png" },
      league: { id: 78, name: "Bundesliga", country: "Germany" },
      date: "2026-05-29T18:30:00Z",
      status: "NS",
    },
    over15: 90,
    over25: 82,
    btts: 68,
    homeWin: 62,
    awayWin: 18,
    draw: 20,
    doubleChanceHomeDraw: 82,
    doubleChanceHomeAway: 80,
    doubleChanceDrawAway: 38,
    drawNoBetHome: 75,
    drawNoBetAway: 25,
    overallConfidence: 82,
    recommendedBet: "Home Win",
    valueRating: 7.5,
    status: "PENDING",
    createdAt: "2026-05-29T07:00:00Z",
  },
  {
    id: "4",
    fixture: {
      id: 4,
      homeTeam: { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" },
      awayTeam: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
      league: { id: 39, name: "Premier League", country: "England" },
      date: "2026-05-29T16:30:00Z",
      status: "NS",
    },
    over15: 85,
    over25: 65,
    btts: 70,
    homeWin: 48,
    awayWin: 28,
    draw: 24,
    doubleChanceHomeDraw: 72,
    doubleChanceHomeAway: 76,
    doubleChanceDrawAway: 52,
    drawNoBetHome: 62,
    drawNoBetAway: 38,
    overallConfidence: 70,
    recommendedBet: "Over 1.5 Goals",
    valueRating: 6.8,
    status: "PENDING",
    createdAt: "2026-05-29T07:00:00Z",
  },
  {
    id: "5",
    fixture: {
      id: 5,
      homeTeam: { id: 85, name: "PSG", logo: "https://media.api-sports.io/football/teams/85.png" },
      awayTeam: { id: 81, name: "Marseille", logo: "https://media.api-sports.io/football/teams/81.png" },
      league: { id: 61, name: "Ligue 1", country: "France" },
      date: "2026-05-29T20:45:00Z",
      status: "NS",
    },
    over15: 82,
    over25: 58,
    btts: 55,
    homeWin: 58,
    awayWin: 20,
    draw: 22,
    doubleChanceHomeDraw: 80,
    doubleChanceHomeAway: 78,
    doubleChanceDrawAway: 42,
    drawNoBetHome: 72,
    drawNoBetAway: 28,
    overallConfidence: 72,
    recommendedBet: "Home Win",
    valueRating: 6.5,
    status: "PENDING",
    createdAt: "2026-05-29T07:00:00Z",
  },
];

const confidenceFilters = [
  { label: "All", value: "all" },
  { label: "High (75%+)", value: "high" },
  { label: "Medium (55-74%)", value: "medium" },
  { label: "Low (<55%)", value: "low" },
];

const marketFilters = [
  { label: "All Markets", value: "all" },
  { label: "Over/Under", value: "over_under" },
  { label: "BTTS", value: "btts" },
  { label: "1X2", value: "1x2" },
  { label: "Double Chance", value: "dc" },
];

export default function PredictionsPage() {
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPredictions = mockPredictions.filter((pred) => {
    if (confidenceFilter === "high" && pred.overallConfidence < 75) return false;
    if (confidenceFilter === "medium" && (pred.overallConfidence < 55 || pred.overallConfidence >= 75)) return false;
    if (confidenceFilter === "low" && pred.overallConfidence >= 55) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        pred.fixture.homeTeam.name.toLowerCase().includes(query) ||
        pred.fixture.awayTeam.name.toLowerCase().includes(query) ||
        pred.fixture.league.name.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Predictions</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered match predictions with confidence scoring
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search teams, leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
          <div className="flex gap-2">
            <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                {confidenceFilters.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger className="w-[160px]">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Market" />
              </SelectTrigger>
              <SelectContent>
                {marketFilters.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {confidenceFilter !== "all" && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setConfidenceFilter("all")}>
              {confidenceFilters.find((f) => f.value === confidenceFilter)?.label} ×
            </Badge>
          )}
          {marketFilter !== "all" && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setMarketFilter("all")}>
              {marketFilters.find((f) => f.value === marketFilter)?.label} ×
            </Badge>
          )}
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {filteredPredictions.map((prediction, index) => (
            <motion.div
              key={prediction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedPrediction(prediction)}
              className="cursor-pointer"
            >
              <PredictionCard prediction={prediction} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPredictions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No predictions match your filters</p>
          <Button variant="outline" className="mt-4" onClick={() => { setConfidenceFilter("all"); setMarketFilter("all"); setSearchQuery(""); }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      <PredictionDetailModal
        prediction={selectedPrediction}
        open={!!selectedPrediction}
        onClose={() => setSelectedPrediction(null)}
      />
    </div>
  );
}
