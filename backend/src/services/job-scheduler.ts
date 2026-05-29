/**
 * Background Job Scheduler Service
 * Manages automated tasks using node-cron
 */

import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { redis } from "@/services/cache";
import { ApiFootballService } from "@/services/api-football";

export interface JobResult {
  jobName: string;
  status: "success" | "failure";
  message: string;
  executedAt: Date;
  duration: number; // ms
}

class JobScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private jobHistory: JobResult[] = [];
  private readonly MAX_HISTORY = 100;

  /**
   * Sync match results from API-Football
   * Runs every 30 minutes
   */
  registerSyncMatchResults() {
    const task = cron.schedule("*/30 * * * *", async () => {
      const startTime = Date.now();
      try {
        console.log("[v0] Syncing match results...");

        const apiFootball = new ApiFootballService();

        // Get all completed fixtures from past 24 hours
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const fixtures = await prisma.fixture.findMany({
          where: {
            date: { gte: yesterday },
            status: {
              in: ["FT", "AET", "PEN", "ABD", "CANC", "SUSP"],
            },
          },
          include: {
            predictions: true,
          },
        });

        let updatedCount = 0;

        for (const fixture of fixtures) {
          try {
            const fixtureData = await apiFootball.getFixture(fixture.id);
            if (!fixtureData) continue;

            const homeGoals = fixtureData.goals?.home || 0;
            const awayGoals = fixtureData.goals?.away || 0;
            const totalGoals = homeGoals + awayGoals;

            // Update fixture with latest info
            await prisma.fixture.update({
              where: { id: fixture.id },
              data: {
                status: fixtureData.fixture.status.short,
                homeGoals,
                awayGoals,
                updatedAt: new Date(),
              },
            });

            // Update prediction results
            for (const prediction of fixture.predictions) {
              let result = "P"; // Push by default

              if (homeGoals > awayGoals && prediction.homeWin > prediction.awayWin) {
                result = "W";
              } else if (awayGoals > homeGoals && prediction.awayWin > prediction.homeWin) {
                result = "W";
              } else if (homeGoals === awayGoals && prediction.draw > 50) {
                result = "W";
              } else {
                result = "L";
              }

              // Update goal-based predictions
              if (totalGoals >= 2.5 && prediction.over25 > 50) {
                result = "W";
              } else if (totalGoals < 2.5 && prediction.over25 <= 50) {
                result = "W";
              }

              if (homeGoals > 0 && awayGoals > 0 && prediction.btts > 50) {
                result = "W";
              }

              await prisma.prediction.update({
                where: { id: prediction.id },
                data: {
                  result,
                  status: "CONFIRMED",
                  updatedAt: new Date(),
                },
              });

              updatedCount++;
            }
          } catch (error) {
            console.error(`[v0] Error syncing fixture ${fixture.id}:`, error);
          }
        }

        const duration = Date.now() - startTime;
        const jobResult: JobResult = {
          jobName: "SyncMatchResults",
          status: "success",
          message: `Synced ${updatedCount} prediction results`,
          executedAt: new Date(),
          duration,
        };

        this.recordJobResult(jobResult);
        console.log(`[v0] Match sync completed in ${duration}ms: ${updatedCount} results updated`);
      } catch (error) {
        const duration = Date.now() - startTime;
        const jobResult: JobResult = {
          jobName: "SyncMatchResults",
          status: "failure",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          executedAt: new Date(),
          duration,
        };

        this.recordJobResult(jobResult);
        console.error("[v0] Match sync failed:", error);
      }
    });

    this.jobs.set("sync-match-results", task);
  }

  /**
   * Update league reliability scores
   * Runs daily at 02:00 AM
   */
  registerUpdateLeagueReliability() {
    const task = cron.schedule("0 2 * * *", async () => {
      const startTime = Date.now();
      try {
        console.log("[v0] Updating league reliability...");

        const leagues = await prisma.league.findMany({
          where: { isActive: true },
          include: {
            fixtures: {
              include: {
                predictions: true,
              },
              where: {
                date: {
                  gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
        });

        let updatedCount = 0;

        for (const league of leagues) {
          // Calculate reliability based on prediction accuracy
          const allPredictions = league.fixtures.flatMap((f) => f.predictions);
          if (allPredictions.length === 0) continue;

          const correctPredictions = allPredictions.filter((p) => p.result === "W").length;
          const reliability = (correctPredictions / allPredictions.length) * 100;

          await prisma.leagueReliability.upsert({
            where: { leagueId: league.id },
            update: {
              reliabilityScore: reliability,
              totalPredictions: allPredictions.length,
              correctPredictions,
              updatedAt: new Date(),
            },
            create: {
              leagueId: league.id,
              reliabilityScore: reliability,
              totalPredictions: allPredictions.length,
              correctPredictions,
            },
          });

          updatedCount++;
        }

        const duration = Date.now() - startTime;
        const jobResult: JobResult = {
          jobName: "UpdateLeagueReliability",
          status: "success",
          message: `Updated reliability for ${updatedCount} leagues`,
          executedAt: new Date(),
          duration,
        };

        this.recordJobResult(jobResult);
        console.log(`[v0] League reliability update completed in ${duration}ms`);
      } catch (error) {
        const duration = Date.now() - startTime;
        const jobResult: JobResult = {
          jobName: "UpdateLeagueReliability",
          status: "failure",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          executedAt: new Date(),
          duration,
        };

        this.recordJobResult(jobResult);
        console.error("[v0] League reliability update failed:", error);
      }
    });

    this.jobs.set("update-league-reliability", task);
  }

  /**
   * Calibrate confidence scores
   * Runs weekly on Monday at 03:00 AM
   */
  registerCalibrateConfidence() {
    const task = cron.schedule("0 3 * * 1", async () => {
      const startTime = Date.now();
      try {
        console.log("[v0] Calibrating confidence scores...");

        const predictions = await prisma.prediction.findMany({
          where: {
            status: "CONFIRMED",
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        });

        // Group by confidence buckets
        const buckets = {
          "80-100": predictions.filter((p) => p.overallConfidence >= 80 && p.overallConfidence <= 100),
          "70-79": predictions.filter((p) => p.overallConfidence >= 70 && p.overallConfidence < 80),
          "60-69": predictions.filter((p) => p.overallConfidence >= 60 && p.overallConfidence < 70),
          "<60": predictions.filter((p) => p.overallConfidence < 60),
        };

        // Calculate calibration metrics
        const calibrationData = {
          "80-100": {
            total: buckets["80-100"].length,
            correct: buckets["80-100"].filter((p) => p.result === "W").length,
          },
          "70-79": {
            total: buckets["70-79"].length,
            correct: buckets["70-79"].filter((p) => p.result === "W").length,
          },
          "60-69": {
            total: buckets["60-69"].length,
            correct: buckets["60-69"].filter((p) => p.result === "W").length,
          },
          "<60": {
            total: buckets["<60"].length,
            correct: buckets["<60"].filter((p) => p.result === "W").length,
          },
        };

        // Store calibration data in cache
        await redis.setex(
          "calibration-data",
          86400 * 7, // 7 days
          JSON.stringify(calibrationData)
        );

        const duration = Date.now() - startTime;
        const jobResult: JobResult = {
          jobName: "CalibrateConfidence",
          status: "success",
          message: `Calibrated confidence for ${predictions.length} predictions`,
          executedAt: new Date(),
          duration,
        };

        this.recordJobResult(jobResult);
        console.log(`[v0] Confidence calibration completed in ${duration}ms`);
      } catch (error) {
        const duration = Date.now() - startTime;
        const jobResult: JobResult = {
          jobName: "CalibrateConfidence",
          status: "failure",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          executedAt: new Date(),
          duration,
        };

        this.recordJobResult(jobResult);
        console.error("[v0] Confidence calibration failed:", error);
      }
    });

    this.jobs.set("calibrate-confidence", task);
  }

  /**
   * Clean up old cache entries
   * Runs hourly
   */
  registerCleanupCache() {
    const task = cron.schedule("0 * * * *", async () => {
      const startTime = Date.now();
      try {
        console.log("[v0] Cleaning up cache...");

        // Delete old prediction cache entries (older than 24 hours)
        const keys = await redis.keys("prediction:*");
        let deletedCount = 0;

        for (const key of keys) {
          const ttl = await redis.ttl(key);
          if (ttl === -1 || (ttl > 0 && ttl < 3600)) {
            await redis.del(key);
            deletedCount++;
          }
        }

        const duration = Date.now() - startTime;
        const jobResult: JobResult = {
          jobName: "CleanupCache",
          status: "success",
          message: `Cleaned ${deletedCount} cache entries`,
          executedAt: new Date(),
          duration,
        };

        this.recordJobResult(jobResult);
        console.log(`[v0] Cache cleanup completed in ${duration}ms: ${deletedCount} entries removed`);
      } catch (error) {
        const duration = Date.now() - startTime;
        const jobResult: JobResult = {
          jobName: "CleanupCache",
          status: "failure",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          executedAt: new Date(),
          duration,
        };

        this.recordJobResult(jobResult);
        console.error("[v0] Cache cleanup failed:", error);
      }
    });

    this.jobs.set("cleanup-cache", task);
  }

  /**
   * Record job execution result
   */
  private recordJobResult(result: JobResult) {
    this.jobHistory.unshift(result);
    if (this.jobHistory.length > this.MAX_HISTORY) {
      this.jobHistory.pop();
    }
  }

  /**
   * Get job history
   */
  getJobHistory(limit: number = 20): JobResult[] {
    return this.jobHistory.slice(0, limit);
  }

  /**
   * Get job status
   */
  getJobStatus(jobName: string) {
    const task = this.jobs.get(jobName);
    return {
      jobName,
      registered: !!task,
      running: task ? task.status !== "stopped" : false,
    };
  }

  /**
   * Start all registered jobs
   */
  startAll() {
    console.log("[v0] Starting all background jobs...");
    this.registerSyncMatchResults();
    this.registerUpdateLeagueReliability();
    this.registerCalibrateConfidence();
    this.registerCleanupCache();

    console.log(`[v0] ${this.jobs.size} background jobs registered and running`);
  }

  /**
   * Stop all jobs
   */
  stopAll() {
    console.log("[v0] Stopping all background jobs...");
    for (const [name, task] of this.jobs) {
      task.stop();
      console.log(`[v0] Stopped job: ${name}`);
    }
  }

  /**
   * Get all registered jobs
   */
  getRegisteredJobs() {
    return Array.from(this.jobs.keys());
  }
}

// Singleton instance
let schedulerInstance: JobScheduler | null = null;

export function getJobScheduler(): JobScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new JobScheduler();
  }
  return schedulerInstance;
}

export { JobScheduler };
