# Edvixo — Student Management + Website Builder

Edvixo is a full-stack platform to let institutions launch branded sites, enroll students, and manage plans, payments, and portals—fast, secure, and reliable.

What problem we solve
- Tool sprawl: sites, forms, sheets, and payment links don’t talk to each other.
- Lost conversions: manual enrollments and broken checkouts leak revenue.
- Slow go‑live: websites and portals take weeks; changes take days.
- Risky setups: ad‑hoc auth, cookies, and CORS lead to data and session issues.

What Edvixo delivers
- Launch in minutes: publish a branded site and student portal.
- Sell plans: configure pricing, coupons, and checkout.
- Enroll and manage: central student CRM, progress, and communications.
- Production security: hardened CORS, environment-aware cookies, role-based auth.

Architecture overview
- Frontend (Vite + React + Tailwind)
  - Admin app (Clerk auth), dashboards, plans, builder, students.
  - Public student portal with durable session and refresh.
  - Redux persistence for resilient UX.
- Backend (Node.js + Express)
  - Admin API protected by Clerk bearer tokens.
  - Public student API: cookie-based session + header fallback.
  - Hardened preflight (OPTIONS 204), trust proxy, secure cookies.

Key workflows (business-first)
- Onboard → Configure → Publish → Enroll → Collect → Track
- Admin: sign in → create plans → publish site → view enrollments and revenue.
- Student: visit public site → sign in → enroll → pay → access resources.

Security model
- Admin: Clerk session → short-lived JWT (Authorization: Bearer) → role checks.
- Student: httpOnly refresh + access cookies in prod (SameSite=None; Secure), Lax in dev.
- CORS: explicit allowlist, credentials on, precise Allow-Headers, Vary: Origin.
- trust proxy for correct Secure cookie behavior behind TLS terminators.

Performance and reliability
- Code-splitting, lazy images, cached data.
- Idempotent refresh/login flows, consistent cookie attributes.
- Horizontally scalable and CDN-friendly.

Tech stack
- React 18, Vite, Tailwind CSS, Redux Toolkit
- Clerk (auth), Axios
- Node.js, Express
- Optional: Redis cache, BullMQ jobs, centralized logging/metrics

Monorepo layout
- Frontend/ — React app (admin + public portal)
- Backend/ — Express API (admin + public routes)

Quick start (Windows)
- Frontend
  - cd Frontend && npm install && npm run dev
  - http://localhost:3000
- Backend
  - cd Backend && npm install && npm run dev
  - http://localhost:8000

Environment must‑haves
- Frontend: VITE_CLERK_PUBLISHABLE_KEY
- Backend: FRONTEND_URLS, STUDENT_ACCESS_SECRET, STUDENT_REFRESH_SECRET
- Production: COOKIE_DOMAIN=.your-root-domain and HTTPS everywhere

Production checklist
- FRONTEND_URLS includes deployed origins.
- COOKIE_DOMAIN set to root domain (e.g., .sevalla.app).
- trust proxy enabled; TLS on ingress.
- Same secrets across instances; rotate secrets on schedule.
- Preflight OPTIONS returns 204 with correct headers.

Next steps
- See Frontend/README.md and Backend/README.md for detailed setup, flows, and commands.