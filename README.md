# Football Predictions Platform

A production-ready AI-powered football prediction web application built with Next.js 15, FastAPI, PostgreSQL, and real-time odds integration.

## Architecture

```
football-predictions/
├── frontend/           # Next.js 15 + React 19 + Tailwind + shadcn/ui
├── backend/            # Next.js API routes + Prisma ORM
├── prediction-service/ # Python FastAPI + ML prediction engine
├── database/           # PostgreSQL migrations & seed data
├── docker/             # Docker configurations
└── docs/               # Documentation
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL, Redis, JWT Auth
- **Prediction Engine**: Python, FastAPI, NumPy, Pandas, scikit-learn
- **Data APIs**: RapidAPI (Football), The Odds API
- **Infrastructure**: Docker, Docker Compose, Redis caching

## Features

### Core Prediction Engine
- **Weighted Statistical Analysis**: Recent form (20%), H2H (15%), Home/Away form (15%), Goals trend (15%), Injuries (10%), Odds movement (10%), Standings (10%), Motivation (5%)
- **Market Predictions**: Over 1.5, Over 2.5, BTTS, Home Win, Away Win, Draw, Double Chance, Draw No Bet, Handicap
- **Confidence Scoring**: 0-100% with value ratings
- **ML Enhancement**: Feature vectors for model training

### Smart Accumulator Generator
- Target odds configuration
- Risk level selection (Conservative/Balanced/Aggressive)
- Market filtering
- Greedy algorithm for optimal selection

### Dashboard
- Real-time predictions with confidence meters
- Live odds ticker with movement tracking
- Match analytics with H2H, form, statistics
- Bet slip builder
- Filtering and search

### Admin Panel
- Prediction weight management
- API usage monitoring
- League blacklist management
- System configuration

### Security & Performance
- JWT authentication
- Rate limiting (60 req/min)
- Redis caching with TTL
- API retry logic with exponential backoff
- CORS protection

## Complete Deployment & Setup Guide

### Prerequisites
- **Node.js** 20+ (https://nodejs.org/)
- **Python** 3.11+ (https://python.org/)
- **PostgreSQL** 15+ (https://postgresql.org/)
- **Redis** 7+ (https://redis.io/)
- **Docker & Docker Compose** (optional, for containerized deployment)
- **Git** (for version control)

### API Keys Required

Before deployment, obtain the following API keys:

| API | Purpose | Where to Get | Cost |
|-----|---------|--------------|------|
| RapidAPI Key | Football data via RapidAPI (replaces api-football.com) | https://rapidapi.com/api-sports/api/api-football | Free tier: 100 req/day |
| The Odds API | Live odds & betting lines | https://the-odds-api.com/ | Free tier: 500 req/month |
| JWT Secret | API authentication | Generate: `openssl rand -base64 32` | Free |

**Note:** This project uses RapidAPI for football data instead of direct api-football.com integration. See [RAPIDAPI_MIGRATION.md](./RAPIDAPI_MIGRATION.md) for complete setup instructions.

---

## Step-by-Step Deployment

### Phase 1: Local Development Setup

#### Step 1.1: Clone & Initialize Repository

```bash
# Clone the repository
git clone <your-repo-url>
cd analyzer-prototype

# Create environment file
cp .env.example .env.local
cp .env.example .env.production
```

#### Step 1.2: Setup PostgreSQL Database

```bash
# Option A: Using Docker
docker run --name analyzer-postgres \
  -e POSTGRES_USER=analyzer \
  -e POSTGRES_PASSWORD=securepassword \
  -e POSTGRES_DB=analyzer_db \
  -p 5432:5432 \
  -d postgres:15

# Option B: Using existing PostgreSQL
createdb analyzer_db
```

#### Step 1.3: Setup Redis Cache

```bash
# Option A: Using Docker
docker run --name analyzer-redis \
  -p 6379:6379 \
  -d redis:7

# Option B: Using existing Redis
redis-server
```

#### Step 1.4: Configure Environment Variables

Edit `.env.local` with your API keys and database URLs:

```bash
# .env.local or .env.development.local

# ============================================
# DATABASE & CACHE
# ============================================
DATABASE_URL="postgresql://analyzer:securepassword@localhost:5432/analyzer_db"
REDIS_URL="redis://localhost:6379/0"
CACHE_TTL_SECONDS=300
CACHE_PREDICTION_TTL=1800

