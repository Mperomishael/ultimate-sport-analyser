/**
 * Scheduler initialization module
 * Ensures background jobs start when the server starts
 */

import { getJobScheduler } from "@/services/job-scheduler";

let schedulerInitialized = false;

export function initializeScheduler() {
  if (schedulerInitialized) {
    console.log("[v0] Scheduler already initialized");
    return;
  }

  try {
    const scheduler = getJobScheduler();
    scheduler.startAll();
    schedulerInitialized = true;
    console.log("[v0] Background job scheduler initialized successfully");
  } catch (error) {
    console.error("[v0] Failed to initialize scheduler:", error);
  }
}

export function isSchedulerInitialized() {
  return schedulerInitialized;
}
