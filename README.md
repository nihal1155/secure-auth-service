# SecureAuth - Authentication Microservice

A production-ready authentication microservice built with TypeScript, Express, PostgreSQL, and Redis. Provides JWT-based authentication with OAuth 2.0 support, rate limiting, and token refresh capabilities.

🔗 **Live API:** [https://secure-auth-service-production.up.railway.app](https://secure-auth-service-production.up.railway.app)

## Features

- ✅ **Email/Password Authentication** - Secure registration and login with bcrypt password hashing
- ✅ **OAuth 2.0 Integration** - Google login support via Passport.js
- ✅ **JWT Token Management** - Access tokens (15 min) + Refresh tokens (7 days) with rotation
- ✅ **Rate Limiting** - Prevent brute force attacks (5 login attempts/min)
- ✅ **Protected Routes** - Middleware for authenticating API requests
- ✅ **Input Validation** - Joi schemas for request validation
- ✅ **Database Indexing** - Optimized PostgreSQL queries
- ✅ **Dockerized** - Easy local development with Docker Compose
- ✅ **Production Ready** - Deployed on Railway with proper error handling

## Tech Stack

**Backend:**
- TypeScript
- Node.js + Express.js
- PostgreSQL (user data)
- Redis (rate limiting)
- Passport.js (OAuth)
- JWT (jsonwebtoken)
- Bcrypt (password hashing)
- Joi (validation)

**DevOps:**
- Docker + Docker Compose
- Railway (deployment)
- GitHub Actions (CI/CD)

## Architecture

```
┌─────────────┐
│   Client    │
│ (React/App) │
└──────┬──────┘
       │
       ↓ HTTP Requests
┌─────────────────────────────┐
│   Express.js API Server     │
│  ┌─────────────────────┐   │
│  │  Rate Limiter       │   │
│  │  (express-rate-limit)│  │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │  Auth Routes        │   │
│  │  /register /login   │   │
│  │  /refresh /logout   │   │
│  │  /google /me        │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │  Auth Middleware    │   │
│  │  (JWT Verification) │   │
│  └─────────────────────┘   │
└──────────┬──────────────────┘
           │
    ┌──────┴──────┐
    ↓             ↓
┌──────────┐  ┌────────┐
│PostgreSQL│  │ Redis  │
│  (Users, │  │ (Rate  │
│  Tokens) │  │ Limit) │
└──────────┘  └────────┘
```

## API Endpoints

### Public Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-02-10T..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { "id": "...", "email": "...", "name": "..." },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbG..."
}
```

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

#### Google OAuth
```http
GET /api/auth/google
```
Redirects to Google login, then back to `/api/auth/google/callback` with tokens.

#### Logout
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbG..."
}
```

### Protected Endpoints

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "provider": "local",
    "createdAt": "2026-02-10T..."
  }
}
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/nihal1155/secure-auth-service.git
cd secure-auth-service
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/secureauth
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-change-this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CALLBACK_URL=http://localhost:3000/api/auth
```

4. **Start PostgreSQL and Redis with Docker**
```bash
docker-compose up -d
```

5. **Run the development server**
```bash
npm run dev
```

Server runs at: `http://localhost:3000`

6. **Test the API**
```bash
curl http://localhost:3000/health
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(100) NOT NULL,
  provider VARCHAR(50) DEFAULT 'local',
  provider_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
```

## Integration Example

### React Frontend

```javascript
// Login
const response = await fetch('https://secure-auth-service-production.up.railway.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { accessToken, refreshToken } = await response.json();
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Make authenticated request
const userData = await fetch('https://secure-auth-service-production.up.railway.app/api/auth/me', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### Protecting Routes in Your Backend

```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Protected route
app.get('/api/products', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  // Your logic here
});
```

## Security Features

- **Password Hashing:** Bcrypt with 12 salt rounds
- **SQL Injection Prevention:** Parameterized queries
- **Rate Limiting:** 5 login attempts per minute per IP
- **JWT Signature Verification:** RS256 algorithm
- **Token Rotation:** Old refresh tokens invalidated on refresh
- **Input Validation:** Joi schemas with custom error messages
- **Trust Proxy:** Proper IP detection behind load balancers

## Deployment

Deployed on Railway with automatic CI/CD from GitHub.

### Environment Variables (Production)

Set these in Railway dashboard:
- `NODE_ENV=production`
- `DATABASE_URL` (Railway PostgreSQL)
- `REDIS_URL` (Railway Redis)
- `JWT_ACCESS_SECRET` (strong random string)
- `JWT_REFRESH_SECRET` (different strong random string)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CALLBACK_URL=https://your-domain.up.railway.app/api/auth`

## Scripts

```bash
npm run dev       # Start development server with hot reload
npm run build     # Compile TypeScript to JavaScript
npm start         # Run production server
npm test          # Run tests (if implemented)
```

## Project Structure

```
secure-auth-service/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── passport.ts
│   ├── controllers/
│   │   └── auth.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── models/
│   │   └── createTables.ts
│   ├── routes/
│   │   └── auth.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── token.service.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── validation.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

MIT

## Author

**Nihal Shrivastava**
- GitHub: [@nihal1155](https://github.com/nihal1155)
- LinkedIn: [Nihal Shrivastava](https://linkedin.com/in/nihal-shrivastava-e11/)

## Acknowledgments

- Inspired by Auth0, Supabase, and Firebase Authentication
- Built as a learning project to understand authentication systems at scale