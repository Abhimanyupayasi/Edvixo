# Edvixo Backend (Express API)

Express API powering Edvixo’s admin and public student experiences. Designed for correctness, secure cross-site behavior, and predictable sessions.

Surfaces
- Admin API (private)
  - Auth: Clerk-issued JWT via Authorization: Bearer <token>
  - Resources: plans, billing, students, builder, admin data
- Public Student API
  - Auth: cookie-based session (student_access, student_refresh)
  - Header fallback: x-student-access
  - Resources: /public/auth/login, /public/auth/refresh, /public/student/me, enrollments

Auth and cookies
- Dev (localhost)
  - SameSite=Lax; Secure=false; Path=/; no Domain
- Prod (HTTPS only)
  - SameSite=None; Secure=true; Path=/; Domain=.your-root-domain
- Refresh cookie is httpOnly; access cookie scoped for lightweight reads
- trust proxy enabled for correct Secure cookies behind TLS

CORS and preflight
- Explicit OPTIONS responder returns 204 with:
  - Access-Control-Allow-Origin: exact allowed origin (from FRONTEND_URLS)
  - Access-Control-Allow-Credentials: true
  - Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
  - Access-Control-Allow-Headers: authorization, content-type, x-requested-with, x-plan-id, x-student-access
  - Vary: Origin

Environment variables
- Required
  - NODE_ENV=development|production
  - PORT=8000
  - FRONTEND_URLS=http://localhost:3000,https://your-frontend.example.com
  - STUDENT_ACCESS_SECRET=strong-random-string
  - STUDENT_REFRESH_SECRET=strong-random-string
- Strongly recommended (prod)
  - COOKIE_DOMAIN=.your-root-domain (e.g., .sevalla.app)
  - PLATFORM_ROOT_DOMAIN=your-root-domain (e.g., sevalla.app)
- Optional
  - LOG_LEVEL=info
  - RATE_LIMIT_* (if enabled)
  - REDIS_URL (cache/queues)

Run (Windows)
- npm install
- npm run dev
- http://localhost:8000

Quick flow examples
- Login (student)
  - POST /public/auth/login → sets student_access + student_refresh cookies
- Read profile
  - GET /public/student/me
    - Cookie: student_access=...
    - Optional header: x-student-access: <access-token>
- Refresh
  - POST /public/auth/refresh → rotates access cookie; returns new access token in body if applicable

curl examples
- curl -i -X POST https://api.example.com/public/auth/login -d "{\"email\":\"x@y.com\",\"otp\":\"123456\"}" -H "Content-Type: application/json"
- curl -i https://api.example.com/public/student/me -H "Cookie: student_access=...;"
- curl -i -X POST https://api.example.com/public/auth/refresh -H "Cookie: student_refresh=...;"

Operational hardening
- Idempotent login/refresh handlers
- Consistent cookie attributes across login/refresh/logout
- Structured error responses (status, code, message)
- Healthcheck: GET /health → 200 OK with version metadata

Performance and scale
- Stateless API for horizontal scaling
- CDN/proxy-friendly headers
- Optional layers:
  - Redis (cache/session hints)
  - BullMQ (async jobs: email, webhooks, exports)
  - Centralized logs/metrics/traces

Troubleshooting
- 401 on student/me in prod:
  - Check Set-Cookie attributes (Secure; SameSite=None; Domain=.root.tld)
  - Confirm HTTPS and matching COOKIE_DOMAIN
- Preflight failing:
  - Ensure OPTIONS responder returns 204 with correct Allow-* headers
  - Ensure origin is in FRONTEND_URLS
- “Secure cookie on http”:
  - Dev must disable Secure; Prod must be HTTPS with trust proxy

Deployment checklist
- Set FRONTEND_URLS to exact frontend origins
- Set COOKIE_DOMAIN to the root domain
- Enable trust proxy behind TLS terminator
- Use the same STUDENT_* secrets across instances
- Validate