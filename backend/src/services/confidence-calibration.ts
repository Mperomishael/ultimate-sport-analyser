/**
 * Confidence Calibration System
 * Tracks and recalibrates confidence scores based on historical accuracy
 */

export interface ConfidenceBracket {
  range: string; // "70-75", "75-80", etc
  minConfidence: number;
  maxConfidence: number;
  totalPredictions: number;
  actualWinRate: number;
  expectedWinRate: number;
  calibrationError: number;
  isWellCalibrated: boolean;
}

export interface CalibrationAnalysis {
  brackets: ConfidenceBracket[];
  overallCalibrationError: number;
  needsRecalibration: boolean;
  recommendations: string[];
}

export class ConfidenceCalibrationEngine {
  private static readonly BRACKET_SIZE = 5; // 5% brackets

  /**
   * Analyze confidence calibration from historical data
   */
  static analyzeCalibration(
    predictions: any[]
  ): CalibrationAnalysis {
    const brackets = this.generateBrackets();

    // Populate brackets with data
    predictions.forEach((pred) => {
      const bracket = brackets.find(
        (b) =>
          pred.confidence >= b.minConfidence &&
          pred.confidence < b.maxConfidence
      );

      if (bracket) {
        bracket.totalPredictions++;
        if (pred.resultStatus === "WON") {
          bracket.actualWinRate =
            (bracket.actualWinRate * (bracket.totalPredictions - 1) + 1) /
            bracket.totalPredictions;
        } else if (
          pred.resultStatus === "LOST" ||
          pred.resultStatus === "PUSH"
        ) {
          bracket.actualWinRate =
            (bracket.actualWinRate * (bracket.totalPredictions - 1)) /
            bracket.totalPredictions;
        }
      }
    });

    // Calculate expected vs actual
    brackets.forEach((bracket) => {
      bracket.expectedWinRate = bracket.minConfidence / 100;
      bracket.calibrationError = Math.abs(
        bracket.actualWinRate - bracket.expectedWinRate
      );
      bracket.isWellCalibrated = bracket.calibrationError < 0.1; // Within 10%
    });

    // Overall calibration
    const totalError = brackets.reduce(
      (sum, b) => sum + b.calibrationError * b.totalPredictions,
      0
    );
    const totalPredictions = brackets.reduce(
      (sum, b) => sum + b.totalPredictions,
      0
    );
    const overallCalibrationError =
      totalPredictions > 0 ? totalError / totalPredictions : 0;

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      brackets,
      overallCalibrationError
    );