# ============================================
# EXTERNAL APIs (RapidAPI)
# ============================================
RAPIDAPI_KEY="your_rapidapi_key_from_dashboard"
RAPIDAPI_HOST="api-football-v1.p.rapidapi.com"
RAPIDAPI_FOOTBALL_ENDPOINT="https://api-football-v1.p.rapidapi.com"
THE_ODDS_API_KEY="your_odds_api_key_here"

# ============================================
# AUTHENTICATION
# ============================================
JWT_SECRET="$(openssl rand -base64 32)"  # Generate with: openssl rand -base64 32
JWT_EXPIRY=86400  # 24 hours in seconds

# ============================================
# PREDICTION SERVICE
# ============================================
PREDICTION_SERVICE_URL="http://localhost:8000"
PREDICTION_SERVICE_API_KEY="your-prediction-service-key"
PREDICTION_SERVICE_TIMEOUT=30000

# ============================================
# APPLICATION
# ============================================
NODE_ENV="development"
NEXT_PUBLIC_API_BASE="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ============================================
# LOGGING & MONITORING
# ============================================
LOG_LEVEL="debug"
ENABLE_JOB_LOGGING=true
```

**How to Get Each API Key:**

1. **RapidAPI Key (Football Data)**:
   - Visit https://rapidapi.com/api-sports/api/api-football
   - Click "Sign Up" or "Log In"
   - Click "Subscribe to Test" (free plan)
   - Go to Dashboard → My Apps → Copy X-RapidAPI-Key
   - Set as `RAPIDAPI_KEY` (free tier: 100 requests/day)
   - See [RAPIDAPI_MIGRATION.md](./RAPIDAPI_MIGRATION.md) for detailed setup

2. **The Odds API Key**:
   - Visit https://the-odds-api.com/
   - Sign up for free
   - Get key from Dashboard
   - Copy your API key (free tier limited to 500 requests/month)

3. **JWT Secret**:
   - Generate with: `openssl rand -base64 32`
   - Copy the output to `JWT_SECRET`

4. **Database URL**:
   - Format: `postgresql://username:password@host:port/database`
   - Example: `postgresql://analyzer:pass123@localhost:5432/analyzer_db`

5. **Redis URL**:
   - Format: `redis://password@host:port/db`
   - Example: `redis://localhost:6379/0`

---

### Phase 2: Backend Setup

#### Step 2.1: Install Backend Dependencies

```bash
cd backend

# Install Node dependencies
npm install

# Generate Prisma client
npx prisma generate
```

#### Step 2.2: Setup Database & Run Migrations

```bash
# Create/update database schema
npx prisma migrate dev --name init

# Seed database with sample data (optional)
npx prisma db seed

# View database with Prisma Studio
npx prisma studio
```

#### Step 2.3: Start Backend Server

```bash
# Development mode (with hot reload)
npm run dev

# Or production build
npm run build
npm start
```

Backend will run on `http://localhost:3001`

**Verify Backend is Working:**
```bash
curl http://localhost:3001/api/health
# Should return: { "status": "ok" }
```

---

### Phase 3: Prediction Service Setup (Python)

#### Step 3.1: Setup Python Environment

```bash
cd prediction-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Step 3.2: Update Prediction Service Config

Edit `prediction-service/app/core/config.py`:

```python
class Settings(BaseSettings):
    # RapidAPI Configuration
    RAPIDAPI_KEY: str = ""
    RAPIDAPI_HOST: str = "api-football-v1.p.rapidapi.com"
    RAPIDAPI_FOOTBALL_ENDPOINT: str = "https://api-football-v1.p.rapidapi.com"
    THE_ODDS_API_KEY: str = ""
    
    REDIS_URL: str = "redis://localhost:6379/0"
    DATABASE_URL: str = "postgresql://..."
    DEBUG: bool = False
```

#### Step 3.3: Start Prediction Service

```bash
# Development mode
uvicorn app.main:app --reload --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Prediction service will run on `http://localhost:8000`

**Verify Service is Working:**
```bash
curl http://localhost:8000/api/health
# Should return: { "status": "healthy" }
```

---

### Phase 4: Frontend Setup

#### Step 4.1: Install Frontend Dependencies

```bash
cd frontend

npm install
```

#### Step 4.2: Build Frontend

```bash
# Development mode
npm run dev

# Production build
npm run build
```

Frontend will run on `http://localhost:3000`

**Verify Frontend is Loading:**
```bash
# Visit in browser: http://localhost:3000
# Should load the login/dashboard page
```

---

### Phase 5: Verify All Components Work Together

#### Step 5.1: Test User Registration

