import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middleware/api";
import { getJobScheduler } from "@/services/job-scheduler";

const scheduler = getJobScheduler();

export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request);
  if (authResult.status !== 200) return authResult;

  const { searchParams } = new URL(request.url);
  const historyLimit = parseInt(searchParams.get("historyLimit") || "20");

  try {
    const jobHistory = scheduler.getJobHistory(historyLimit);
    const registeredJobs = scheduler.getRegisteredJobs();

    return NextResponse.json({
      success: true,
      data: {
        registeredJobs,
        jobCount: registeredJobs.length,
        recentHistory: jobHistory,
        lastRun: jobHistory.length > 0 ? jobHistory[0].executedAt : null,
      },
    });
  } catch (error) {
    console.error("Jobs API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await authMiddleware(request);
  if (authResult.status !== 200) return authResult;

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "start") {
      scheduler.startAll();
      return NextResponse.json({
        success: true,
        message: "All jobs started",
      });
    } else if (action === "stop") {
      scheduler.stopAll();
      return NextResponse.json({
        success: true,
        message: "All jobs stopped",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Jobs API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
