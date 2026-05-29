"use server";

import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379/0");

const DEFAULT_TTL = parseInt(process.env.CACHE_TTL_SECONDS || "300");
const PREDICTION_TTL = parseInt(process.env.CACHE_PREDICTION_TTL || "1800");

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Cache delete error:", error);
  }
}

export async function getPredictionCache<T>(fixtureId: number): Promise<T | null> {
  return getCache<T>(`prediction:${fixtureId}`);
}

export async function setPredictionCache<T>(fixtureId: number, value: T): Promise<void> {
  return setCache(`prediction:${fixtureId}`, value, PREDICTION_TTL);
}

export async function getFixtureCache<T>(date: string): Promise<T | null> {
  return getCache<T>(`fixtures:${date}`);
}

export async function setFixtureCache<T>(date: string, value: T): Promise<void> {
  return setCache(`fixtures:${date}`, value, DEFAULT_TTL);
}

export async function getOddsCache<T>(fixtureId: number): Promise<T | null> {
  return getCache<T>(`odds:${fixtureId}`);
}

export async function setOddsCache<T>(fixtureId: number, value: T): Promise<void> {
  return setCache(`odds:${fixtureId}`, value, DEFAULT_TTL);
}

export async function flushCache(): Promise<void> {
  try {
    await redis.flushdb();
  } catch (error) {
    console.error("Cache flush error:", error);
  }
}

export { redis };
