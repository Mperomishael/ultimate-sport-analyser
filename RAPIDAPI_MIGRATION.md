# Migration from api-football.com to RapidAPI

## Overview

This document outlines the complete migration from direct API-Football integration to RapidAPI's API-Football service. RapidAPI provides the same API-Football service but with centralized key management and simplified authentication.

---

## Why RapidAPI?

- ✅ Centralized API management
- ✅ Single API key for multiple APIs
- ✅ Better rate limiting and monitoring
- ✅ Simpler authentication headers
- ✅ Integrated billing and analytics
- ✅ 99.9% uptime SLA
- ✅ No direct company dependency

---

## What Changed

### Environment Variables

**Before (api-football.com):**
```env
API_FOOTBALL_KEY=your_api_football_key
API_FOOTBALL_HOST=v3.football.api-sports.io
```

**After (RapidAPI):**
```env
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=api-football-v1.p.rapidapi.com
RAPIDAPI_FOOTBALL_ENDPOINT=https://api-football-v1.p.rapidapi.com
```

### Code Changes

**Backend (Node.js/TypeScript):**
```typescript
// Before
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_FOOTBALL_HOST = process.env.API_FOOTBALL_HOST || "v3.football.api-sports.io";

// After
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || "api-football-v1.p.rapidapi.com";
const RAPIDAPI_FOOTBALL_ENDPOINT = process.env.RAPIDAPI_FOOTBALL_ENDPOINT || "https://api-football-v1.p.rapidapi.com";
```

**Python Prediction Service:**
```python
# Before
self.headers = {
    "x-rapidapi-key": settings.API_FOOTBALL_KEY,
    "x-rapidapi-host": settings.API_FOOTBALL_HOST,
}

# After
self.headers = {
    "x-rapidapi-key": settings.RAPIDAPI_KEY,
    "x-rapidapi-host": settings.RAPIDAPI_HOST,
}
```

---

## Step-by-Step Migration

### Phase 1: Get RapidAPI Key (15 minutes)

#### Step 1.1: Sign Up for RapidAPI

1. Visit https://rapidapi.com
2. Click "Sign Up" (top right)
3. Create account with email/GitHub/Google
4. Verify email

#### Step 1.2: Subscribe to API-Football

1. Go to https://rapidapi.com/api-sports/api/api-football
2. Click "Subscribe to Test" (free tier)
3. Select Free Plan (includes 100 requests/day)
4. Click "Subscribe"

#### Step 1.3: Get Your API Key

1. Go to Dashboard → My Apps
2. Select your default app
3. Copy the "X-RapidAPI-Key" value
4. Save this as `RAPIDAPI_KEY` in your `.env`

**Your RapidAPI Key looks like:**
```
abc123def456ghi789jkl012mno345pqr
```

#### Step 1.4: Verify API Host

RapidAPI host for API-Football is always:
```
api-football-v1.p.rapidapi.com
```

Set `RAPIDAPI_HOST` to this value.

---

### Phase 2: Update Environment Variables

#### Step 2.1: Update .env file

```bash
# Remove old variables (if present)
# API_FOOTBALL_KEY=...
# API_FOOTBALL_HOST=...

# Add new RapidAPI variables
RAPIDAPI_KEY="your_key_from_step_1_3"
RAPIDAPI_HOST="api-football-v1.p.rapidapi.com"
RAPIDAPI_FOOTBALL_ENDPOINT="https://api-football-v1.p.rapidapi.com"
```

#### Step 2.2: Update Docker Environment

If using Docker, update `docker-compose.yml`:

```yaml
environment:
  RAPIDAPI_KEY: ${RAPIDAPI_KEY}
  RAPIDAPI_HOST: api-football-v1.p.rapidapi.com
  RAPIDAPI_FOOTBALL_ENDPOINT: https://api-football-v1.p.rapidapi.com
```

#### Step 2.3: Update Production Secrets

For production (AWS/Vercel):

