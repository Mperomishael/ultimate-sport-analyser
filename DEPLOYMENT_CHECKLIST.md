# Deployment Checklist & Getting Started Guide

## Pre-Deployment Checklist

### Environment & Infrastructure Setup

- [ ] Node.js 20+ installed (`node --version`)
- [ ] Python 3.11+ installed (`python3 --version`)
- [ ] PostgreSQL 15+ installed and running
- [ ] Redis 7+ installed and running
- [ ] Git installed and configured (`git --version`)
- [ ] Docker & Docker Compose installed (if using containerized deployment)

### API Keys Obtained

- [ ] **API-Football Key** from https://www.api-football.com/
  - Sign up → Dashboard → Copy API Key
  - Free tier: 100 requests/day
  - Save as: `API_FOOTBALL_KEY`

- [ ] **The Odds API Key** from https://the-odds-api.com/
  - Sign up → Dashboard → Copy API Key
  - Free tier: 500 requests/month
  - Save as: `THE_ODDS_API_KEY`

- [ ] **JWT Secret** generated
  - Run: `openssl rand -base64 32`
  - Save as: `JWT_SECRET`

### Database Preparation

- [ ] PostgreSQL database created
  ```bash
  createdb analyzer_db
  ```

- [ ] Redis instance running
  ```bash
  redis-cli ping  # Should return PONG
  ```

- [ ] Database connection verified
  ```bash
  psql -h localhost -U analyzer -d analyzer_db
  ```

---

## Phase 1: Local Development Deployment

### Step 1: Clone & Setup

- [ ] Repository cloned
  ```bash
  git clone <repo-url>
  cd analyzer-prototype
  ```

- [ ] Environment files created
  ```bash
  cp .env.example .env.local
  ```

- [ ] All API keys added to `.env.local`
  ```
  API_FOOTBALL_KEY=...
  THE_ODDS_API_KEY=...
  JWT_SECRET=...
  DATABASE_URL=...
  REDIS_URL=...
  ```

### Step 2: Backend Deployment

- [ ] Backend dependencies installed
  ```bash
  cd backend
  npm install
  ```

- [ ] Prisma client generated
  ```bash
  npx prisma generate
  ```

- [ ] Database migrations run
  ```bash
  npx prisma migrate dev --name init
  ```

- [ ] Database seeded (optional)
  ```bash
  npx prisma db seed
  ```

- [ ] Backend server started
  ```bash
  npm run dev
  ```

- [ ] Backend health check passed
  ```bash
  curl http://localhost:3001/api/health
  # Response: { "status": "ok" }
  ```

### Step 3: Prediction Service Deployment

- [ ] Python virtual environment created
  ```bash
  cd prediction-service
  python3 -m venv venv
  source venv/bin/activate
  ```

- [ ] Python dependencies installed
  ```bash
  pip install -r requirements.txt
  ```

- [ ] Prediction service started
  ```bash
  uvicorn app.main:app --reload --port 8000
  ```

- [ ] Prediction service health check passed
  ```bash
  curl http://localhost:8000/api/health
  # Response: { "status": "healthy" }
  ```

### Step 4: Frontend Deployment

- [ ] Frontend dependencies installed
  ```bash
  cd frontend
  npm install
  ```

- [ ] Frontend development server started
  ```bash
  npm run dev
  ```

- [ ] Frontend loads in browser
  ```
  Open: http://localhost:3000
  Should show: Login page or dashboard
  ```

### Step 5: Integration Testing

- [ ] User can register
  ```bash
  curl -X POST http://localhost:3001/api/auth \
    -H "Content-Type: application/json" \
    -d '{"action":"register","email":"test@example.com","password":"Pass123!"}'
  ```

- [ ] User can login
  ```bash
  curl -X POST http://localhost:3001/api/auth \
    -H "Content-Type: application/json" \
    -d '{"action":"login","email":"test@example.com","password":"Pass123!"}'
  # Save TOKEN from response
  ```

- [ ] Fixtures API works
  ```bash
  curl -X GET "http://localhost:3001/api/fixtures?date=2026-05-29" \
    -H "Authorization: Bearer $TOKEN"
  # Should return array of fixtures
  ```

