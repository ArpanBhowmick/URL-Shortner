# Production & Scalability Guide

## Current State Assessment

| Component | Status | Score |
|-----------|--------|-------|
| Core Functionality | Works (with bugs) | 80% |
| Security | Minimal | 30% |
| Reliability | Basic | 50% |
| Scalability | None | 20% |
| Monitoring | None | 10% |
| Testing | None | 0% |
| DevOps | Minimal | 10% |

**Overall: ~30% Production Ready**

---

## Phase 1: Critical Fixes (Week 1)

### 1. Fix TTL Index
**File:** `BackEnd/Models/Url.js`

```javascript
// BEFORE (WRONG)
expireAt: {
  type: Date,
  default: null,
  expires: 0,  // ❌
}

// AFTER (CORRECT)
expireAt: {
  type: Date,
  default: null,
  index: { expires: 'expireAt' }  // ✓ MongoDB auto-deletes when time passes
}
```

### 2. Fix Dead Code in getOriginalUrl
**File:** `BackEnd/Controller/urlController.js`

```javascript
// BEFORE (BROKEN)
export const getOriginalUrl = async (req, res) => {
  const originalUrl = await Url.findOne({ shortCode });

  if (originalUrl) {
    if (!originalUrl) {  // Never true - dead code!
      return res.status(404).json({ message: "Invalid shortcode" });
    }
    // ...
  }
  // Missing: What if originalUrl is null? No response sent!
};

// AFTER (CORRECT)
export const getOriginalUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    if (url.expireAt && new Date() > url.expireAt) {
      return res.status(410).json({ message: "Link expired" });
    }

    return res.redirect(url.longUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
```

### 3. Fix NPM Script Path
**File:** `package.json`

```json
// BEFORE
"server": "cd backend && nodemon server.js"

// AFTER
"server": "cd BackEnd && nodemon server.js"
```

### 4. Add URL Validation
**File:** `BackEnd/Controller/urlController.js`

```javascript
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

export const shortUrl = async (req, res) => {
  let { longUrl, customSlug, expiryDays } = req.body;
  longUrl = longUrl?.trim();

  if (!longUrl) {
    return res.status(400).json({ message: "URL required" });
  }

  if (!isValidUrl(longUrl)) {
    return res.status(400).json({ message: "Invalid URL format. Must start with http:// or https://" });
  }

  // ... rest of code
};
```

### 5. Fix API Error Handling
**File:** `FrontEnd/.../services/api.js`

```javascript
export const shortenUrl = async (longUrl, customSlug, expiryDays) => {
  try {
    const res = await fetch(`${API_URL}/short`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ longUrl, customSlug, expiryDays }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to shorten URL");
    }

    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;  // Re-throw so caller can handle
  }
};
```

### 6. Add Loading States
**File:** `FrontEnd/.../MainCard.jsx`

```javascript
const MainCard = () => {
  const [loading, setLoading] = useState(false);
  // ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!longUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    setLoading(true);
    try {
      const data = await shortenUrl(longUrl, customSlug, expiryDays);
      setShortUrl(data.shortUrl);
      toast.success("URL shortened!");
      // ... update history
    } catch (err) {
      toast.error(err.message || "Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ...
    <button
      type="submit"
      disabled={loading}
      className={`... ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Shortening...' : 'Shorten'}
    </button>
  );
};
```

---

## Phase 2: Security Hardening (Week 2)

### 1. Add Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
// BackEnd/server.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { message: "Too many requests, please try again later" }
});

app.use('/short', limiter); // Apply to shorten endpoint
app.use('/api/', limiter);   // Apply to all API routes
```

### 2. Add Helmet.js
```bash
npm install helmet
```

```javascript
import helmet from 'helmet';
app.use(helmet()); // Adds security headers
```

### 3. Add Request Size Limits
```javascript
app.use(express.json({ limit: '10kb' })); // Max 10KB for JSON body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

### 4. Add Input Sanitization
```bash
npm install express-validator
```

```javascript
import { body, validationResult } from 'express-validator';

const shortenValidation = [
  body('longUrl')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Must be a valid HTTP/HTTPS URL'),
  body('customSlug')
    .optional()
    .isAlphanumeric()
    .isLength({ min: 3, max: 20 })
    .withMessage('Slug must be 3-20 alphanumeric characters'),
  body('expiryDays')
    .optional()
    .isInt({ min: 0, max: 365 })
    .withMessage('Expiry days must be 0-365'),
];

app.post('/short', shortenValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ... controller logic
});
```

### 5. Add Authentication (JWT)
```bash
npm install jsonwebtoken bcryptjs
```

```javascript
// Simple example - see full implementation guide below
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