1. Go to your deployment platform
2. Add environment variables:
   - `RAPIDAPI_KEY` = your RapidAPI key
   - `RAPIDAPI_HOST` = `api-football-v1.p.rapidapi.com`
   - `RAPIDAPI_FOOTBALL_ENDPOINT` = `https://api-football-v1.p.rapidapi.com`

---

### Phase 3: Code Updates (Already Done)

The following files have been updated:

**Backend:**
- ✅ `/backend/src/services/api-football.ts` - Updated headers and endpoint

**Prediction Service:**
- ✅ `/prediction-service/app/core/config.py` - Updated config
- ✅ `/prediction-service/app/services/api_football.py` - Updated headers

**Configuration:**
- ✅ `/.env.example` - Updated with RapidAPI variables

All changes use the same API endpoints and response formats, so no other code changes are needed.

---

### Phase 4: Testing the Migration

#### Test 1: Verify API Key Configuration

```bash
# Check environment variables are set
echo $RAPIDAPI_KEY
echo $RAPIDAPI_HOST

# Both should print values (not empty)
```

#### Test 2: Test Fixtures Endpoint

```bash
curl -X GET "https://api-football-v1.p.rapidapi.com/fixtures?date=2026-05-29" \
  -H "x-rapidapi-key: YOUR_RAPIDAPI_KEY" \
  -H "x-rapidapi-host: api-football-v1.p.rapidapi.com"

# Should return JSON with fixtures for that date
```

#### Test 3: Test Backend API

```bash
# Start backend server
cd backend && npm run dev

# In another terminal, test fixtures endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3001/api/fixtures?date=2026-05-29"

# Should return fixtures with enriched data
```

#### Test 4: Test Prediction Service

```bash
# Start prediction service
cd prediction-service
uvicorn app.main:app --reload --port 8000

# In another terminal, test health endpoint
curl http://localhost:8000/api/health

# Should return: {"status": "healthy"}
```

#### Test 5: Full Integration Test

```bash
# Login to application
curl -X POST http://localhost:3001/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"test@example.com","password":"pass"}'

# Get predictions with reasoning
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3001/api/predictions?includeReasoning=true&date=2026-05-29"

# Should return predictions with reasoning factors
```

---

## Troubleshooting

### Issue 1: "Invalid API Key" Error

**Symptom:** API returns 403 Forbidden

**Solution:**
1. Verify `RAPIDAPI_KEY` is correct
2. Check it's copied fully without spaces
3. Ensure it's the X-RapidAPI-Key, not X-RapidAPI-Secret
4. Check key hasn't expired (https://rapidapi.com/dashboard)

### Issue 2: "Host not allowed" Error

**Symptom:** API returns error about host

**Solution:**
1. Verify `RAPIDAPI_HOST` = `api-football-v1.p.rapidapi.com`
2. Check header name is `x-rapidapi-host` (lowercase)
3. Ensure no typos in hostname

### Issue 3: Rate Limit Exceeded

**Symptom:** API returns 429 Too Many Requests

**Solution:**
1. Check current usage: https://rapidapi.com/dashboard
2. Free tier = 100 requests/day
3. Upgrade plan if needed
4. Implement request caching (already done)

### Issue 4: Endpoint Not Found

**Symptom:** API returns 404 Not Found

**Solution:**
1. Verify endpoint is correct (e.g., `/fixtures`)
2. Check parameters are valid
3. Ensure using HTTPS not HTTP
4. Check request headers format

---

## RapidAPI API-Football Plan Comparison

| Feature | Free | Professional | Advanced |
|---------|------|--------------|----------|
| Requests/Day | 100 | 3,000 | Unlimited |
| Requests/Month | 3,000 | 90,000 | Unlimited |
| Response Format | JSON | JSON | JSON |
| Endpoints | All | All | All |
| Support | Community | Email | Priority |
| Cost | Free | $9.99/mo | Custom |

### Recommended Plans by Scale

- **Development/Testing**: Free plan (100 req/day)
- **Small Production**: Professional plan (3,000 req/day = ~100 per hour)
- **Large Production**: Advanced plan (unlimited)

### How to Upgrade Plan

1. Go to https://rapidapi.com/api-sports/api/api-football
2. Click "Pricing"
3. Select desired plan
4. Click "Subscribe"
5. Update billing information

