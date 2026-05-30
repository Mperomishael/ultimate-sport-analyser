# RapidAPI Migration - Implementation Checklist

## Pre-Migration (Before You Start)

- [ ] Backup current `.env` files
- [ ] Document current API-Football key (for potential rollback)
- [ ] Review current test coverage
- [ ] Plan deployment window if on production
- [ ] Inform team of migration

---

## Phase 1: Get RapidAPI Key (5 minutes)

- [ ] Visit https://rapidapi.com/api-sports/api/api-football
- [ ] Create or login to RapidAPI account
- [ ] Click "Subscribe to Test" (free plan)
- [ ] Navigate to Dashboard → My Apps
- [ ] Copy X-RapidAPI-Key value
- [ ] Save key in secure location (KeePass, 1Password, etc.)
- [ ] Verify plan shows 100 requests/day

**Checkpoint**: You have your RapidAPI key ready

---

## Phase 2: Code Updates (Already Completed)

The following files have been automatically updated:

### Code Changes Verification
- [x] `/backend/src/services/api-football.ts` - Updated ✅
- [x] `/prediction-service/app/core/config.py` - Updated ✅
- [x] `/prediction-service/app/services/api_football.py` - Updated ✅
- [x] `/.env.example` - Created ✅
- [x] `/README.md` - Updated ✅

### Documentation Created
- [x] `/RAPIDAPI_MIGRATION.md` - Comprehensive guide ✅
- [x] `/RAPIDAPI_CHANGES.md` - Implementation summary ✅

**Checkpoint**: All code changes are complete

---

## Phase 3: Environment Configuration (10 minutes)

### Local Development Setup

- [ ] Edit `.env.local` or `.env.development.local`

```bash
# Remove old variables (if present)
# API_FOOTBALL_KEY=...
# API_FOOTBALL_HOST=...

# Add new RapidAPI variables
RAPIDAPI_KEY="paste_your_key_from_phase_1"
RAPIDAPI_HOST="api-football-v1.p.rapidapi.com"
RAPIDAPI_FOOTBALL_ENDPOINT="https://api-football-v1.p.rapidapi.com"
```

- [ ] Verify all three variables are set
- [ ] Check for extra whitespace/quotes
- [ ] Save file

### Docker Configuration (if applicable)

- [ ] Update `.env.docker` or `.env.production`:

```bash
RAPIDAPI_KEY="your_key_here"
RAPIDAPI_HOST="api-football-v1.p.rapidapi.com"
RAPIDAPI_FOOTBALL_ENDPOINT="https://api-football-v1.p.rapidapi.com"
```

- [ ] Update Docker Compose environment variables
- [ ] Verify docker-compose.yml has new variables

### Production Secrets (if applicable)

- [ ] Add to Vercel/AWS/deployment platform:
  - [ ] `RAPIDAPI_KEY`
  - [ ] `RAPIDAPI_HOST`
  - [ ] `RAPIDAPI_FOOTBALL_ENDPOINT`
- [ ] Remove old variables (API_FOOTBALL_KEY, API_FOOTBALL_HOST)
- [ ] Verify secrets are set in deployment dashboard

**Checkpoint**: All environment variables configured

---

## Phase 4: Service Restart (5 minutes)

### Backend

```bash
cd backend
npm install  # (if needed)
npm run dev
```

- [ ] Backend starts without errors
- [ ] No missing environment variable warnings
- [ ] Server running on http://localhost:3001

### Prediction Service

```bash
cd prediction-service
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt  # (if needed)
uvicorn app.main:app --reload --port 8000
```

- [ ] Service starts without errors
- [ ] No missing environment variable warnings
- [ ] Service running on http://localhost:8000

### Frontend

```bash
cd frontend
npm run dev
```

- [ ] Frontend loads on http://localhost:3000
- [ ] No API connection errors in console

**Checkpoint**: All services running

---

## Phase 5: Testing (15 minutes)

### Test 1: Direct RapidAPI Call

```bash
curl "https://api-football-v1.p.rapidapi.com/fixtures?date=2026-05-29" \
  -H "x-rapidapi-key: YOUR_RAPIDAPI_KEY" \
  -H "x-rapidapi-host: api-football-v1.p.rapidapi.com"
```

- [ ] Response is valid JSON
- [ ] Returns fixtures array
- [ ] No 403/401 errors

**Expected Response**:
```json
{
  "response": [
    {
      "fixture": { "id": 123, ... },
      ...
    }
  ]
}
```

### Test 2: Backend Fixtures Endpoint

```bash
# First get a token
curl -X POST http://localhost:3001/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"test@example.com","password":"pass"}'

# Extract TOKEN from response

# Then test fixtures
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3001/api/fixtures?date=2026-05-29"
```

- [ ] Response includes fixtures
- [ ] Response includes enriched data (form, h2h, injuries)
- [ ] No 500 errors in backend console

### Test 3: Prediction Service Health

```bash
curl http://localhost:8000/api/health
```

- [ ] Response: `{"status": "healthy"}`
- [ ] HTTP 200 status code

### Test 4: Frontend Application

- [ ] Visit http://localhost:3000
- [ ] Login with test credentials
- [ ] Dashboard loads
- [ ] Can view predictions
- [ ] Admin panel accessible
- [ ] Analytics tab shows data
- [ ] No "API Error" messages in UI