app.post('/short', authMiddleware, shortUrl);
```

---

## Phase 3: Reliability (Week 2-3)

### 1. Add Health Check Endpoint
```javascript
app.get('/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message
    });
  }
});
```

### 2. Add Graceful Shutdown
```javascript
const gracefulShutdown = () => {
  console.log('Received shutdown signal');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Server shut down');
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

### 3. Add Request Timeout
```javascript
const requestTimeout = (req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).json({ message: "Request timeout" });
  });
  next();
};
app.use(requestTimeout);
```

### 4. Add Retry Logic
```javascript
import retry from 'async-retry';

const fetchWithRetry = async (fn, options = { retries: 3 }) => {
  return retry(fn, {
    retries: options.retries,
    onRetry: (err) => console.log(`Retrying... ${err.message}`),
    factor: 2,
    minTimeout: 1000
  });
};
```

---

## Phase 4: Caching & Performance (Week 3-4)

### 1. Add Redis Caching
```bash
npm install redis ioredis
```

```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache URL lookups
export const getOriginalUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Check cache first
    const cached = await redis.get(`url:${shortCode}`);
    if (cached) {
      return res.redirect(cached);
    }

    // DB lookup
    const url = await Url.findOne({ shortCode });
    if (!url) return res.status(404).json({ message: "URL not found" });
    if (url.expireAt && new Date() > url.expireAt) {
      return res.status(410).json({ message: "Link expired" });
    }

    // Cache result
    await redis.setex(`url:${shortCode}`, 3600, url.longUrl); // 1 hour TTL

    res.redirect(url.longUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
```

### 2. Add Database Indexes
```javascript
const urlSchema = new mongoose.Schema({
  longUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  expireAt: { type: Date, default: null, index: { expires: 'expireAt' } },
  clicks: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }
});

// Compound index for common queries
urlSchema.index({ createdAt: -1, createdBy: 1 });
```

### 3. Add Click Tracking
```javascript
export const getOriginalUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOneAndUpdate(
      { shortCode },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!url) return res.status(404).json({ message: "URL not found" });
    if (url.expireAt && new Date() > url.expireAt) {
      return res.status(410).json({ message: "Link expired" });
    }

    res.redirect(url.longUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
```

---

## Phase 5: Monitoring & Logging (Week 4)

### 1. Add Structured Logging
```bash
npm install winston morgan
```

```javascript
import winston from 'winston';
import morgan from 'morgan';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File('error.log', { level: 'error' }),
    new winston.transports.File('combined.log'),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

export default logger;
```

### 2. Add Error Tracking (Sentry)
```bash
npm install @sentry/node
```

```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());

app.use((err, req, res, next) => {
  Sentry.captureException(err);
  res.status(500).json({ message: "Internal server error" });
});
```

---

## Phase 6: DevOps & Deployment (Week 4-5)

### 1. Add Docker
```dockerfile
# BackEnd/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./BackEnd
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URL=${MONGO_URL}
      - REDIS_URL=${REDIS_URL}
    restart: unless-stopped
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:
```

### 2. Add GitHub Actions CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Tests
        run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Server
        run: |
          # Add deployment commands
```

---

## Phase 7: Testing (Week 5)

### 1. Add Unit Tests (Jest)
```bash
npm install --save-dev jest supertest
```

```javascript
// BackEnd/tests/url.test.js
import request from 'supertest';
import { app } from '../server.js';

describe('URL Shortener API', () => {
  it('should create a short URL', async () => {
    const res = await request(app)
      .post('/short')
      .send({ longUrl: 'https://example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('shortUrl');
  });

  it('should return 400 for invalid URL', async () => {
    const res = await request(app)
      .post('/short')
      .send({ longUrl: 'not-a-url' });

    expect(res.status).toBe(400);
  });

  it('should redirect to original URL', async () => {
    const createRes = await request(app)
      .post('/short')
      .send({ longUrl: 'https://example.com' });

    const shortCode = createRes.body.shortUrl.split('/').pop();

    const redirectRes = await request(app)
      .get(`/${shortCode}`);

    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers.location).toBe('https://example.com');
  });
});
```

---

## Production Checklist

### Pre-Launch
- [ ] Fix all CRITICAL bugs (TTL, dead code, path)
- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Add structured logging
- [ ] Add health check endpoint
- [ ] Set up monitoring (Sentry, logs)
- [ ] Configure environment variables
- [ ] Set up SSL/TLS
- [ ] Configure CORS properly
- [ ] Add request size limits

### Post-Launch
- [ ] Set up uptime monitoring
- [ ] Configure alerts
- [ ] Set up backups
- [ ] Load testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] CDN setup
- [ ] Read replicas

### Ongoing
- [ ] Regular dependency updates
- [ ] Security patches
- [ ] Performance monitoring
- [ ] User feedback loop
- [ ] Feature improvements

---

## Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| Phase 1 | Critical Fixes | 1 week |
| Phase 2 | Security | 1 week |
| Phase 3 | Reliability | 1-2 weeks |
| Phase 4 | Caching | 1-2 weeks |
| Phase 5 | Monitoring | 1 week |
| Phase 6 | DevOps | 1-2 weeks |
| Phase 7 | Testing | 1 week |

**Total: 6-9 weeks to production-ready**
