# CLAUDE.md — Router & Protocol

## Before Writing Any Code
1. Identify the domain of the task.
2. Read the corresponding skill file in full from `.claude/skills/`.
3. Only then proceed.

## Routing Table

| Trigger | Skill File |
|---|---|
| Supabase Auth, login, logout, session, middleware, cookies, route protection | `.claude/skills/auth.md` |
| Supabase client, queries, RLS, joins, DB types, data fetching | `.claude/skills/data-layer.md` |
| Layout, components, shadcn/ui, Tailwind, Hebrew, RTL, sidebar, loading/error/empty states | `.claude/skills/ui-components.md` |
| TanStack Table, pagination, filters, sorting, CSV export, phone copy/WhatsApp | `.claude/skills/tables.md` |
| Dashboard cards, stat aggregations, "next shabbat", donation totals, per-shabbat summary | `.claude/skills/dashboard.md` |

## `!resume` Command
If the user types `!resume` at the start of a session: READ `docs/BIG_PICTURE.md`. Do not print it. Reply with a short status summary and ask: "What are we working on this session?" Never read it again during the session unless asked.

## Session Discipline
One session = one task. Do not let the conversation sprawl across multiple features or fixes. When the task is complete, say so explicitly.

## Deployment Context
- GitHub → Vercel auto-deploy on push to main.
- Env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in Vercel dashboard.
- Never commit `.env.local`. Never hardcode keys.
- Test builds locally with `next build` before pushing.

## Auto-Logging & Session Close
After every completed task:
1. APPEND a 1-liner to `docs/CHANGELOG.md`. Never read it.
2. Optionally APPEND out-of-scope ideas as 1-liners to `docs/BACKLOG.md`.
3. Tell the user: "Task complete. Log updated. Please close this chat and open a new one — keep the context window clean."
