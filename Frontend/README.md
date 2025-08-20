# Edvixo Frontend (Admin + Public Portal)

Modern React app for Edvixo’s admin experience and public student portal. Built for fast UX, secure sessions, and smooth production behavior.

What’s inside
- Admin app
  - Dashboard, Plans/Billing, Website Builder, Students
  - Protected by Clerk with a RequireAuth guard
- Public student portal
  - Login/refresh via secure cookies
  - Durable session via Redux + localStorage
  - x-student-access header fallback for fast reads

Stack
- React 18, Vite, React Router
- Tailwind CSS (utility-first)
- Clerk (SignIn, SignUp, UserButton)
- Redux Toolkit (session and profile persistence)
- Axios (HTTP), optional Framer Motion (micro-interactions)

Auth model
- Admin (Clerk)
  - Private routes wrapped by RequireAuth
  - Signed-out users redirect to /sign-in and return to intended path after sign-in
- Student (Public)
  - Cookies handle refresh; access token persisted to Redux/localStorage
  - Header fallback x-student-access for /public/student/* endpoints
  - Dev: SameSite=Lax, non-secure; Prod: SameSite=None; Secure

Environment variables
- Required
  - VITE_CLERK_PUBLISHABLE_KEY=pk_...
- Optional
  - VITE_SERVER_URL=https://api.example.com (prefer same-origin in prod)
  - VITE_BRAND_NAME=Edvixo
  - VITE_ENABLE_MOTION=true

Scripts (Windows)
- npm install
- npm run dev
- npm run build
- npm run preview

Routing
- Public: /, /plans, /public-site/student-login, /sign-in, /sign-up
- Protected: /dashboard, /super, builder routes, student management
- RequireAuth redirects signed-out users to /sign-in (Clerk)

Folder cues
- src/components/header, footer, home (Hero, FeatureGrid, Workflow)
- src/components/auth/RequireAuth.jsx
- src/hooks (e.g., usePurchasedPlans)
- src/store (Redux slice for student session)
- src/utils/envExport.js (serverURL fallback)

API strategy
- Admin requests: Authorization: Bearer <Clerk token>
- Student requests: cookies for auth; send x-student-access when available
- Base URL from VITE_SERVER_URL or same-origin

Performance
- Route-level code-splitting
- Image lazy-loading, responsive sizes
- Minimal re-renders via memoization where needed

Troubleshooting
- 401 on student endpoints in prod: verify cookies are Secure + SameSite=None and domain matches COOKIE_DOMAIN.
- Preflight blocked: backend must return OPTIONS 204 with Allow-* headers and echo origin; FRONTEND_URLS must include the origin.
- Signed-out blank page: ensure RequireAuth wraps protected routes and /sign-in route exists.

Deploy
- Prefer serving the frontend under the same host as the API for simple cookies
- If cross-subdomain, set COOKIE_DOMAIN to the root domain and use HTTPS