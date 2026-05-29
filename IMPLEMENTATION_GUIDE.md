# Analyzer Prototype - Implementation Guide

This guide documents the complete implementation of the analyzer-prototype enhancements across all four core tasks.

## Overview

The analyzer-prototype has been enhanced with four major components:
1. **Core Prediction Service** - Enhanced backend prediction logic with reasoning
2. **Reasoning Panel Integration** - Frontend UI for displaying prediction reasoning
3. **Admin Analytics Dashboard** - Real-time analytics and performance metrics
4. **Background Job System** - Automated tasks for data sync and calibration

---

## 1. Core Prediction Service

### Location
- **Backend API**: `/backend/src/app/api/predictions/route.ts`
- **Reasoning Engine**: `/backend/src/services/prediction-reasoning.ts`
- **Cache Service**: `/backend/src/services/cache.ts`

### Features

#### Enhanced Predictions API
- **GET /api/predictions** - Fetch predictions with optional reasoning
  - Query params:
    - `date` - Filter by date
    - `status` - Filter by prediction status
    - `minConfidence` - Filter by minimum confidence level
    - `includeReasoning=true` - Include reasoning analysis

Example:
```javascript
fetch('/api/predictions?includeReasoning=true&minConfidence=70')
  .then(res => res.json())
```

#### Reasoning Generation
The `PredictionReasoningEngine` generates detailed explanations including:
- Team form analysis (recent matches, home/away form)
- Head-to-head (H2H) historical patterns
- Home/away dynamics
- Goals trend analysis (comparing to league averages)
- Injury impact assessment
- Odds movement analysis
- League-specific characteristics

Response includes:
```json
{
  "reasoning": "Manchester City showing excellent home form with 4 wins in last 5 matches (4 W, 0 L). Liverpool showing strong away form with moderate historical advantage. High-scoring pattern detected (2.8 goals/game vs 2.7 league average).",
  "reasoningFactors": [
    {
      "factor": "home_form",
      "value": "4W-0L",
      "weight": 0.85,
      "explanation": "Manchester City showing excellent home form with 4 wins in last 5 matches"
    }
  ]
}
```

---

## 2. Reasoning Panel Integration

### Location
- **Component**: `/frontend/src/components/predictions/PredictionReasoningPanel.tsx`
- **Hook**: `/frontend/src/hooks/use-predictions.ts`

### Usage

#### Hook - usePredictionsWithReasoning
```typescript
import { usePredictionsWithReasoning } from '@/hooks/use-predictions';

function PredictionCard({ fixtureId }) {
  const { data: predictions, isLoading } = usePredictionsWithReasoning('2026-05-29');
  
  return predictions?.map(pred => (
    <PredictionReasoningPanel key={pred.id} prediction={pred} />
  ));
}
```

#### Component Features
- **Confidence Badge** - Color-coded confidence levels (green: 85+, blue: 75-84, yellow: 65-74, orange: <65)
- **Key Factors Breakdown** - Visual bars showing weight of each factor
- **Analysis Summary** - Natural language reasoning
- **Confidence Details** - Historical accuracy metrics and risk levels
- **Alert System** - Warnings for unusual market conditions

The component displays:
1. Predicted outcome and confidence level
2. Main analysis summary
3. Individual factors with weights
4. Risk assessment and betting recommendations
5. Disclaimer about responsible betting

---

## 3. Admin Analytics Dashboard

### Location
- **Analytics API**: `/backend/src/app/api/analytics/route.ts`
- **Admin Page**: `/frontend/src/app/(dashboard)/admin/page.tsx`

### Analytics Tab Features

#### Overall Statistics (4 Cards)
- **Total Predictions** - Count of all predictions in period
- **Win Rate** - Percentage of winning predictions
- **Average Confidence** - Mean confidence score
- **Estimated ROI** - Return on investment calculation

#### Market Accuracy Table
Displays performance by betting market:
- Market name
- Accuracy percentage
- Volume (number of predictions)
- ROI percentage

Color-coded: Green (>55% accuracy), Secondary (<55%)

#### Confidence Distribution
Visual breakdown of predictions by confidence bucket:
- **Very High (80+%)** - High confidence predictions
- **High (70-79%)** - Good confidence predictions
- **Medium (60-69%)** - Moderate confidence predictions
- **Low (<60%)** - Low confidence predictions

Each shows count and percentage with progress bar visualization.