```bash
curl -X POST http://localhost:3001/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'

# Response should include: { "token": "...", "user": { ... } }
```

#### Step 5.2: Test Fixtures API

```bash
curl -X GET "http://localhost:3001/api/fixtures?date=2026-05-29" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return array of fixtures for the date
```

#### Step 5.3: Test Predictions API

```bash
curl -X GET "http://localhost:3001/api/predictions?includeReasoning=true&minConfidence=70" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return predictions with reasoning factors
```

#### Step 5.4: Test Analytics

```bash
curl -X GET "http://localhost:3001/api/analytics?period=30d" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return analytics with market accuracy and confidence distribution
```

#### Step 5.5: Test Background Jobs

```bash
curl -X GET "http://localhost:3001/api/jobs" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return registered jobs and execution history
```

---

## Docker Deployment (Production)

### Using Docker Compose (All-in-One)

#### Step 1: Create docker-compose.yml

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: analyzer
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: analyzer_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - analyzer-network

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    networks:
      - analyzer-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      RAPIDAPI_KEY: ${RAPIDAPI_KEY}
      RAPIDAPI_HOST: api-football-v1.p.rapidapi.com
      RAPIDAPI_FOOTBALL_ENDPOINT: https://api-football-v1.p.rapidapi.com
      THE_ODDS_API_KEY: ${THE_ODDS_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    networks:
      - analyzer-network

  prediction-service:
    build:
      context: ./prediction-service
      dockerfile: Dockerfile
    environment:
      RAPIDAPI_KEY: ${RAPIDAPI_KEY}
      RAPIDAPI_HOST: api-football-v1.p.rapidapi.com
      RAPIDAPI_FOOTBALL_ENDPOINT: https://api-football-v1.p.rapidapi.com
      THE_ODDS_API_KEY: ${THE_ODDS_API_KEY}
      REDIS_URL: ${REDIS_URL}
      DATABASE_URL: ${DATABASE_URL}
    ports:
      - "8000:8000"
    depends_on:
      - redis
      - postgres
    networks:
      - analyzer-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_BASE: ${NEXT_PUBLIC_API_BASE}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL}
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - analyzer-network

volumes:
  postgres_data:

networks:
  analyzer-network:
    driver: bridge
```

#### Step 2: Create .env.docker

```bash
cp .env.example .env.docker

# Edit with your production values
DB_PASSWORD=your_secure_db_password
DATABASE_URL=postgresql://analyzer:your_secure_db_password@postgres:5432/analyzer_db
REDIS_URL=redis://redis:6379/0
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=api-football-v1.p.rapidapi.com
RAPIDAPI_FOOTBALL_ENDPOINT=https://api-football-v1.p.rapidapi.com
THE_ODDS_API_KEY=your_odds_api_key
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_API_BASE=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### Step 3: Deploy with Docker Compose

```bash
# Build images
docker-compose -f docker-compose.yml --env-file .env.docker build

# Start all services
docker-compose -f docker-compose.yml --env-file .env.docker up -d

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Check logs
docker-compose logs -f
```

---

## Getting Started - First Usage

### Step 1: Create Admin Account

```bash
curl -X POST http://localhost:3001/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "email": "admin@example.com",
    "password": "AdminPass123!@#"
  }'

# Save the token returned
```

### Step 2: Login to Frontend

1. Visit http://localhost:3000
2. Enter email and password
3. Click Login
4. You should see the Dashboard

### Step 3: View Predictions

```
Dashboard → Predictions
- See all AI predictions for upcoming matches
- Confidence scores (color-coded)
- Recommended bets with odds
```

### Step 4: Access Admin Panel

```
Dashboard → Admin
- Analytics tab: View performance metrics
- Weights tab: Adjust prediction algorithm weights
- Background Jobs tab: Monitor automated tasks
```

### Step 5: Monitor Predictions with Reasoning

```
GET /api/predictions?includeReasoning=true

Or in the frontend:
- Click any prediction to expand
- View detailed reasoning analysis
- See breakdown of factors that influenced the prediction
```

### Step 6: Check Analytics

```
Admin Panel → Analytics Tab
- Select period (7d, 30d, 90d)
- View win rate, ROI, confidence distribution
- See market accuracy by betting market
```

### Step 7: Monitor Background Jobs

```
Admin Panel → Background Jobs Tab
- View 4 registered background jobs
- See job schedules (30min, daily, weekly, hourly)
- Monitor recent executions and performance
- Control jobs (Start/Stop all)
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U analyzer -d analyzer_db

# Test from backend
curl -X GET http://localhost:3001/api/health
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# Check Redis from backend
curl -X GET http://localhost:3001/api/health
```

