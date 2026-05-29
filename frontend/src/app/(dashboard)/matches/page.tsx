"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, Filter, Search, Clock, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockMatches = [
  {
    id: 1,
    homeTeam: { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png" },
    awayTeam: { id: 34, name: "Newcastle", logo: "https://media.api-sports.io/football/teams/34.png" },
    league: { id: 39, name: "Premier League", country: "England" },
    date: "2026-05-29T19:00:00Z",
    status: "NS",
    venue: "Old Trafford",
  },
  {
    id: 2,
    homeTeam: { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
    awayTeam: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
    league: { id: 140, name: "La Liga", country: "Spain" },
    date: "2026-05-29T20:00:00Z",
    status: "NS",
    venue: "Camp Nou",
  },
  {
    id: 3,
    homeTeam: { id: 157, name: "Bayern Munich", logo: "https://media.api-sports.io/football/teams/157.png" },
    awayTeam: { id: 165, name: "Dortmund", logo: "https://media.api-sports.io/football/teams/165.png" },
    league: { id: 78, name: "Bundesliga", country: "Germany" },
    date: "2026-05-29T18:30:00Z",
    status: "NS",
    venue: "Allianz Arena",
  },
  {
    id: 4,
    homeTeam: { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" },
    awayTeam: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
    league: { id: 39, name: "Premier League", country: "England" },
    date: "2026-05-29T16:30:00Z",
    status: "NS",
    venue: "Anfield",
  },
  {
    id: 5,
    homeTeam: { id: 85, name: "PSG", logo: "https://media.api-sports.io/football/teams/85.png" },
    awayTeam: { id: 81, name: "Marseille", logo: "https://media.api-sports.io/football/teams/81.png" },
    league: { id: 61, name: "Ligue 1", country: "France" },
    date: "2026-05-29T20:45:00Z",
    status: "NS",
    venue: "Parc des Princes",
  },
];

export default function MatchesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("all");

  const filteredMatches = mockMatches.filter((match) => {
    if (leagueFilter !== "all" && match.league.name !== leagueFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        match.homeTeam.name.toLowerCase().includes(q) ||
        match.awayTeam.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const leagues = [...new Set(mockMatches.map((m) => m.league.name))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="w-8 h-8 text-sport-blue" />
          Matches
        </h1>
        <p className="text-muted-foreground mt-1">Browse upcoming fixtures and live matches</p>
      </div>

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>
        <Select value={leagueFilter} onValueChange={setLeagueFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="League" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leagues</SelectItem>
            {leagues.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="bg-white/5">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="finished">Finished</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <div className="space-y-3">
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card-hover p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Badge variant="outline">{match.league.name}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(match.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {match.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {match.venue}
                      </span>
                    )}
                  </div>
                  <Button size="sm" variant="outline">Analyze</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative w-10 h-10">
                      <Image src={match.homeTeam.logo || ""} alt="" fill className="object-contain" />
                    </div>
                    <span className="font-semibold">{match.homeTeam.name}</span>
                  </div>
                  <span className="text-lg font-bold text-muted-foreground px-4">VS</span>
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <span className="font-semibold">{match.awayTeam.name}</span>
                    <div className="relative w-10 h-10">
                      <Image src={match.awayTeam.logo || ""} alt="" fill className="object-contain" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live">
          <div className="text-center py-12 text-muted-foreground">No live matches currently</div>
        </TabsContent>

        <TabsContent value="finished">
          <div className="text-center py-12 text-muted-foreground">No finished matches today</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
