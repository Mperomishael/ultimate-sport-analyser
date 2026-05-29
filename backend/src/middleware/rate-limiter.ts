"use server";

import { RateLimiterRedis } from "rate-limiter-flexible";
import { redis } from "@/services/cache";

const RATE_LIMIT_REQUESTS = parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || "60");
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000");

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "middleware",
  points: RATE_LIMIT_REQUESTS,
  duration: RATE_LIMIT_WINDOW / 1000,
});

export async function checkRateLimit(
  identifier: string
): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
  try {
    const res = await rateLimiter.consume(identifier, 1);
    return {
      allowed: true,
      remaining: res.remainingPoints,
      resetTime: new Date(Date.now() + res.msBeforeNext),
    };
  } catch (rejRes: any) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: new Date(Date.now() + rejRes.msBeforeNext),
    };
  }
}

export async function checkAuthRateLimit(
  identifier: string
): Promise<{ allowed: boolean; remaining: number }> {
  const authLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: "auth",
    points: 5,
    duration: 300, // 5 minutes
  });

  try {
    const res = await authLimiter.consume(identifier, 1);
    return { allowed: true, remaining: res.remainingPoints };
  } catch (rejRes: any) {
    return { allowed: false, remaining: 0 };
  }
}