### Missing API Data

```bash
# Verify RapidAPI keys are correct
echo $RAPIDAPI_KEY
echo $RAPIDAPI_HOST
echo $THE_ODDS_API_KEY

# Test RapidAPI Football endpoint directly
curl "https://api-football-v1.p.rapidapi.com/fixtures?date=2026-05-29" \
  -H "x-rapidapi-key: YOUR_RAPIDAPI_KEY" \
  -H "x-rapidapi-host: api-football-v1.p.rapidapi.com"
```

### Jobs Not Running

```bash
# Check scheduler initialization in backend startup
grep -r "initializeScheduler" backend/src/

# Verify Redis is running
redis-cli ping

# Check job logs
docker-compose logs backend | grep "job"
```

---

## Environment Variables Cheat Sheet

```bash
# Copy this and fill in your values

# Database
DATABASE_URL="postgresql://analyzer:PASSWORD@localhost:5432/analyzer_db"

# Cache
REDIS_URL="redis://localhost:6379/0"

# RapidAPI (Football Data)
RAPIDAPI_KEY="YOUR_RAPIDAPI_KEY_HERE"
RAPIDAPI_HOST="api-football-v1.p.rapidapi.com"
RAPIDAPI_FOOTBALL_ENDPOINT="https://api-football-v1.p.rapidapi.com"

# External APIs
THE_ODDS_API_KEY="YOUR_KEY_HERE"

# Auth
JWT_SECRET="GENERATED_WITH_openssl_rand_-base64_32"
JWT_EXPIRY=86400

# Service URLs
PREDICTION_SERVICE_URL="http://localhost:8000"
PREDICTION_SERVICE_API_KEY="YOUR_SERVICE_KEY"
NEXT_PUBLIC_API_BASE="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Configuration
NODE_ENV="development"
LOG_LEVEL="debug"
ENABLE_JOB_LOGGING="true"
```

## Post-Deployment Checklist

### Monitoring & Health Checks

```bash
# Check all services running
curl http://localhost:3001/api/health
curl http://localhost:8000/api/health
curl http://localhost:3000  # Frontend should load

# Verify database is populated
npx prisma studio
# Should show fixtures, predictions, teams, leagues

# Test a prediction request
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/predictions?includeReasoning=true

# Monitor background jobs
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/jobs
```

### Performance Optimization

1. **Cache Configuration**
   - Prediction data cached for 30 minutes
   - Team/league data cached for 1 hour
   - Adjust `CACHE_TTL_SECONDS` and `CACHE_PREDICTION_TTL` as needed

2. **Database Indexes**
   ```bash
   npx prisma db execute --stdin < optimize.sql
   ```

3. **Redis Monitoring**
   ```bash
   redis-cli INFO
   redis-cli MONITOR  # Real-time command watching
   ```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth?action=register` - User registration
- `POST /api/auth?action=login` - User login
- `POST /api/auth?action=logout` - User logout

### Fixtures
- `GET /api/fixtures?date=2026-05-29` - Get fixtures by date
- `GET /api/fixtures?id=12345` - Get fixture details  
- `GET /api/fixtures?live=true` - Get live fixtures
- `GET /api/fixtures?leagueId=39` - Get fixtures by league

### Predictions (Enhanced)
- `GET /api/predictions?date=2026-05-29` - Get predictions
- `GET /api/predictions?includeReasoning=true` - Get predictions with reasoning (NEW)
- `GET /api/predictions?minConfidence=75` - Filter by confidence
- `GET /api/predictions?status=CONFIRMED` - Filter by status
- `POST /api/predictions` - Generate new prediction

### Analytics (Enhanced)
- `GET /api/analytics?period=30d` - Get analytics (NEW)
  - Periods: `7d`, `30d`, `90d`, `all`
  - Returns: win rate, ROI, market accuracy, confidence distribution

### Background Jobs (Enhanced)
- `GET /api/jobs` - Get job status and history (NEW)
- `POST /api/jobs` - Control jobs (start/stop) (NEW)

### Odds
- `GET /api/odds?leagueId=39` - Get odds by league
- `GET /api/odds?eventId=abc123` - Get event odds
- `GET /api/odds?live=true` - Get live odds

### Prediction Service (FastAPI)
- `POST /api/predict` - Generate match prediction
- `POST /api/accumulator` - Generate accumulator
- `GET /api/health` - Health check

---

## API Examples with cURL

### 1. Register & Login

```bash
# Register
curl -X POST http://localhost:3001/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "email": "user@example.com",
    "password": "SecurePass123!@#"
  }'

