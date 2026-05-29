"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Settings,
  Ban,
  BarChart3,
  Key,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useJobStatus, useControlJobs } from "@/hooks/use-predictions";

const apiUsageData = [
  { provider: "API-Football", endpoint: "fixtures", used: 342, limit: 1000, cost: 0 },
  { provider: "API-Football", endpoint: "odds", used: 156, limit: 1000, cost: 0 },
  { provider: "API-Football", endpoint: "standings", used: 89, limit: 1000, cost: 0 },
  { provider: "The Odds API", endpoint: "sports", used: 12, limit: 500, cost: 0 },
  { provider: "The Odds API", endpoint: "odds", used: 234, limit: 500, cost: 0.12 },
];

const blacklistedLeagues = [
  { id: 1, name: "Some Regional League", reason: "Unreliable data", date: "2026-05-20" },
  { id: 2, name: "Youth Championship", reason: "Too unpredictable", date: "2026-05-18" },
];

const defaultWeights = {
  recentForm: 20,
  h2h: 15,
  homeAwayForm: 15,
  goalsTrend: 15,
  injuries: 10,
  oddsMovement: 10,
  standings: 10,
  motivation: 5,
};

interface AnalyticsData {
  overall: {
    totalPredictions: number;
    wonPredictions: number;
    lostPredictions: number;
    pushPredictions: number;
    winRate: string;
    avgConfidence: string;
    estimatedROI: string;
    bestWinStreak: number;
  };
  marketAccuracy: Array<{
    market: string;
    accuracy: string;
    volume: number;
    roi: string;
  }>;
  confidenceDistribution: {
    veryHigh: { count: number; percentage: string };
    high: { count: number; percentage: string };
    medium: { count: number; percentage: string };
    low: { count: number; percentage: string };
  };
}