Your API key remains the same - no code changes needed when upgrading!

---

## Monitoring RapidAPI Usage

### Real-Time Monitoring

1. Go to https://rapidapi.com/dashboard
2. View "API Calls" chart
3. See usage by endpoint
4. Monitor rate limits

### Set Up Alerts

1. Dashboard → Settings
2. Alerts section
3. Set threshold (e.g., notify at 80% of plan limit)
4. Choose notification method (email)

### Analyze Performance

1. Dashboard → Logs
2. Filter by API, endpoint, status code
3. View response times
4. Identify slowest endpoints

---

## Migration Checklist

- [ ] Create RapidAPI account (Step 1.1)
- [ ] Subscribe to API-Football free plan (Step 1.2)
- [ ] Copy RapidAPI Key (Step 1.3)
- [ ] Update .env file with new variables (Step 2.1)
- [ ] Update Docker configuration if using Docker (Step 2.2)
- [ ] Update production secrets (Step 2.3)
- [ ] Test API key directly with curl (Test 2)
- [ ] Test backend fixtures endpoint (Test 3)
- [ ] Test prediction service health (Test 4)
- [ ] Full end-to-end integration test (Test 5)
- [ ] Verify admin dashboard shows data
- [ ] Check RapidAPI dashboard for usage

---

## RapidAPI API-Football Endpoint Reference

All endpoints remain the same. Here are the most important ones:

### Fixtures
```
GET /fixtures
Parameters: id, date, league, season, status, live
```

### Teams
```
GET /teams
Parameters: id, name, league, season
```

### Standings
```
GET /standings
Parameters: league, season
```

### Injuries
```
GET /injuries
Parameters: league, season, team, fixture, player
```

### Venue
```
GET /venues
Parameters: id, country, league, city, search
```

### Players
```
GET /players
Parameters: id, team, search, league, season
```

### Statistics
```
GET /fixtures/statistics
Parameters: fixture, team, league
```

---

## Rollback Plan (If Needed)

If you need to revert to direct api-football.com:

1. Update `.env` with old variables:
```env
API_FOOTBALL_KEY=your_old_key
API_FOOTBALL_HOST=v3.football.api-sports.io
```

2. Revert code changes:
```bash
git checkout HEAD -- backend/src/services/api-football.ts
git checkout HEAD -- prediction-service/app/services/api_football.py
git checkout HEAD -- prediction-service/app/core/config.py
```

3. Restart services

---

## FAQ

**Q: Do I lose any functionality with RapidAPI?**
A: No. RapidAPI simply proxies the same API-Football API. All endpoints and features remain identical.

**Q: Can I use my existing API-Football key?**
A: No. RapidAPI uses different authentication. You must get a RapidAPI key.

**Q: What if my API-Football key expires?**
A: Doesn't matter - you're using RapidAPI now. Manage your key through RapidAPI dashboard.

**Q: Will caching still work?**
A: Yes. Redis caching is unaffected and works the same way.

**Q: Do I need to change API endpoints?**
A: No. Endpoints remain the same. Only the host/authentication changed.

**Q: How do I increase my request limit?**
A: Upgrade your RapidAPI plan: https://rapidapi.com/api-sports/api/api-football/pricing

**Q: Is RapidAPI more expensive than direct api-football.com?**
A: Comparable pricing. Free tier is similar. Professional plans are slightly cheaper with RapidAPI.

---

## Support Resources

- RapidAPI Docs: https://docs.rapidapi.com/
- API-Football on RapidAPI: https://rapidapi.com/api-sports/api/api-football
- API-Football Endpoint Docs: https://www.api-football.com/documentation
- RapidAPI Status: https://status.rapidapi.com/

---

## Summary

Migration to RapidAPI is complete! You now have:

- ✅ Centralized API key management
- ✅ Better monitoring and analytics
- ✅ Reliable uptime and support
- ✅ Same API functionality
- ✅ No code changes required (except environment variables)
- ✅ Easy plan upgrades

Start using your new RapidAPI key today! 🚀
