# Analyzer-Prototype: Quick Reference Card

A one-page summary of everything you need to deploy and use the system.

## Deployment Overview

```
┌─────────────────────────────────────────────────┐
│     ANALYZER-PROTOTYPE DEPLOYMENT FLOW           │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. GET API KEYS (15 min)                      │
│     • API-Football: api-football.com           │
│     • The Odds API: the-odds-api.com           │
│     • Generate JWT: openssl rand -base64 32    │
│                                                 │
│  2. SETUP DATABASE (10 min)                    │
│     • PostgreSQL: psql -U analyzer -d analyzer │
│     • Redis: redis-cli ping                    │
│     • Migrations: npx prisma migrate dev       │
│                                                 │
│  3. START SERVICES (10 min)                    │
│     • Backend:  cd backend && npm run dev     │
│     • Python:   cd prediction-service && ...  │
│     • Frontend: cd frontend && npm run dev    │
│                                                 │
│  4. TEST EVERYTHING (10 min)                   │
│     • Login to http://localhost:3000           │
│     • Check Admin → Analytics & Jobs           │
│     • View predictions with reasoning          │
│                                                 │
│  5. DEPLOY TO PRODUCTION (varies)              │
│     • Docker Compose or Heroku/AWS             │
│     • Setup SSL/HTTPS                          │
│     • Configure monitoring                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Essential Commands

### Setup Phase

```bash
# Clone and initialize
git clone <repo-url>
cd analyzer-prototype
cp .env.example .env.local

# Add API keys to .env.local
API_FOOTBALL_KEY=...
THE_ODDS_API_KEY=...
JWT_SECRET=$(openssl rand -base64 32)
```

### Backend Startup

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev  # Runs on localhost:3001
```

### Prediction Service Startup

```bash
cd prediction-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Startup

```bash
cd frontend
npm install
npm run dev  # Runs on localhost:3000
```

### Quick Testing

```bash
# Register user
curl -X POST http://localhost:3001/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"register","email":"test@test.com","password":"Pass123!"}'

# Get predictions with reasoning
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/predictions?includeReasoning=true"

# Get analytics
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/analytics?period=30d"

# Check background jobs
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/jobs"
```

## Environment Variables

```bash
# ESSENTIAL (required)
API_FOOTBALL_KEY=...              # From api-football.com
THE_ODDS_API_KEY=...              # From the-odds-api.com
JWT_SECRET=...                    # Generated: openssl rand -base64 32
DATABASE_URL=postgresql://...     # PostgreSQL connection
REDIS_URL=redis://localhost:6379  # Redis connection

# OPTIONAL (have defaults)
NODE_ENV=development              # development or production
JWT_EXPIRY=86400                  # Token expiry (seconds)
CACHE_TTL_SECONDS=300             # Cache TTL (seconds)
PREDICTION_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Admin Panel Features

### Analytics Tab
```
View → Select Period (7d, 30d, 90d)
├── Overall Stats
│   ├── Total Predictions
│   ├── Win Rate
│   ├── Average Confidence
│   └── Estimated ROI
├── Market Accuracy
│   └── Table: Market | Accuracy | Volume | ROI
└── Confidence Distribution
    ├── Very High (80+%)
    ├── High (70-79%)
    ├── Medium (60-69%)
    └── Low (<60%)
```

### Background Jobs Tab
```
View & Control → Start/Stop All Jobs
├── Registered Jobs (4 total)
│   ├── Sync Match Results (every 30 min)
│   ├── Update League Reliability (daily 2 AM)
│   ├── Calibrate Confidence (weekly Mon 3 AM)
│   └── Cleanup Cache (every hour)
├── Job Schedules (cron display)
└── Recent Executions (last 5 runs)
    └── Shows: Job | Status | Duration | Time
```

## Key Files Modified

