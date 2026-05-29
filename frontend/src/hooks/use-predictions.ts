"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Prediction, AccumulatorConfig, BetSlip } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export function usePredictions(date?: string, minConfidence?: number, includeReasoning?: boolean) {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (minConfidence) params.append("minConfidence", minConfidence.toString());
  if (includeReasoning) params.append("includeReasoning", "true");

  return useQuery({
    queryKey: ["predictions", date, minConfidence, includeReasoning],
    queryFn: () =>
      fetchWithAuth(`${API_BASE}/api/predictions?${params.toString()}`),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePredictionsWithReasoning(date?: string, minConfidence?: number) {
  return usePredictions(date, minConfidence, true);
}

export function useGeneratePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fixtureId: number) =>
      fetchWithAuth(`${API_BASE}/api/predictions`, {
        method: "POST",
        body: JSON.stringify({ fixtureId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
  });
}

export function useFixtures(date?: string, league?: number) {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (league) params.append("league", league.toString());

  return useQuery({
    queryKey: ["fixtures", date, league],
    queryFn: () =>
      fetchWithAuth(`${API_BASE}/api/fixtures?${params.toString()}`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useLiveFixtures() {
  return useQuery({
    queryKey: ["fixtures", "live"],
    queryFn: () => fetchWithAuth(`${API_BASE}/api/fixtures?live=true`),
    refetchInterval: 30000,
    staleTime: 1000 * 30,
  });
}

export function useOdds(fixtureId?: number, leagueId?: number) {
  const params = new URLSearchParams();
  if (fixtureId) params.append("fixtureId", fixtureId.toString());
  if (leagueId) params.append("leagueId", leagueId.toString());

  return useQuery({
    queryKey: ["odds", fixtureId, leagueId],
    queryFn: () =>
      fetchWithAuth(`${API_BASE}/api/odds?${params.toString()}`),
    enabled: !!fixtureId || !!leagueId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAccumulator() {
  return useMutation({
    mutationFn: (config: AccumulatorConfig) =>
      fetchWithAuth(`${API_BASE}/api/accumulator`, {
        method: "POST",
        body: JSON.stringify(config),
      }),
  });
}

export function useJobStatus() {
  return useQuery({
    queryKey: ["jobs", "status"],
    queryFn: () =>
      fetchWithAuth(`${API_BASE}/api/jobs`),
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 1000,
  });
}

export function useControlJobs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: "start" | "stop") =>
      fetchWithAuth(`${API_BASE}/api/jobs`, {
        method: "POST",
        body: JSON.stringify({ action }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", "status"] });
    },
  });
}

export function useAuth() {
  const login = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      fetchWithAuth(`${API_BASE}/api/auth?action=login`, {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    },
  });

  const register = useMutation({
    mutationFn: (data: { email: string; password: string; name: string }) =>
      fetchWithAuth(`${API_BASE}/api/auth?action=register`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    },
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const getUser = () => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  };

  return { login, register, logout, getUser };
}