### Test 5: Check RapidAPI Usage

- [ ] Visit https://rapidapi.com/dashboard
- [ ] View "API Calls" chart
- [ ] See requests counted toward 100/day limit
- [ ] No rate limit errors

**Checkpoint**: All tests passing

---

## Phase 6: Production Deployment (if applicable)

### Pre-Deployment

- [ ] All tests passing in development
- [ ] Code committed to version control
- [ ] Deployment branch created (if using)
- [ ] Team notified of deployment
- [ ] Maintenance window scheduled (if needed)

### Deployment

- [ ] Deploy backend with new environment variables
- [ ] Deploy prediction service with new environment variables
- [ ] Deploy frontend (no code changes needed)
- [ ] Verify all services started
- [ ] Check deployment logs for errors

### Post-Deployment

- [ ] Test health endpoints: `/api/health`, `/api/health` (prediction service)
- [ ] Test fixtures endpoint: `/api/fixtures?date=2026-05-29`
- [ ] Test predictions endpoint: `/api/predictions?includeReasoning=true`
- [ ] Login to application and verify predictions load
- [ ] Check admin panel → Analytics
- [ ] Monitor logs for errors
- [ ] Check RapidAPI dashboard for usage

**Checkpoint**: Production running smoothly

---

## Phase 7: Monitoring & Optimization

### First Week

- [ ] Monitor API usage daily
- [ ] Watch for rate limit warnings
- [ ] Check error logs for RapidAPI-related issues
- [ ] Verify prediction accuracy unchanged
- [ ] Test with different dates/leagues

### Ongoing

- [ ] Set up RapidAPI alerts (https://rapidapi.com/dashboard)
- [ ] Monitor cost if using paid plan
- [ ] Track API response times
- [ ] Consider upgrading plan if hitting limits
- [ ] Review monthly usage reports

**Checkpoint**: Monitoring configured

---

## Rollback Plan (If Needed)

If you need to revert to api-football.com:

- [ ] Have original API-Football key ready
- [ ] Restore old environment variables
- [ ] Revert code changes:

```bash
git checkout HEAD -- \
  backend/src/services/api-football.ts \
  prediction-service/app/core/config.py \
  prediction-service/app/services/api_football.py
```

- [ ] Restart all services
- [ ] Verify system working with old API

---

## Completion Checklist

### Code & Configuration
- [x] All code updated (5 files)
- [x] Documentation created (2 files)
- [x] Environment variables mapped
- [ ] Local .env configured
- [ ] Docker config updated (if needed)
- [ ] Production secrets added (if needed)

### Testing
- [ ] Direct API test passed
- [ ] Backend endpoint test passed
- [ ] Prediction service health check passed
- [ ] Frontend application test passed
- [ ] RapidAPI usage visible

### Deployment
- [ ] All services restarted
- [ ] All tests passing
- [ ] Production deployed (if applicable)
- [ ] Monitoring configured
- [ ] Team notified

### Documentation
- [x] README updated
- [x] Migration guide created
- [x] Changes summary created
- [ ] Internal team documentation updated

---

## Success Criteria

Your migration is successful when:

✅ **Fixtures Load Correctly**
- Predictions visible with correct data
- Form, H2H, injuries all populated
- No API errors in browser console

✅ **Admin Panel Works**
- Analytics tab shows data
- Background jobs running
- No error messages

✅ **Performance Maintained**
- Page load times < 500ms
- API responses < 2000ms
- Cache hit rate > 60%

✅ **Monitoring Active**
- RapidAPI dashboard shows usage
- No rate limit warnings
- All health checks passing

✅ **Team Ready**
- Documentation reviewed
- Team trained on new setup
- Rollback plan understood

---

## Common Issues & Quick Fixes

| Issue | Check | Solution |
|-------|-------|----------|
| 403 Forbidden | API Key | Verify RAPIDAPI_KEY is correct and fully copied |
| 404 Not Found | URL | Ensure using https://api-football-v1.p.rapidapi.com |
| Timeout Error | Network | Check RAPIDAPI_FOOTBALL_ENDPOINT is complete URL |
| Rate Limited | Usage | Free tier = 100/day, upgrade if needed |
| Connection Refused | Services | Verify backend and prediction service are running |

For more troubleshooting, see [RAPIDAPI_MIGRATION.md](./RAPIDAPI_MIGRATION.md)

---

## Final Sign-Off

- [ ] Migrations Manager: Reviewed all changes
- [ ] Backend Team: Verified implementation
- [ ] DevOps: Confirmed deployment ready
- [ ] QA: All tests passing
- [ ] Product Owner: System live and stable

---

## References

- [RAPIDAPI_MIGRATION.md](./RAPIDAPI_MIGRATION.md) - Full setup guide
- [RAPIDAPI_CHANGES.md](./RAPIDAPI_CHANGES.md) - Implementation details
- [README.md](./README.md) - Updated deployment guide
- [RapidAPI API-Football](https://rapidapi.com/api-sports/api/api-football)

---

**Migration Status**: ✅ READY FOR DEPLOYMENT

All code changes complete. Follow the phases above to complete the migration.

Expected total time: ~45 minutes (including testing)