    return {
      brackets,
      overallCalibrationError,
      needsRecalibration: overallCalibrationError > 0.15,
      recommendations,
    };
  }

  /**
   * Generate confidence brackets
   */
  private static generateBrackets(): ConfidenceBracket[] {
    const brackets: ConfidenceBracket[] = [];

    for (let min = 60; min < 100; min += this.BRACKET_SIZE) {
      const max = Math.min(min + this.BRACKET_SIZE, 100);
      brackets.push({
        range: `${min}-${max}`,
        minConfidence: min,
        maxConfidence: max,
        totalPredictions: 0,
        actualWinRate: 0,
        expectedWinRate: (min + max) / 2 / 100,
        calibrationError: 0,
        isWellCalibrated: true,
      });
    }

    return brackets;
  }

  /**
   * Generate recommendations based on calibration
   */
  private static generateRecommendations(
    brackets: ConfidenceBracket[],
    overallError: number
  ): string[] {
    const recommendations: string[] = [];

    // Check for overconfidence
    const overconfidentBrackets = brackets.filter(
      (b) =>
        b.totalPredictions > 10 &&
        b.actualWinRate < b.expectedWinRate - 0.1
    );

    if (overconfidentBrackets.length > 0) {
      const ranges = overconfidentBrackets.map((b) => b.range).join(", ");
      recommendations.push(
        `⚠️ OVERCONFIDENCE in ${ranges} ranges - actual wins are ${((overconfidentBrackets[0].actualWinRate - overconfidentBrackets[0].expectedWinRate) * 100).toFixed(1)}% lower than expected`
      );
    }

    // Check for underconfidence
    const underconfidentBrackets = brackets.filter(
      (b) =>
        b.totalPredictions > 10 &&
        b.actualWinRate > b.expectedWinRate + 0.1
    );

    if (underconfidentBrackets.length > 0) {
      const ranges = underconfidentBrackets.map((b) => b.range).join(", ");
      recommendations.push(
        `✓ Conservative predictions in ${ranges} - performing better than expected`
      );
    }

    // Overall calibration
    if (overallError > 0.2) {
      recommendations.push(
        `Overall calibration error is ${(overallError * 100).toFixed(1)}% - consider recalibrating confidence weights`
      );
    } else if (overallError < 0.08) {
      recommendations.push(
        `✓ Confidence scores are well-calibrated - maintain current weighting system`
      );
    }

    // Actionable recalibration
    if (overconfidentBrackets.length > 0) {
      recommendations.push(
        `Suggested action: Reduce confidence scores by ${((overconfidentBrackets[0].expectedWinRate - overconfidentBrackets[0].actualWinRate) * 100).toFixed(1)}% in high-confidence range`
      );
    }

    return recommendations;
  }

  /**
   * Apply calibration correction to raw confidence
   */
  static applyCorrectionFactor(
    rawConfidence: number,
    calibrationAnalysis: CalibrationAnalysis
  ): number {
    const bracket = calibrationAnalysis.brackets.find(
      (b) =>
        rawConfidence >= b.minConfidence &&
        rawConfidence < b.maxConfidence
    );

    if (!bracket || bracket.totalPredictions === 0) {
      return rawConfidence; // No data, return as-is
    }

    // Apply correction
    const correction =
      bracket.actualWinRate - (bracket.minConfidence / 100);
    return Math.max(60, Math.min(99, rawConfidence + correction * 10)); // Apply with damping
  }

  /**
   * Get confidence confidence interval
   */
  static getConfidenceInterval(
    predictedConfidence: number,
    sampleSize: number
  ): { lower: number; upper: number } {
    // Using Wilson score interval for confidence bounds
    const z = 1.96; // 95% confidence interval
    const p = predictedConfidence / 100;

    if (sampleSize === 0) {
      return { lower: 0, upper: 100 };
    }

    const center =
      (p + (z * z) / (2 * sampleSize)) / (1 + (z * z) / sampleSize);
    const margin =
      (z * Math.sqrt(p * (1 - p) / sampleSize + (z * z) / (4 * sampleSize * sampleSize))) /
      (1 + (z * z) / sampleSize);

    const lower = Math.max(
      0,
      (center - margin) * 100
    );
    const upper = Math.min(100, (center + margin) * 100);

    return { lower, upper };
  }

  /**
   * Trend analysis - is calibration improving over time?
   */
  static analyzeTrend(
    predictionBatches: any[][]
  ): {
    trend: "improving" | "degrading" | "stable";
    calibrationHistory: number[];
  } {
    const calibrationHistory: number[] = [];

    predictionBatches.forEach((batch) => {
      const analysis = this.analyzeCalibration(batch);
      calibrationHistory.push(analysis.overallCalibrationError);
    });

    if (calibrationHistory.length < 2) {
      return { trend: "stable", calibrationHistory };
    }

    const recent = calibrationHistory.slice(-3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const previous = calibrationHistory.slice(-6, -3);
    const previousAvg = previous.length > 0 ? previous.reduce((a, b) => a + b, 0) / previous.length : recentAvg;

    let trend: "improving" | "degrading" | "stable" = "stable";
    if (recentAvg < previousAvg - 0.05) {
      trend = "improving";
    } else if (recentAvg > previousAvg + 0.05) {
      trend = "degrading";
    }

    return { trend, calibrationHistory };
  }
}
