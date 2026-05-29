import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 75) return "text-sport-green";
  if (confidence >= 55) return "text-sport-yellow";
  return "text-sport-red";
}

export function getConfidenceBg(confidence: number): string {
  if (confidence >= 75) return "bg-sport-green/10 border-sport-green/30";
  if (confidence >= 55) return "bg-sport-yellow/10 border-sport-yellow/30";
  return "bg-sport-red/10 border-sport-red/30";
}

export function calculateImpliedProbability(odds: number): number {
  return 1 / odds;
}

export function calculateValueBet(modelProb: number, bookmakerOdds: number): number {
  const impliedProb = calculateImpliedProbability(bookmakerOdds);
  return (modelProb - impliedProb) / impliedProb;
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
