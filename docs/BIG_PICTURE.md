# Big Picture

## Project Goal
Admin-only web dashboard for viewing and managing registrations and donations data stored in Supabase.
Hebrew UI, RTL layout, read-only in first phase (no destructive actions).

## Audience
Single admin user. No public-facing pages.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Backend/DB:** Supabase (Postgres + Auth + RLS)
- **Styling:** Tailwind CSS + shadcn/ui
- **Tables:** TanStack Table v8
- **Language:** TypeScript (strict)
- **Deployment:** Vercel (via GitHub CI/CD)
- **Locale:** Hebrew, RTL

## Supabase Tables
1. `people` — master person records
2. `donations` — payment/donation records
3. `event_registrations` — shabbat registrations
4. `shabbatot` — shabbat/event definitions
5. `incoming_payloads` — raw webhook payloads, errors

## Pages
- `/login` — Supabase Auth login
- `/` (dashboard) — summary cards
- `/shabbatot` — shabbat list + detail per shabbat
- `/registrations` — event_registrations table + filters
- `/donations` — donations table + filters + stats
- `/people` — people table + per-person detail
- `/payloads` — incoming_payloads errors/unprocessed

## Deployment Notes
- Hosted on Vercel, source on GitHub
- Env vars set in Vercel dashboard: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- Never expose service_role key to client
- Auth handled via @supabase/ssr with middleware.ts (Edge-compatible)
- Persistent sessions via cookie-based auth
