# Analyzer Prototype - Quick Start Guide

## What Was Implemented

Four complete features have been added to make the analyzer-prototype production-ready:

### 1. Enhanced Prediction Service ✓
**Backend reasoning & caching for all predictions**

File: `backend/src/app/api/predictions/route.ts`

Key endpoint:
```bash
GET /api/predictions?includeReasoning=true
```

Returns predictions with detailed reasoning factors and explanations.

---

### 2. Reasoning Panel UI ✓
**Frontend component displaying prediction reasoning**

File: `frontend/src/components/predictions/PredictionReasoningPanel.tsx`

Usage:
```typescript
import { usePredictionsWithReasoning } from '@/hooks/use-predictions';

const { data } = usePredictionsWithReasoning('2026-05-29');
// Use in PredictionReasoningPanel component
```

Features:
- Color-coded confidence badges
- Factor breakdown with weights
- Risk assessment
- Natural language explanations

---

### 3. Admin Analytics Dashboard ✓
**Real-time analytics & performance metrics**

File: `frontend/src/app/(dashboard)/admin/page.tsx`

Access: Admin Panel → "Analytics" tab

Displays:
- Overall win rate, ROI, confidence
- Market-by-market accuracy
- Confidence distribution charts
- Period selection (7d, 30d, 90d)

---

### 4. Background Job System ✓
**Automated tasks running on schedule**

Files:
- `backend/src/services/job-scheduler.ts` - Scheduler service
- `backend/src/app/api/jobs/route.ts` - Job monitoring API
- `backend/src/lib/scheduler.ts` - Initialization

Jobs running:
- **Every 30 min**: Sync match results
- **Daily 2 AM**: Update league reliability
- **Weekly Mon 3 AM**: Calibrate confidence
- **Every hour**: Cleanup cache

Admin Panel → "Background Jobs" tab to:
- Start/Stop all jobs
- View job schedules
- Monitor recent executions

---

## Quick Integration Steps

### 1. Initialize Scheduler on Server Startup

In your main server file (e.g., `backend/src/app.ts` or similar):

```typescript
import { initializeScheduler } from '@/lib/scheduler';

// During application initialization
if (process.env.NODE_ENV === 'production') {
  initializeScheduler();
}
```

### 2. Add Job Monitoring Hook (Already Done)

Hook already added to `frontend/src/hooks/use-predictions.ts`:
```typescript
useJobStatus()      // Fetch job status
useControlJobs()    // Start/Stop jobs
```

### 3. Fetch Predictions with Reasoning

```typescript
const response = await fetch(
  '/api/predictions?includeReasoning=true&minConfidence=70'
);
const predictions = await response.json();
```

### 4. Access Admin Dashboard

Navigate to Admin Panel → Select new tabs:
- Analytics
- Background Jobs

---

## API Endpoints Reference

### Predictions with Reasoning
```
GET /api/predictions?includeReasoning=true
```

### Analytics Data
```
GET /api/analytics?period=30d
```
Periods: `7d`, `30d`, `90d`, `all`

### Job Management
```
GET /api/jobs                  // Get job status
POST /api/jobs                 // Control jobs
  body: { action: "start" | "stop" }
```

---

## Database Models Used

- **Prediction** - Stores prediction data with confidence scores
- **Fixture** - Stores match details and results
- **League** - League information
- **LeagueReliability** - Calculated accuracy per league (new)

---

## Key Files Modified

| File | Changes |
|------|---------|
| `backend/src/app/api/predictions/route.ts` | Added reasoning enrichment |
| `backend/src/app/api/analytics/route.ts` | Added market accuracy & confidence distribution |
| `frontend/src/app/(dashboard)/admin/page.tsx` | Added Analytics & Jobs tabs |
| `frontend/src/hooks/use-predictions.ts` | Added reasoning hook & job hooks |

## Key Files Added

| File | Purpose |
|------|---------|
| `backend/src/services/job-scheduler.ts` | Background job scheduler (432 lines) |
| `backend/src/app/api/jobs/route.ts` | Job monitoring API endpoint |
| `backend/src/lib/scheduler.ts` | Scheduler initialization |

---

## Environment Variables Needed

```env
# Redis
REDIS_URL=redis://localhost:6379/0

# Database
DATABASE_URL=postgresql://...

# Prediction Service
PREDICTION_SERVICE_URL=http://localhost:8000
PREDICTION_SERVICE_API_KEY=your-key
```

---

## Testing the Implementation

### Test 1: Fetch Predictions with Reasoning
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/predictions?includeReasoning=true"
```

Response should include:
- `reasoning` (string with explanation)
- `reasoningFactors` (array of factors with weights)

### Test 2: Check Analytics
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/analytics?period=30d"
```

Response should include:
- Overall statistics
- Market accuracy data
- Confidence distribution

### Test 3: Monitor Jobs
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/jobs"
```

Response should show:
- Registered jobs (4 jobs)
- Recent execution history
- Last run timestamp

---

## Common Issues & Solutions

### Jobs Not Running?
1. Check `REDIS_URL` is set correctly
2. Verify scheduler is initialized on startup
3. Check server logs for scheduler errors

### No Reasoning in Predictions?
1. Add `includeReasoning=true` to query param
2. Verify `PredictionReasoningEngine` is imported
3. Check if predictions have required score fields

### Analytics Data Empty?
1. Ensure predictions have `status: "CONFIRMED"`
2. Check date range in period selection
3. Verify database has prediction history

---

## Next Steps

1. **Deploy to Production**
   - Initialize scheduler in production
   - Set all environment variables
   - Run database migrations if needed

2. **Monitor Performance**
   - Use Admin → Background Jobs tab
   - Check job execution logs
   - Monitor cache hit rates

3. **Fine-tune**
   - Adjust job schedules if needed
   - Customize confidence thresholds
   - Add more analytics if desired

4. **Extend Features**
   - Add email alerts
   - Create prediction exports
   - Build team form visualizations
   - Add historical charts

---

## Documentation

- **Full Implementation Guide**: `/IMPLEMENTATION_GUIDE.md`
- **Original Plan**: `/v0_plans/bold-map.md`

All code is well-commented and follows TypeScript/Next.js best practices. Happy predicting! 🎯
