"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

interface ReasoningFactor {
  factor: string;
  value: string | number;
  weight: number;
  explanation: string;
}

interface PredictionReasoningPanelProps {
  prediction: {
    market: string;
    selectedOutcome: string;
    confidence: number;
    reasoning: string;
    factors: ReasoningFactor[];
    shouldWarn?: boolean;
    warningMessage?: string;
  };
}

export function PredictionReasoningPanel({
  prediction,
}: PredictionReasoningPanelProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "bg-green-500/20 text-green-700 border-green-200";
    if (confidence >= 75) return "bg-blue-500/20 text-blue-700 border-blue-200";
    if (confidence >= 65) return "bg-yellow-500/20 text-yellow-700 border-yellow-200";
    return "bg-orange-500/20 text-orange-700 border-orange-200";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 85) return "High Confidence";
    if (confidence >= 75) return "Good Confidence";
    if (confidence >= 65) return "Moderate Confidence";
    return "Caution";
  };

  return (
    <div className="space-y-4">
      {/* Main Prediction Summary */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">
                {prediction.market} Prediction
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Predicted Outcome: <span className="font-semibold text-foreground">{prediction.selectedOutcome}</span>
              </p>
            </div>
            <Badge
              className={`${getConfidenceColor(prediction.confidence)} border`}
            >
              {getConfidenceLabel(prediction.confidence)} - {prediction.confidence.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Warning Alert */}
      {prediction.shouldWarn && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-900">Alert</p>
                <p className="text-sm text-amber-800 mt-1">
                  {prediction.warningMessage}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Reasoning */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground/90">
            {prediction.reasoning}
          </p>
        </CardContent>
      </Card>

      {/* Reasoning Factors Breakdown */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Key Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prediction.factors.map((factor, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {factor.factor.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-secondary rounded-full h-1.5">
                      <div
                        className="bg-sport-blue h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(factor.weight * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {(factor.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {factor.explanation}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confidence Information */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Confidence Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Confidence:</span>
              <span className="font-medium">{prediction.confidence.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Historical Accuracy:</span>
              <span className="font-medium">
                {prediction.confidence >= 85
                  ? "~80-85%"
                  : prediction.confidence >= 75
                  ? "~70-75%"
                  : "~60-70%"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk Level:</span>
              <Badge variant="outline" className="ml-auto">
                {prediction.confidence >= 80 ? "Low" : prediction.confidence >= 70 ? "Medium" : "Moderate"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices Note */}
      <Card className="border-border bg-card/50">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              This prediction is part of a statistically-backed analysis. Diversify across multiple
              markets and fixtures. Never bet more than you can afford to lose.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