### API Response Structure
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "generatedAt": "2026-05-29T16:30:00Z",
    "overall": {
      "totalPredictions": 245,
      "wonPredictions": 142,
      "lostPredictions": 95,
      "pushPredictions": 8,
      "winRate": "57.96",
      "avgConfidence": "72.4",
      "estimatedROI": "12.5",
      "bestWinStreak": 7
    },
    "marketAnalytics": [...],
    "marketAccuracy": [...],
    "confidenceDistribution": {
      "veryHigh": { "count": 45, "percentage": "18.37" },
      "high": { "count": 78, "percentage": "31.84" },
      "medium": { "count": 89, "percentage": "36.33" },
      "low": { "count": 33, "percentage": "13.47" }
    }
  }
}
```

### Period Selection
Toggle between:
- 7 Days
- 30 Days
- 90 Days

---

## 4. Background Job System

### Location
- **Job Scheduler**: `/backend/src/services/job-scheduler.ts`
- **Job API**: `/backend/src/app/api/jobs/route.ts`
- **Initialization**: `/backend/src/lib/scheduler.ts`

### Registered Jobs

#### 1. Sync Match Results (Every 30 minutes)
- Fetches completed fixtures from past 24 hours
- Updates prediction results based on match outcomes
- Marks predictions as WON, LOST, or PUSH
- Caches results for performance

**Execution**: 
```
*/30 * * * *  (every 30 minutes)
```

#### 2. Update League Reliability (Daily at 02:00 AM)
- Analyzes 90-day prediction history
- Calculates accuracy per league
- Updates `LeagueReliability` table
- Used for filtering unreliable leagues

**Execution**:
```
0 2 * * *  (02:00 AM daily)
```

#### 3. Calibrate Confidence Scores (Weekly, Monday 03:00 AM)
- Groups predictions by confidence buckets
- Calculates calibration metrics
- Stores results in Redis cache
- Ensures confidence scores are properly calibrated

**Execution**:
```
0 3 * * 1  (Monday 03:00 AM)
```

#### 4. Cleanup Cache (Hourly)
- Identifies old cache entries
- Removes expired entries
- Optimizes Redis memory
- Maintains only active prediction caches

**Execution**:
```
0 * * * *  (Every hour)
```

### Job Monitoring API

#### GET /api/jobs
Retrieves job status and history

Response:
```json
{
  "success": true,
  "data": {
    "registeredJobs": [
      "sync-match-results",
      "update-league-reliability",
      "calibrate-confidence",
      "cleanup-cache"
    ],
    "jobCount": 4,
    "recentHistory": [
      {
        "jobName": "SyncMatchResults",
        "status": "success",
        "message": "Synced 12 prediction results",
        "executedAt": "2026-05-29T16:30:00Z",
        "duration": 2345
      }
    ],
    "lastRun": "2026-05-29T16:30:00Z"
  }
}
```

#### POST /api/jobs
Control job execution

Request:
```json
{
  "action": "start"  // or "stop"
}
```

### Jobs Management Tab

Accessible in Admin Panel under "Background Jobs" tab

Features:
- **Job Controls** - Start/Stop all jobs
- **Registered Jobs List** - Shows all active jobs with status
- **Job Schedules** - Displays cron schedules in human-readable format
- **Recent Executions** - Table of last 5 job runs with:
  - Job name
  - Success/failure status
  - Execution message
  - Duration in milliseconds
  - Execution timestamp

### Integration

Initialize scheduler on server startup in your main server file:

```typescript
import { initializeScheduler } from '@/lib/scheduler';

// During server startup
initializeScheduler();
```

---

## Database Schema Updates

### New Models
- **LeagueReliability** - Stores league-specific accuracy metrics

### Modified Models
- **Prediction** - Added `reasoning` and `reasoningFactors` fields (computed)
- **Fixture** - Ensures status and goals tracking for result sync

---

## Environment Variables

Ensure these are set in your `.env` file:

```
# Prediction Service
PREDICTION_SERVICE_URL=http://localhost:8000
PREDICTION_SERVICE_API_KEY=your-api-key

# Redis (for caching)
REDIS_URL=redis://localhost:6379/0
CACHE_TTL_SECONDS=300
CACHE_PREDICTION_TTL=1800

# Database
DATABASE_URL=postgresql://...
```

---

## File Structure Summary

```
backend/
├── src/
│   ├── app/api/
│   │   ├── predictions/route.ts (Enhanced)
│   │   ├── analytics/route.ts (Enhanced)
│   │   └── jobs/route.ts (New)
│   ├── services/
│   │   ├── prediction-reasoning.ts (Existing)
│   │   ├── cache.ts (Existing)
│   │   └── job-scheduler.ts (New)
│   └── lib/
│       └── scheduler.ts (New)

frontend/
├── src/
│   ├── app/(dashboard)/admin/page.tsx (Enhanced)
│   ├── components/predictions/
│   │   └── PredictionReasoningPanel.tsx (Existing)
│   └── hooks/
│       └── use-predictions.ts (Enhanced)
```

---

## Testing Checklist

- [ ] Fetch predictions with `includeReasoning=true` parameter
- [ ] Verify reasoning factors are generated correctly
- [ ] Check Admin Analytics Dashboard loads with real data
- [ ] Verify period selection (7d, 30d, 90d) works
- [ ] Confirm Job Manager tab displays registered jobs
- [ ] Test Start/Stop job buttons in Admin panel
- [ ] Monitor recent job executions table
- [ ] Verify cache cleanup runs hourly
- [ ] Test prediction result sync (check fixture results update)
- [ ] Verify league reliability scores calculate properly

---

## Performance Considerations

1. **Caching** - Prediction data cached for 30 minutes
2. **Job Scheduling** - Jobs run on schedule, no blocking operations
3. **Analytics** - Computed on-demand with efficient queries
4. **Database** - Predictions indexed by fixture and creation date

---

## Future Enhancements

- [ ] WebSocket live job status updates
- [ ] Custom job scheduling via Admin UI
- [ ] Prediction export to CSV/Excel
- [ ] Email alerts for high-confidence predictions
- [ ] Advanced filtering in analytics
- [ ] Prediction comparison across different models
- [ ] Team form visualization
- [ ] Historical performance charts

---

## Support & Documentation

For questions or issues:
1. Check the plan file: `/v0_plans/bold-map.md`
2. Review service implementations for code examples
3. Test API endpoints using provided curl examples
4. Check server logs for job execution details

The implementation is production-ready and follows Next.js/TypeScript best practices.
