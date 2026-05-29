# API Keys Setup Guide

Complete instructions for obtaining and configuring all required API keys for the analyzer-prototype.

## Overview

The analyzer-prototype requires **3 main API keys** plus internal secrets:

| Key | Service | Purpose | Free Tier | Setup Time |
|-----|---------|---------|-----------|------------|
| API-Football | api-football.com | Fixture & team data | 100 req/day | 5 minutes |
| The Odds API | the-odds-api.com | Live betting odds | 500 req/month | 5 minutes |
| JWT Secret | Generated | API authentication | Free (generate) | 1 minute |

Total setup time: **~15 minutes**

---

## 1. API-Football Key Setup

### Why You Need It
Provides access to:
- Live and upcoming fixtures
- Team information and statistics
- League standings and H2H records
- Historical match results
- Injuries and squad news

### Step-by-Step Setup

#### 1.1: Create Account

1. Visit https://www.api-football.com/
2. Click **"Sign In"** → **"Sign Up"**
3. Enter email address
4. Create password
5. Accept terms & conditions
6. Click **"Sign Up"**
7. Verify email (check inbox)

#### 1.2: Get Your API Key

1. Click your **profile icon** (top right) → **"Dashboard"**
2. Click **"API"** in left sidebar
3. You should see your **API Key**
4. Copy the key (you'll need it in 30 seconds)

```
Example API Key format:
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

#### 1.3: Test Your API Key

```bash
# Test the API key
curl "https://v3.football.api-sports.io/fixtures?date=2026-05-29" \
  -H "x-apisports-key: YOUR_API_FOOTBALL_KEY"

# You should see fixture data in JSON format
```

#### 1.4: Add to .env File

```bash
# Open .env.local or .env.development.local
nano .env.local

# Add this line:
API_FOOTBALL_KEY=your_copied_api_key_here

# Save (Ctrl+O, Enter, Ctrl+X)
```

### Free Tier Limits

- **100 requests per day**
- Sufficient for testing and small deployments
- For production, consider upgrading

### Upgrade Options

- **Pro Plan**: Unlimited requests ($9/month)
- **Enterprise**: Custom limits (contact sales)

### Common Issues

**Issue**: "Invalid API Key"
- Check key is copied correctly (no spaces)
- Verify it's not truncated
- Re-verify email address

**Issue**: "Rate limit exceeded"
- Free tier: 100 requests/day
- Upgrade to Pro or optimize API calls
- Enable caching to reduce calls

---

## 2. The Odds API Key Setup

### Why You Need It
Provides access to:
- Live odds from major bookmakers
- Historical odds data
- Odds comparison across sportsbooks
- Odds movement analysis
- Event-specific odds for different markets

### Step-by-Step Setup

#### 2.1: Create Account

1. Visit https://the-odds-api.com/
2. Click **"Get Free API Key"**
3. Click **"Sign Up"** (or login if you have account)
4. Enter email
5. Create password
6. Click **"Create Account"**
7. Verify email (check inbox)

#### 2.2: Get Your API Key

1. After email verification, you'll be redirected to **Dashboard**
2. Your **API Key** will be displayed on the dashboard
3. Click the key to **copy** it
4. Or click **"Reveal"** to view it

```
Example API Key format:
abc123def456ghi789jkl012mno345
```

#### 2.3: Test Your API Key

```bash
# Test the API key
curl "https://api.the-odds-api.com/v4/sports" \
  -H "Authorization: Bearer YOUR_THE_ODDS_API_KEY"

# You should see available sports/events
```

#### 2.4: Add to .env File

```bash
# Open .env.local or .env.development.local
nano .env.local

# Add this line:
THE_ODDS_API_KEY=your_copied_api_key_here

# Save (Ctrl+O, Enter, Ctrl+X)
```

### Free Tier Limits

- **500 requests per month** (~16 requests/day)
- Sufficient for development
- For production with daily odds updates, consider upgrading

### Upgrade Options

- **Starter**: $50/month (100k requests/month)
- **Professional**: $200/month (500k requests/month)
- **Enterprise**: Custom pricing

### Supported Sports

- ✅ Soccer
- ✅ American Football
- ✅ Basketball
- ✅ Baseball
- ✅ Ice Hockey
- ✅ Golf
- ✅ Tennis

### Odds Markets Available

- Match Result (1x2)
- Over/Under Goals
- Both Teams to Score
- Handicaps
- Correct Score
- And 50+ more markets

### Optimize API Usage

```python
# Reduce API calls by caching odds for 1 hour
CACHE_ODDS_TTL = 3600  # 1 hour

# Fetch only needed markets
MARKETS = [
    "h2h",           # Match result
    "spreads",       # Handicaps
    "totals"         # Over/Under
]

# Regional filtering to reduce data
REGIONS = [
    "uk",            # British bookmakers
    "eu",            # European bookmakers
]
```

---

## 3. JWT Secret Generation

### Why You Need It
- Secures all API authentication tokens
- Used to sign and verify JWT tokens
- Must be kept secret and never exposed

### How to Generate

#### Option A: Using OpenSSL (Recommended)

```bash
# Generate a secure random string
openssl rand -base64 32

# Output example:
# a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6Q7r8S9t0U1v2W3x4Y5z6

# Copy the entire output
```

#### Option B: Using Python

```bash
# Generate with Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Output example:
# 5-Z_pqR9x_hK_L8M9nOpQr0St1U2vW3xYzAbC4dEfGhI
```

#### Option C: Using Node.js

```bash
# Generate with Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Add to .env File

```bash
# Copy your generated secret
nano .env.local

# Paste this line (use your generated secret):
JWT_SECRET=a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6Q7r8S9t0U1v2W3x4Y5z6

# Set expiry (optional, in seconds)
JWT_EXPIRY=86400  # 24 hours (default)

# Save and exit
```

### Security Best Practices

**DO:**
✅ Generate a new secret for each environment (dev, staging, prod)
✅ Store secrets in environment files (not in code)
✅ Rotate secrets every 90 days in production
✅ Use long random strings (minimum 32 characters)
✅ Keep separate secrets for development and production

**DON'T:**
❌ Use the same secret everywhere
❌ Commit .env files to Git
❌ Share secrets via email or chat
❌ Use predictable patterns
❌ Reuse old secrets

---

## 4. Complete Environment Configuration

### Create Your .env.local File

```bash
# Create file
nano .env.local

# Paste and fill in your values:
```

```bash
# ============================================
# API KEYS (from above setup)
# ============================================
API_FOOTBALL_KEY=your_api_football_key_here
THE_ODDS_API_KEY=your_odds_api_key_here
JWT_SECRET=your_generated_secret_here

# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://analyzer:password@localhost:5432/analyzer_db"

# ============================================
# REDIS CACHE
# ============================================
REDIS_URL="redis://localhost:6379/0"
CACHE_TTL_SECONDS=300
CACHE_PREDICTION_TTL=1800

# ============================================
# AUTHENTICATION
# ============================================
JWT_EXPIRY=86400  # 24 hours

# ============================================
# PREDICTION SERVICE
# ============================================
PREDICTION_SERVICE_URL="http://localhost:8000"
PREDICTION_SERVICE_API_KEY="your-service-key"
PREDICTION_SERVICE_TIMEOUT=30000

# ============================================
# URLS
# ============================================
NEXT_PUBLIC_API_BASE="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ============================================
# ENVIRONMENT
# ============================================
NODE_ENV="development"
LOG_LEVEL="debug"
ENABLE_JOB_LOGGING="true"
```

### Verify Configuration

```bash
# Test database connection
echo $DATABASE_URL
psql -h localhost -U analyzer -d analyzer_db

# Test Redis connection
echo $REDIS_URL
redis-cli ping  # Should return: PONG

# Test API Football
curl "https://v3.football.api-sports.io/fixtures?date=2026-05-29" \
  -H "x-apisports-key: $API_FOOTBALL_KEY" | head -20

# Test The Odds API
curl "https://api.the-odds-api.com/v4/sports" \
  -H "Authorization: Bearer $THE_ODDS_API_KEY" | head -20
```

---

## 5. Production Configuration

For production deployment, use a secrets manager instead of `.env` files:

### Option A: Environment Variables

```bash
# On your hosting platform (Vercel, AWS, etc.)
# Set these environment variables:

API_FOOTBALL_KEY = ...
THE_ODDS_API_KEY = ...
JWT_SECRET = ...
DATABASE_URL = ...
REDIS_URL = ...
# etc.
```

### Option B: AWS Secrets Manager

```bash
# Store secrets in AWS
aws secretsmanager create-secret \
  --name analyzer-prototype \
  --secret-string '{
    "API_FOOTBALL_KEY": "...",
    "THE_ODDS_API_KEY": "...",
    "JWT_SECRET": "...",
    ...
  }'
```

### Option C: HashiCorp Vault

```bash
# Store in Vault
vault kv put secret/analyzer-prototype \
  API_FOOTBALL_KEY=... \
  THE_ODDS_API_KEY=... \
  JWT_SECRET=... \
  ...
```

### Production Checklist

- [ ] No .env files in production
- [ ] Secrets manager configured
- [ ] Separate keys for each environment
- [ ] Keys rotated regularly
- [ ] Access logs monitored
- [ ] Backup recovery plan tested

---

## 6. API Key Rotation

### When to Rotate

- Every 90 days (security best practice)
- Immediately if compromised
- Before leaving a job
- After security incident
- Before major deployment

### How to Rotate API-Football Key

1. Visit https://www.api-football.com/dashboard
2. Click "API" in sidebar
3. Click "Regenerate Key"
4. Copy new key
5. Update in all `.env` files
6. Update in secrets manager
7. Restart all services
8. Verify with test call

### How to Rotate The Odds API Key

1. Visit https://the-odds-api.com/dashboard
2. Click "API Settings"
3. Click "Generate New Key"
4. Copy new key
5. Update in all `.env` files
6. Update in secrets manager
7. Restart all services
8. Verify with test call

### How to Rotate JWT Secret

1. Generate new secret: `openssl rand -base64 32`
2. Update `JWT_SECRET` in `.env`
3. Restart backend server
4. All previous tokens will be invalidated (users must login again)
5. This is expected - users will need to re-authenticate

### Key Rotation Checklist

- [ ] Generate new keys
- [ ] Update all `.env` files
- [ ] Update secrets manager
- [ ] Restart services
- [ ] Test all APIs working
- [ ] Verify authentication
- [ ] Monitor logs for errors
- [ ] Document rotation date

---

## 7. Troubleshooting API Keys

### Problem: "401 Unauthorized" Error

**API-Football:**
```
Error: Invalid API key or API key not found
```
✓ Solution:
- Copy exact key (no spaces)
- Verify key is still valid
- Check key hasn't been regenerated
- Confirm request format: `-H "x-apisports-key: YOUR_KEY"`

**The Odds API:**
```
Error: Invalid token provided
```
✓ Solution:
- Copy exact key (no spaces)
- Verify key format: `-H "Authorization: Bearer YOUR_KEY"`
- Check key hasn't been regenerated
- Ensure Bearer prefix is used

### Problem: "Rate Limit Exceeded" Error

**Free Tier Limited:**
```
Error: too many requests (rate limit)
```
✓ Solutions:
- Enable caching to reduce API calls
- Upgrade to paid plan
- Schedule requests during off-peak hours
- Batch multiple requests when possible

### Problem: "404 Not Found" Error

✓ Solutions:
- Verify endpoint URL is correct
- Check date format is correct (YYYY-MM-DD)
- Verify league/sport IDs are valid
- Check API documentation for parameters

### Problem: "No Data Returned" Error

✓ Solutions:
- Verify date is valid (future fixtures only)
- Check league/sport is available
- Ensure authentication is correct
- Try with a different date/league

### Common Test Commands

```bash
# Test API-Football
curl -I "https://v3.football.api-sports.io/fixtures?date=2026-05-29" \
  -H "x-apisports-key: $API_FOOTBALL_KEY"

# Test The Odds API
curl -I "https://api.the-odds-api.com/v4/sports" \
  -H "Authorization: Bearer $THE_ODDS_API_KEY"

# Check response time
time curl "https://v3.football.api-sports.io/fixtures?date=2026-05-29" \
  -H "x-apisports-key: $API_FOOTBALL_KEY" > /dev/null 2>&1

# View response headers
curl -v "https://v3.football.api-sports.io/fixtures?date=2026-05-29" \
  -H "x-apisports-key: $API_FOOTBALL_KEY" 2>&1 | head -20
```

---

## 8. Monitoring API Usage

### Check API-Football Usage

```bash
# Login to dashboard
# Navigate to https://www.api-football.com/dashboard
# Under "API Usage", you'll see:
- Requests used today
- Requests remaining
- Daily limit
- Historical usage chart
```

### Check The Odds API Usage

```bash
# Login to dashboard
# Navigate to https://the-odds-api.com/dashboard
# Under "API Usage", you'll see:
- Requests used this month
- Requests remaining
- Monthly limit
- Usage by endpoint
```

### Optimize Usage

```javascript
// Example: Reduce API calls with caching

const cache = {};
const CACHE_TTL = 3600; // 1 hour

async function getFixtures(date) {
  // Check if we have cached data
  if (cache[date] && Date.now() - cache[date].time < CACHE_TTL * 1000) {
    return cache[date].data;
  }

  // Fetch from API if not cached
  const response = await fetch(
    `https://v3.football.api-sports.io/fixtures?date=${date}`,
    { headers: { 'x-apisports-key': API_FOOTBALL_KEY } }
  );
  
  const data = await response.json();
  
  // Cache the result
  cache[date] = {
    data: data,
    time: Date.now()
  };
  
  return data;
}
```

---

## Support

Having issues with API keys?

**API-Football Support:**
- Email: support@api-football.com
- Documentation: https://www.api-football.com/documentation
- Status: https://status.api-football.com

**The Odds API Support:**
- Email: support@the-odds-api.com
- Documentation: https://the-odds-api.com/liveapi/guides/v4
- Status: https://status.the-odds-api.com

**Analyzer-Prototype Support:**
- Check `/README.md` for full documentation
- See `/QUICK_START.md` for quick overview
- Review `/IMPLEMENTATION_GUIDE.md` for technical details

---

## Security Reminders

🔒 **CRITICAL: Never commit API keys to Git**

```bash
# Bad: Keys in git history (permanent)
API_FOOTBALL_KEY=abc123  # ❌ NEVER DO THIS

# Good: Keys in .env (ignored by git)
# In .env.local:
API_FOOTBALL_KEY=abc123  # ✅ OK (gitignore protects it)
```

Verify `.gitignore` contains:
```
.env
.env.local
.env.*.local
```

If you accidentally committed keys:

```bash
# 1. Regenerate the key immediately
# 2. Remove from git history
git rm --cached .env
git commit -m "Remove .env file"

# 3. Rewrite history (if critical)
git filter-branch --tree-filter 'rm -f .env' HEAD
```

Congratulations! You now have all API keys configured and are ready to deploy the analyzer-prototype.