| File | Purpose |
|------|---------|
| `backend/src/app/api/predictions/route.ts` | Reasoning enrichment |
| `backend/src/app/api/analytics/route.ts` | Market accuracy + confidence distribution |
| `backend/src/app/api/jobs/route.ts` | Job monitoring API |
| `backend/src/services/job-scheduler.ts` | Background job scheduler |
| `frontend/src/app/(dashboard)/admin/page.tsx` | Analytics & Jobs UI tabs |
| `frontend/src/hooks/use-predictions.ts` | Reasoning hooks |

## Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Health Check URLs

```
Backend:      http://localhost:3001/api/health
Prediction:   http://localhost:8000/api/health
Frontend:     http://localhost:3000
Database:     psql -h localhost -U analyzer -d analyzer_db
Redis:        redis-cli ping
```

## Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| DB connection refused | `sudo service postgresql start` |
| Redis refused | `redis-server` |
| Scheduler not running | Restart backend, check REDIS_URL |
| No predictions showing | Check API keys in .env |
| Analytics empty | Ensure predictions have status='CONFIRMED' |
| JWT auth failing | Verify JWT_SECRET is set |

## Production Checklist

```
Before Going Live:
□ All API keys obtained and tested
□ PostgreSQL production database created & backed up
□ Redis production instance running
□ HTTPS/SSL certificate obtained
□ Environment variables set in secrets manager
□ Database migrations run on production
□ Scheduler initialized on server startup
□ Monitoring/alerts configured
□ Database backups scheduled daily
□ Error logging configured
□ Rate limiting enabled
```

## Monitoring Commands

```bash
# Check service status
docker-compose ps

# View real-time logs
docker-compose logs -f

# Database stats
psql -c "SELECT COUNT(*) FROM Prediction;"

# Redis cache info
redis-cli INFO stats

# Job execution history
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/jobs | jq '.data.recentHistory'
```

## Documentation Files

| File | Purpose | Time to Read |
|------|---------|--------------|
| `/README.md` | Complete guide | 20 min |
| `/QUICK_START.md` | Feature overview | 5 min |
| `/IMPLEMENTATION_GUIDE.md` | Technical details | 15 min |
| `/DEPLOYMENT_CHECKLIST.md` | Step-by-step deployment | 30 min |
| `/API_KEYS_SETUP.md` | API key instructions | 15 min |
| `/QUICK_REFERENCE.md` | This file | 3 min |

## Common Questions

**Q: How do I get API keys?**
A: See `/API_KEYS_SETUP.md` for complete step-by-step instructions. Takes ~15 min total.

**Q: How long does deployment take?**
A: Local dev: 45 min | Production: 2-3 hours (including infrastructure setup)

**Q: What's the minimum cloud cost?**
A: ~$15-20/month (PostgreSQL + Redis + VPS)

**Q: How many requests per month are free?**
A: API-Football: 3000 (100/day) | The Odds API: 500

**Q: Can I use free tier for production?**
A: Not recommended. Upgrade to paid plans for reliability.

**Q: How do I scale to handle more traffic?**
A: See `/README.md` section "Scaling for Production"

**Q: How often should I rotate API keys?**
A: Every 90 days minimum. Immediately if compromised.

## Success Indicators

Your system is working when:

✅ Can login and see dashboard
✅ Predictions show with reasoning
✅ Admin panel displays analytics
✅ Background jobs running (check every 30 min)
✅ All API endpoints responding < 500ms
✅ Zero authentication errors
✅ Cache hit rate > 60%

## Emergency Contacts

**API-Football**: support@api-football.com  
**The Odds API**: support@the-odds-api.com  
**Documentation**: See `/README.md`  

## Next Steps

1. **First Time?** → Read `/QUICK_START.md` (5 min)
2. **Setting Up?** → Follow `/DEPLOYMENT_CHECKLIST.md` (varies)
3. **Need Keys?** → See `/API_KEYS_SETUP.md` (15 min)
4. **Questions?** → Check `/README.md` FAQ section
5. **Technical?** → Review `/IMPLEMENTATION_GUIDE.md`

---

**System Version**: 1.0  
**Last Updated**: 2026-05-29  
**Status**: Production Ready ✅