export default function AdminPage() {
  const [weights, setWeights] = useState(defaultWeights);
  const [saved, setSaved] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState("30d");
  const { data: jobData } = useJobStatus();
  const { mutate: controlJobs } = useControlJobs();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/analytics?period=${period}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      }
    };
    fetchAnalytics();
  }, [period]);

  const handleSaveWeights = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setWeights(defaultWeights);
  };

  const updateWeight = (key: string, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-sport-red" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage predictions, weights, and system configuration
          </p>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-white/5">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="jobs">Background Jobs</TabsTrigger>
          <TabsTrigger value="weights">Prediction Weights</TabsTrigger>
          <TabsTrigger value="api">API Usage</TabsTrigger>
          <TabsTrigger value="blacklist">Blacklisted Leagues</TabsTrigger>
          <TabsTrigger value="system">System Config</TabsTrigger>
        </TabsList>

        {/* Jobs Management Tab */}
        <TabsContent value="jobs" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Background Job Manager
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="gap-2"
                    onClick={() => controlJobs("start")}
                  >
                    <Play className="w-4 h-4" />
                    Start All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => controlJobs("stop")}
                  >
                    <Pause className="w-4 h-4" />
                    Stop All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Registered Jobs */}
              {jobData?.data?.registeredJobs && (
                <div>
                  <h3 className="font-semibold text-sm mb-3">Registered Jobs ({jobData.data.jobCount})</h3>
                  <div className="space-y-2">
                    {jobData.data.registeredJobs.map((job: string) => (
                      <div key={job} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <span className="font-mono text-sm">{job}</span>
                        <Badge variant="default">Running</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Schedules */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Job Schedules</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-secondary/30 rounded">
                    <span>Sync Match Results</span>
                    <Badge variant="outline">Every 30 minutes</Badge>
                  </div>
                  <div className="flex justify-between p-2 bg-secondary/30 rounded">
                    <span>Update League Reliability</span>
                    <Badge variant="outline">Daily at 02:00 AM</Badge>
                  </div>
                  <div className="flex justify-between p-2 bg-secondary/30 rounded">
                    <span>Calibrate Confidence Scores</span>
                    <Badge variant="outline">Weekly on Monday 03:00 AM</Badge>
                  </div>
                  <div className="flex justify-between p-2 bg-secondary/30 rounded">
                    <span>Cleanup Cache</span>
                    <Badge variant="outline">Hourly</Badge>
                  </div>
                </div>
              </div>

              {/* Recent Job Executions */}
              {jobData?.data?.recentHistory && jobData.data.recentHistory.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-3">Recent Executions</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobData.data.recentHistory.slice(0, 5).map((execution: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">{execution.jobName}</TableCell>
                          <TableCell>
                            <Badge variant={execution.status === "success" ? "default" : "destructive"}>
                              {execution.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{execution.message}</TableCell>
                          <TableCell className="text-xs">{execution.duration}ms</TableCell>
                          <TableCell className="text-xs">
                            {new Date(execution.executedAt).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4 space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={period === "7d" ? "default" : "outline"}
              onClick={() => setPeriod("7d")}
              size="sm"
            >
              7 Days
            </Button>
            <Button
              variant={period === "30d" ? "default" : "outline"}
              onClick={() => setPeriod("30d")}
              size="sm"
            >
              30 Days
            </Button>
            <Button
              variant={period === "90d" ? "default" : "outline"}
              onClick={() => setPeriod("90d")}
              size="sm"
            >
              90 Days
            </Button>
          </div>

          {analytics && (
            <>
              {/* Overall Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Total Predictions</p>
                      <p className="text-2xl font-bold">{analytics.overall.totalPredictions}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                      <p className="text-2xl font-bold text-green-500">{analytics.overall.winRate}%</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Avg Confidence</p>
                      <p className="text-2xl font-bold">{analytics.overall.avgConfidence}%</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Estimated ROI</p>
                      <p className="text-2xl font-bold text-blue-500">{analytics.overall.estimatedROI}%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Market Accuracy */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Market Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Market</TableHead>
                        <TableHead>Accuracy</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead>ROI</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.marketAccuracy.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{m.market}</TableCell>
                          <TableCell>
                            <Badge variant={parseFloat(m.accuracy) > 55 ? "default" : "secondary"}>
                              {m.accuracy}%
                            </Badge>
                          </TableCell>
                          <TableCell>{m.volume}</TableCell>
                          <TableCell className={parseFloat(m.roi) > 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                            {m.roi}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Confidence Distribution */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Confidence Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Very High (80+%)", data: analytics.confidenceDistribution.veryHigh, color: "bg-green-500" },
                    { label: "High (70-79%)", data: analytics.confidenceDistribution.high, color: "bg-blue-500" },
                    { label: "Medium (60-69%)", data: analytics.confidenceDistribution.medium, color: "bg-yellow-500" },
                    { label: "Low (<60%)", data: analytics.confidenceDistribution.low, color: "bg-orange-500" },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm text-muted-foreground">{item.data.count} ({item.data.percentage}%)</span>
                      </div>
                      <Progress value={parseFloat(item.data.percentage)} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Weights Tab */}
        <TabsContent value="weights" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Confidence Weight Configuration
                </span>
                <Badge variant={totalWeight === 100 ? "default" : "destructive"}>
                  Total: {totalWeight}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(weights).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</Label>
                    <span className="font-mono font-bold">{value}%</span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={([v]) => updateWeight(key, v)}
                    min={0}
                    max={50}
                    step={1}
                  />
                </div>
              ))}

              <div className="flex gap-2 pt-4">
                <Button className="flex-1 gap-2" onClick={handleSaveWeights} disabled={totalWeight !== 100}>
                  {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? "Saved!" : "Save Weights"}
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>

              {totalWeight !== 100 && (
                <div className="flex items-center gap-2 text-sm text-sport-red">
                  <AlertTriangle className="w-4 h-4" />
                  Weights must total exactly 100%
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Usage Tab */}
        <TabsContent value="api" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Usage Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiUsageData.map((row, i) => {
                    const pct = (row.used / row.limit) * 100;
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{row.provider}</TableCell>
                        <TableCell>{row.endpoint}</TableCell>
                        <TableCell>{row.used}</TableCell>
                        <TableCell>{row.limit}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="w-20 h-2" />
                            <span className="text-xs">{pct.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>${row.cost.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blacklist Tab */}
        <TabsContent value="blacklist" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Blacklisted Leagues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input placeholder="League ID or Name" className="max-w-xs" />
                <Button variant="outline">Add to Blacklist</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>League</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blacklistedLeagues.map((league) => (
                    <TableRow key={league.id}>
                      <TableCell className="font-medium">{league.name}</TableCell>
                      <TableCell>{league.reason}</TableCell>
                      <TableCell>{league.date}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-sport-red">
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Config Tab */}
        <TabsContent value="system" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cache TTL (seconds)</Label>
                  <Input type="number" defaultValue={300} />
                </div>
                <div className="space-y-2">
                  <Label>Rate Limit (req/min)</Label>
                  <Input type="number" defaultValue={60} />
                </div>
                <div className="space-y-2">
                  <Label>Prediction Refresh (hours)</Label>
                  <Input type="number" defaultValue={6} />
                </div>
                <div className="space-y-2">
                  <Label>Min Confidence Threshold</Label>
                  <Input type="number" defaultValue={50} />
                </div>
              </div>
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