# Login
curl -X POST http://localhost:3001/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "user@example.com",
    "password": "SecurePass123!@#"
  }'
# Save the token from response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Get Predictions with Reasoning

```bash
curl -X GET "http://localhost:3001/api/predictions?includeReasoning=true&minConfidence=70" \
  -H "Authorization: Bearer $TOKEN"

# Response includes:
# - Standard prediction fields
# - reasoning: "Natural language explanation..."
# - reasoningFactors: [{ factor, value, weight, explanation }]
```

### 3. Get Analytics

```bash
curl -X GET "http://localhost:3001/api/analytics?period=30d" \
  -H "Authorization: Bearer $TOKEN"

# Response includes:
# - overall: { winRate, avgConfidence, estimatedROI }
# - marketAccuracy: [{ market, accuracy, volume, roi }]
# - confidenceDistribution: { veryHigh, high, medium, low }
```

### 4. Check Background Jobs

```bash
curl -X GET "http://localhost:3001/api/jobs" \
  -H "Authorization: Bearer $TOKEN"

# Response includes:
# - registeredJobs: ["sync-match-results", "update-league-reliability", ...]
# - recentHistory: [{ jobName, status, message, duration, executedAt }]
```

### 5. Control Background Jobs

```bash
# Start all jobs
curl -X POST "http://localhost:3001/api/jobs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "action": "start" }'

# Stop all jobs
curl -X POST "http://localhost:3001/api/jobs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "action": "stop" }'
```

---

## Database & Caching Architecture

### PostgreSQL Tables

Key tables for the enhanced features:

```sql
-- Predictions with reasoning
SELECT id, fixture_id, reasoning, overall_confidence, created_at 
FROM Prediction 
WHERE overall_confidence > 70 
ORDER BY created_at DESC;

-- Analytics calculations
SELECT league_id, COUNT(*) as total_predictions,
  SUM(CASE WHEN status = 'WON' THEN 1 ELSE 0 END) as wins
FROM Prediction 
GROUP BY league_id;

-- League reliability
SELECT league_id, accuracy_percentage, prediction_count 
FROM LeagueReliability 
ORDER BY accuracy_percentage DESC;
```

### Redis Cache Keys

```
prediction:fixture:{fixtureId}        # Cached prediction (30 min TTL)
team:form:{teamId}                    # Team form data (1 hour TTL)
league:standings:{leagueId}           # League standings (2 hour TTL)
analytics:{period}                    # Analytics data (5 min TTL)
job:history                           # Job execution history (24 hour TTL)
calibration:results                   # Confidence calibration (7 day TTL)
```

---

## Security Configuration

### Environment Security

- Never commit `.env` files to Git
- Use `.env.local` for development
- Use `.env.production` for production with strong secrets
- Rotate `JWT_SECRET` every 90 days in production

### Authentication

- JWT tokens expire after 24 hours (configurable via `JWT_EXPIRY`)
- Passwords hashed with bcrypt (12 rounds)
- API rate limiting: 60 requests/minute per user

### API Security

- All endpoints require valid JWT token (except `/api/auth`)
- CORS configured for allowed domains
- SQL injection prevented with Prisma ORM parameterized queries
- XSS protection via Content Security Policy headers

---

## Scaling for Production

### Database Optimization

1. **Add Indexes**
```sql
CREATE INDEX idx_prediction_confidence ON Prediction(overall_confidence DESC);
CREATE INDEX idx_fixture_date ON Fixture(date DESC);
CREATE INDEX idx_league_reliability ON LeagueReliability(league_id);
```

2. **Connection Pooling**
```
DATABASE_URL="postgresql://...?schema=public&sslmode=require&pgbouncer=true"
```

3. **Read Replicas**
- Configure secondary PostgreSQL instance
- Use for analytics queries
- Keep writes on primary

### Caching Strategy

1. **Multi-tier Caching**
   - L1: Application-level (JavaScript objects)
   - L2: Redis (distributed cache)
   - L3: PostgreSQL (persistent storage)

2. **Cache Invalidation**
   - Predictions invalidated when fixture result updates
   - League data invalidated daily
   - Manual invalidation via Admin panel

### Load Balancing

