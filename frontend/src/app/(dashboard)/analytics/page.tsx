"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Target, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const accuracyData = [
  { market: "Over 1.5", accuracy: 78, total: 120 },
  { market: "Over 2.5", accuracy: 72, total: 98 },
  { market: "BTTS", accuracy: 68, total: 85 },
  { market: "Home Win", accuracy: 65, total: 110 },
  { market: "Away Win", accuracy: 58, total: 75 },
  { market: "Draw", accuracy: 42, total: 60 },
];

const weeklyData = [
  { day: "Mon", predictions: 12, wins: 9 },
  { day: "Tue", predictions: 18, wins: 13 },
  { day: "Wed", predictions: 15, wins: 10 },
  { day: "Thu", predictions: 22, wins: 16 },
  { day: "Fri", predictions: 20, wins: 14 },
  { day: "Sat", predictions: 35, wins: 26 },
  { day: "Sun", predictions: 30, wins: 22 },
];

const confidenceDistribution = [
  { name: "High (75%+)", value: 35, color: "#10B981" },
  { name: "Medium (55-74%)", value: 45, color: "#F59E0B" },
  { name: "Low (<55%)", value: 20, color: "#EF4444" },
];

const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-sport-blue" />
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1">Track prediction performance and insights</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Predictions", value: "1,247", icon: Target, color: "sport-green" },
          { title: "Win Rate", value: "72.4%", icon: Percent, color: "sport-blue" },
          { title: "Profit/Loss", value: "+18.5%", icon: TrendingUp, color: "sport-green" },
          { title: "Avg. Odds", value: "1.82", icon: BarChart3, color: "sport-purple" },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Accuracy by Market</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="market" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: "#94a3b8" }} />
                <YAxis tick={{ fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                />
                <Line type="monotone" dataKey="predictions" stroke="#3B82F6" strokeWidth={2} dot={{ fill: "#3B82F6" }} />
                <Line type="monotone" dataKey="wins" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Confidence Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={confidenceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {confidenceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">League Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { league: "Premier League", accuracy: 74, total: 320 },
              { league: "La Liga", accuracy: 71, total: 280 },
              { league: "Bundesliga", accuracy: 76, total: 210 },
              { league: "Serie A", accuracy: 69, total: 240 },
              { league: "Ligue 1", accuracy: 67, total: 197 },
            ].map((l) => (
              <div key={l.league} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{l.league}</span>
                  <span className="font-mono">{l.accuracy}% ({l.total})</span>
                </div>
                <div className="stat-bar">
                  <div
                    className="stat-bar-fill bg-sport-green"
                    style={{ width: `${l.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
