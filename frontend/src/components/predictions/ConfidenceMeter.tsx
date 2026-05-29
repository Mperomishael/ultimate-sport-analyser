"use client";

import { motion } from "framer-motion";

interface ConfidenceMeterProps {
  value: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ConfidenceMeter({ value, size = "md", showLabel = false }: ConfidenceMeterProps) {
  const getColor = (v: number) => {
    if (v >= 75) return "#10B981";
    if (v >= 55) return "#F59E0B";
    return "#EF4444";
  };

  const getSize = () => {
    switch (size) {
      case "sm": return { width: 48, height: 48, strokeWidth: 4, fontSize: 10 };
      case "lg": return { width: 120, height: 120, strokeWidth: 8, fontSize: 24 };
      default: return { width: 80, height: 80, strokeWidth: 6, fontSize: 16 };
    }
  };

  const { width, height, strokeWidth, fontSize } = getSize();
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={width} height={height} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          fill="none"
          stroke={getColor(value)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-bold"
            style={{ fontSize, color: getColor(value) }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {value}%
          </motion.span>
        </div>
      )}
    </div>
  );
}