```
┌──────────────┐
│   Nginx      │ (Load Balancer)
└──────────────┘
  ↓         ↓
┌─────────────────────────┐
│ Backend Instance 1 (3001)│
│ Backend Instance 2 (3001)│
│ Backend Instance N (3001)│
└─────────────────────────┘
  ↓
┌──────────────┐
│ PostgreSQL   │
│ (primary)    │
└──────────────┘
```

---

## Maintenance & Updates

### Regular Maintenance Tasks

```bash
# Daily
- Check background job execution logs
- Monitor cache hit rates
- Review failed predictions for patterns

# Weekly
- Run database optimization
- Review API usage logs
- Update prediction weights if needed

# Monthly
- Analyze prediction accuracy
- Review and update league blacklist
- Backup production database
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name add_new_feature

# Deploy migration to production
npx prisma migrate deploy

# Rollback to previous schema (caution!)
npx prisma migrate resolve --rolled-back migration_name
```

---

## Logs & Debugging

### Backend Logs

```bash
# Tail backend logs (Docker)
docker-compose logs -f backend

# View specific errors
docker-compose logs backend | grep "ERROR"

# Check job execution logs
docker-compose logs backend | grep "job-scheduler"
```

### Prediction Service Logs

```bash
# View prediction service logs
docker-compose logs -f prediction-service

# Check API call logs
docker-compose logs prediction-service | grep "API call"
```

### Frontend Logs

```bash
# Browser console (F12)
- Open browser developer tools
- Check Network tab for API calls
- Check Console for JavaScript errors
```

---

## Support & Documentation Links

- **Full Implementation**: `/IMPLEMENTATION_GUIDE.md`
- **Quick Start**: `/QUICK_START.md`
- **Deployment Plan**: `/v0_plans/bold-map.md`
- **API Documentation**: See API Endpoints section above

---

## Frequently Asked Questions

**Q: Why is my prediction confidence always low?**
A: Low confidence can be due to:
- Missing injury data
- Limited historical matches
- Unusual odds movement
- League-specific factors
Check Admin → Weights to adjust factor importance

**Q: Jobs not running on schedule?**
A: Check:
1. Redis is running (`redis-cli ping`)
2. Scheduler initialized on startup (`initializeScheduler()`)
3. Server logs for job errors
4. Cron expression in job-scheduler.ts

**Q: How to generate JWT_SECRET?**
```bash
openssl rand -base64 32
# Copy the output to JWT_SECRET in .env
```

**Q: Database migrations stuck?**
```bash
# Reset (careful - deletes all data!)
npx prisma migrate reset
# Then re-seed
npx prisma db seed
```

---

## License

MIT License - See LICENSE file for details.

## Support

For issues and feature requests, please open a GitHub issue or contact support.

## Prediction Engine Algorithm

The prediction engine uses a weighted ensemble approach:

1. **Data Collection**: Fetches fixtures, form, H2H, injuries, standings, odds
2. **Feature Engineering**: Calculates 12+ statistical features per team
3. **Weighted Scoring**: Applies configurable weights to each factor
4. **Probability Calculation**: Converts scores to market probabilities
5. **Value Detection**: Identifies value bets vs bookmaker odds
6. **ML Enhancement**: (Optional) Refines with trained models

### Weight Configuration

| Factor | Default Weight | Description |
|--------|---------------|-------------|
| Recent Form | 20% | Last 5 matches weighted by recency |
| H2H Record | 15% | Historical meetings between teams |
| Home/Away Form | 15% | Venue-specific performance |
| Goals Trend | 15% | Scoring/conceding patterns |
| Injuries | 10% | Key player availability |
| Odds Movement | 10% | Market confidence shifts |
| Standings | 10% | League position relative strength |
| Motivation | 5% | Contextual importance |

## Database Schema

See `backend/prisma/schema.prisma` for full schema.

Key entities:
- `User` - Authentication & roles
- `Fixture` - Match data from API-Football
- `Prediction` - AI-generated predictions with confidence scores
- `Odds` - Bookmaker odds from The Odds API
- `BetSlip` - User accumulator tracking
- `ApiUsage` - API quota monitoring

## Development

### Frontend
```bash
cd frontend
npm run dev        # Development server
npm run build      # Production build
npm run lint       # ESLint
```

### Backend
```bash
cd backend
npm run dev        # Development server
npm run db:migrate # Run migrations
npm run db:studio  # Prisma Studio
```

### Prediction Service
```bash
cd prediction-service
uvicorn app.main:app --reload --port 8001
pytest             # Run tests
```

## License

MIT License - See LICENSE file for details.

## Support

For issues and feature requests, please open a GitHub issue.