- [ ] Predictions API works (with reasoning)
  ```bash
  curl -X GET "http://localhost:3001/api/predictions?includeReasoning=true" \
    -H "Authorization: Bearer $TOKEN"
  # Should return predictions with reasoning
  ```

- [ ] Analytics API works
  ```bash
  curl -X GET "http://localhost:3001/api/analytics?period=30d" \
    -H "Authorization: Bearer $TOKEN"
  # Should return analytics data
  ```

- [ ] Jobs API works
  ```bash
  curl -X GET "http://localhost:3001/api/jobs" \
    -H "Authorization: Bearer $TOKEN"
  # Should return job status
  ```

### Step 6: Admin Panel Verification

- [ ] Login to http://localhost:3000
- [ ] Navigate to Admin Panel
- [ ] Analytics Tab loads with data
  - [ ] View win rate, ROI, confidence
  - [ ] Switch between 7d, 30d, 90d periods
  - [ ] See market accuracy table
  - [ ] View confidence distribution
- [ ] Background Jobs Tab shows
  - [ ] 4 registered jobs listed
  - [ ] Job schedules displayed
  - [ ] Recent execution history shown
  - [ ] Start/Stop buttons functional

---

## Phase 2: Production Deployment (Docker)

### Step 1: Prepare Production Environment

- [ ] Create `.env.production`
  ```bash
  cp .env.example .env.production
  ```

- [ ] Set all production values in `.env.production`
  ```
  NODE_ENV=production
  DATABASE_URL=postgresql://analyzer:STRONG_PASSWORD@db.example.com/analyzer_db
  REDIS_URL=redis://STRONG_PASSWORD@redis.example.com:6379/0
  API_FOOTBALL_KEY=your_key
  THE_ODDS_API_KEY=your_key
  JWT_SECRET=your_generated_secret
  NEXT_PUBLIC_API_BASE=https://api.yourdomain.com
  NEXT_PUBLIC_APP_URL=https://yourdomain.com
  ```

- [ ] Verify no sensitive data in git
  ```bash
  git status  # .env files should not appear
  ```

### Step 2: Docker Images Built

- [ ] Docker Compose file created: `docker-compose.yml`
- [ ] All Dockerfiles created:
  - [ ] `backend/Dockerfile`
  - [ ] `prediction-service/Dockerfile`
  - [ ] `frontend/Dockerfile`

- [ ] Images built successfully
  ```bash
  docker-compose --env-file .env.production build
  # Should complete with no errors
  ```

### Step 3: Docker Services Started

- [ ] All services start successfully
  ```bash
  docker-compose --env-file .env.production up -d
  # Should show: Creating ... done
  ```

- [ ] All containers are running
  ```bash
  docker-compose ps
  # All should show "Up"
  ```

- [ ] Database migrations run
  ```bash
  docker-compose exec backend npx prisma migrate deploy
  ```

- [ ] Services are healthy
  ```bash
  curl http://localhost:3001/api/health
  curl http://localhost:8000/api/health
  curl http://localhost:3000/
  ```

### Step 4: Production Testing

- [ ] Create production user account
  ```bash
  curl -X POST https://api.yourdomain.com/api/auth \
    -H "Content-Type: application/json" \
    -d '{"action":"register","email":"admin@yourdomain.com","password":"StrongPass!"}'
  ```

- [ ] Login works
- [ ] Predictions generate correctly
- [ ] Analytics display real data
- [ ] Background jobs execute on schedule

---

## Phase 3: Deployment to Production Servers

### Hosting Options

Choose one of:
- [ ] **Heroku** (recommended for small deployments)
- [ ] **AWS EC2** (recommended for scalable deployments)
- [ ] **DigitalOcean** (balance of price and features)
- [ ] **Vercel** (frontend) + custom backend

### AWS EC2 Deployment Example

- [ ] EC2 instance created (Ubuntu 20.04 LTS recommended)
  - Instance type: t3.medium or larger
  - Storage: 100GB+ SSD
  - Security group: Allow ports 80, 443, 5432

- [ ] SSH key pair created and secured
  ```bash
  chmod 400 your-key.pem
  ```

- [ ] Connected to instance
  ```bash
  ssh -i your-key.pem ubuntu@your-instance-ip
  ```

