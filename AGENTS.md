# AGENTS.md

## Cursor Cloud specific instructions

Vite + React 19 + TypeScript + Tailwind v4 marketing/booking site for the "Moove" fitness studio ("Move & Pose" posing bookings + "Peach" training programs). The frontend is a static SPA; the `api/` directory holds Vercel serverless functions (Supabase + Stripe + Resend/nodemailer).

### Services

- Frontend (SPA): `npm run dev` → Vite dev server on http://localhost:5173. This is the primary developable service and runs fully WITHOUT any secrets. Supabase-backed features (`/posing/*` auth/booking, `/programmata/access/*`) degrade gracefully when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are unset (see `src/lib/supabase.ts` `isSupabaseConfigured`); the marketing pages, contact form UI, and program catalog render normally.
- Backend API (`api/**`): Vercel serverless functions. `npm run dev` (plain Vite) does NOT serve `/api/*` — you need `vercel dev` (the Vercel CLI is not installed by default) plus real `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_*`, and `RESEND_API_KEY`/SMTP secrets. Without those external accounts the API cannot be exercised end-to-end locally; test the pure logic via the test scripts instead. See `docs/posing-booking-setup.md` and `.env.example`.

### Lint / test / build (standard commands live in `package.json`)

- Lint: `npm run lint`. Note: it currently exits non-zero due to pre-existing `react-hooks/set-state-in-effect` errors in the app code — that is a code issue, not an environment problem.
- Tests: `npm run test:pricing` and `npm run test:calendar`. Other suites: `node --test tests/payment-email.test.js tests/program-access.test.js`. Gotcha: `node --test tests/` (passing a directory) fails on this Node version — always pass explicit test file paths.
- Build: `npm run build` (`tsc -b && vite build`).

### Notes

- Package manager is npm (`package-lock.json`); dependencies are pinned to very recent majors (Vite 8, ESLint 10, TypeScript 6). Use `npm ci`.
- Local env for `/api/*` uses `.env` (gitignored); copy from `.env.example`.
