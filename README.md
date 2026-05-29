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
- **Data APIs**: API-Football, The Odds API
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

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- API-Football key (https://www.api-football.com/)
- The Odds API key (https://the-odds-api.com/)

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
nano .env
```

### 2. Docker Deployment (Recommended)

```bash
# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend npx prisma migrate dev

# Seed database
docker-compose exec backend npx prisma db seed
```

### 3. Manual Development Setup

```bash
# Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
cd ../prediction-service && pip install -r requirements.txt

# Setup database
cd backend
npx prisma migrate dev
npx prisma generate

# Start services (in separate terminals)
npm run dev:frontend    # Port 3000
npm run dev:backend     # Port 3001
npm run dev:prediction  # Port 8001
```

### 4. API Configuration

Add your API keys to `.env`:

```env
API_FOOTBALL_KEY=your_api_football_key
THE_ODDS_API_KEY=your_odds_api_key
```

## API Endpoints

### Authentication
- `POST /api/auth?action=register` - User registration
- `POST /api/auth?action=login` - User login

### Fixtures
- `GET /api/fixtures?date=2026-05-29` - Get fixtures by date
- `GET /api/fixtures?id=12345` - Get fixture details
- `GET /api/fixtures?live=true` - Get live fixtures

### Predictions
- `GET /api/predictions?date=2026-05-29` - Get predictions
- `POST /api/predictions` - Generate prediction

### Odds
- `GET /api/odds?leagueId=39` - Get odds by league
- `GET /api/odds?eventId=abc123` - Get event odds

### Prediction Service (FastAPI)
- `POST /api/predict` - Generate match prediction
- `POST /api/accumulator` - Generate accumulator
- `GET /api/health` - Health check

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