- [ ] Dependencies installed on server
  ```bash
  sudo apt update && sudo apt upgrade -y
  sudo apt install -y nodejs npm python3 python3-pip postgresql redis-server docker.io docker-compose git
  ```

- [ ] Repository cloned
  ```bash
  git clone your-repo-url
  cd analyzer-prototype
  ```

- [ ] Environment configured
  ```bash
  nano .env.production  # Add all production values
  ```

- [ ] Application deployed
  ```bash
  docker-compose --env-file .env.production up -d
  ```

### SSL/HTTPS Setup

- [ ] Domain name configured (DNS A record pointing to server IP)
- [ ] SSL certificate obtained (Let's Encrypt recommended)
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot certonly --standalone -d yourdomain.com
  ```

- [ ] Nginx configured as reverse proxy
  ```bash
  sudo nano /etc/nginx/sites-available/default
  # Forward requests to localhost:3000 (frontend)
  # Forward requests to localhost:3001 (backend)
  ```

- [ ] HTTPS enforced (redirect HTTP to HTTPS)

### Monitoring Setup

- [ ] CloudWatch/monitoring enabled for:
  - [ ] CPU usage
  - [ ] Memory usage
  - [ ] Disk space
  - [ ] Error rates

- [ ] Log aggregation configured
  - [ ] Backend logs collected
  - [ ] Prediction service logs collected
  - [ ] System logs collected

- [ ] Alerts configured for:
  - [ ] High CPU (>80%)
  - [ ] Low memory (<1GB free)
  - [ ] API errors (>1% error rate)
  - [ ] Job failures

---

## Phase 4: Post-Deployment Verification

### Performance Checks

- [ ] Response time < 500ms for predictions
  ```bash
  time curl -H "Authorization: Bearer $TOKEN" \
    "http://localhost:3001/api/predictions"
  ```

- [ ] Analytics queries complete < 2s
- [ ] Database queries optimized
- [ ] Redis caching working
  ```bash
  redis-cli INFO stats
  # Check: hits and misses
  ```

### Security Verification

- [ ] HTTPS certificate valid
  ```bash
  curl -I https://yourdomain.com
  # Should show 200 OK and valid certificate
  ```

- [ ] Security headers present
  ```bash
  curl -I https://yourdomain.com | grep -i "security\|x-frame\|csp"
  ```

- [ ] No sensitive data in logs
  ```bash
  docker-compose logs | grep -i "password\|token\|key"
  # Should return nothing
  ```

- [ ] API authentication required
  ```bash
  curl http://localhost:3001/api/predictions
  # Should return 401 Unauthorized
  ```

### Data Integrity

- [ ] Database backups configured
  ```bash
  pg_dump analyzer_db > backup.sql
  ```

- [ ] Backup restoration tested
  ```bash
  psql analyzer_db < backup.sql
  ```

- [ ] All tables have correct data
  ```bash
  psql -c "SELECT COUNT(*) FROM Prediction;"
  psql -c "SELECT COUNT(*) FROM Fixture;"
  psql -c "SELECT COUNT(*) FROM \"User\";"
  ```

---

## Phase 5: Monitoring & Maintenance

### Daily Tasks

- [ ] Check application logs for errors
- [ ] Verify all background jobs completed
- [ ] Monitor prediction accuracy
- [ ] Check API health endpoints

### Weekly Tasks

- [ ] Review performance metrics
- [ ] Check database size
- [ ] Analyze failed predictions
- [ ] Update prediction weights if needed

### Monthly Tasks

- [ ] Backup production database
- [ ] Review security logs
- [ ] Performance optimization
- [ ] Update dependencies
- [ ] Database optimization

### Commands for Monitoring

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend

# Database query count
psql -c "SELECT COUNT(*) FROM Prediction WHERE created_at > CURRENT_DATE;"

# Cache hit rate
redis-cli INFO stats | grep "hits"

# Job execution status
curl -H "Authorization: Bearer $TOKEN" \
  https://yourdomain.com/api/jobs
```

---

## First Time User Guide

### Getting Started (5 minutes)

1. **Visit the application**
   - Open https://yourdomain.com in browser
   - Create account or login

2. **View Dashboard**
   - See upcoming fixtures
   - View AI predictions
   - See confidence scores

3. **View Predictions with Reasoning**
   - Click any fixture to see details
   - View detailed reasoning analysis
   - See factors influencing the prediction

4. **Access Admin Panel**
   - Click Admin in navigation
   - View predictions analytics
   - Monitor background jobs

### Key Features to Try

#### Feature 1: Predictions with Reasoning
```
Dashboard → Any match fixture → Click to expand
- See AI prediction
- Read detailed reasoning
- View factor breakdown
- Check confidence level
```

#### Feature 2: Analytics Dashboard
```
Admin Panel → Analytics Tab
- Select time period (7d, 30d, 90d)
- View win rate and ROI
- See market accuracy by betting type
- Check confidence distribution
```

#### Feature 3: Background Jobs
```
Admin Panel → Background Jobs Tab
- View 4 automated jobs running:
  - Sync match results (every 30 min)
  - Update league reliability (daily 2 AM)
  - Calibrate confidence (weekly Mon 3 AM)
  - Cleanup cache (hourly)
- Start/Stop all jobs
- View recent execution history
```

#### Feature 4: Adjust Algorithm
```
Admin Panel → Prediction Weights Tab
- Adjust factor weights:
  - Home Form (20%)
  - H2H Record (15%)
  - Home/Away Form (15%)
  - Goals Trend (15%)
  - Injuries (10%)
  - Odds Movement (10%)
  - Standings (10%)
  - Motivation (5%)
- Save changes
- View impact on predictions
```

---

## Troubleshooting Common Issues

### Issue: "Database connection refused"

**Solution:**
```bash
# Check PostgreSQL is running
psql -h localhost -U analyzer -d analyzer_db

# If error, start PostgreSQL
sudo service postgresql start

# Or if using Docker
docker-compose up -d postgres
```

### Issue: "Redis connection refused"

**Solution:**
```bash
# Check Redis is running
redis-cli ping

# If error, start Redis
redis-server

# Or if using Docker
docker-compose up -d redis
```

### Issue: "API keys not working"

**Solution:**
```bash
# Verify keys are set
echo $API_FOOTBALL_KEY
echo $THE_ODDS_API_KEY

# Test API directly
curl "https://v3.football.api-sports.io/fixtures?date=2026-05-29" \
  -H "x-apisports-key: $API_FOOTBALL_KEY"

# Check if keys have quota remaining
```

### Issue: "Background jobs not running"

**Solution:**
```bash
# Check scheduler initialized
grep -r "initializeScheduler" backend/src/

# View job logs
docker-compose logs backend | grep -i "job"

# Check Redis
redis-cli KEYS "job:*"

# Restart services
docker-compose restart backend
```

### Issue: "Predictions not generating"

**Solution:**
```bash
# Check prediction service health
curl http://localhost:8000/api/health

# Check logs
docker-compose logs prediction-service

# Verify fixtures exist
psql -c "SELECT COUNT(*) FROM Fixture WHERE status = 'NS';"

# Check prediction service config
docker-compose exec prediction-service cat app/config.py
```

### Issue: "Authentication failing"

**Solution:**
```bash
# Check JWT secret is set
echo $JWT_SECRET

# Test auth endpoint
curl -X POST http://localhost:3001/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"register","email":"test@test.com","password":"Pass123!"}'

# Check database for user
psql -c "SELECT email FROM \"User\" LIMIT 5;"
```

---

## Support & Resources

- **Full README**: `/README.md` - Complete documentation
- **Implementation Guide**: `/IMPLEMENTATION_GUIDE.md` - Technical details
- **Quick Start**: `/QUICK_START.md` - Feature overview
- **Deployment Plan**: `/v0_plans/bold-map.md` - Original planning

## Success Indicators

Your deployment is successful when:

✅ All services running and healthy
✅ Users can login and access dashboard
✅ Predictions generate with reasoning
✅ Analytics dashboard displays real data
✅ Background jobs execute on schedule
✅ All API endpoints responding correctly
✅ Database backups configured
✅ HTTPS enabled and working
✅ Monitoring and alerts active
✅ No sensitive data in logs

Congratulations! Your analyzer-prototype is now live and production-ready.
