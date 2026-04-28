# Skill: Data Layer

## Triggers
Any code touching: Supabase client instantiation, database queries, table joins, RLS policies, TypeScript DB types.

## Rules

### Client Setup
- ONE shared server client factory in `lib/supabase/server.ts` using `createServerClient`.
- ONE shared browser client factory in `lib/supabase/client.ts` using `createBrowserClient`.
- Never instantiate Supabase client inline inside components or pages.

### TypeScript Types
- Generate types with `supabase gen types typescript` and store in `lib/database.types.ts`.
- All query results must be typed. Never use `any` for Supabase responses.
- Use `Database['public']['Tables']['table_name']['Row']` pattern for row types.

### Queries
- All data fetching in Server Components or Route Handlers — NOT in client components (avoids key exposure risk).
- Use `.select()` with explicit columns — never `select('*')` on large tables.
- Always handle `error` from Supabase responses. If `error` exists, throw or return structured error — never silently ignore.
- Pagination: use `.range(from, to)` — default page size 50 rows max.
- Joins: use Supabase's `!inner` join syntax for required relations, regular for optional.

### RLS
- All tables must have RLS enabled.
- Policy: `auth.uid() IS NOT NULL` is the minimum requirement for SELECT on all tables.
- No policy should allow anonymous (unauthenticated) reads on any table.
- Never disable RLS to "fix" a query — fix the query or policy instead.

### Aggregations
- Heavy aggregations (totals, counts) must use Supabase RPC (Postgres functions) — NOT client-side reduce over full table.
- Example: total donations sum → `supabase.rpc('get_total_donations')`.

### Forbidden
- Do NOT use `.from('table').select('*')` without a `.limit()` or `.range()`.
- Do NOT expose raw Supabase query errors to the UI — map to Hebrew user-facing messages.
- Do NOT call the database directly from client components if it can be done server-side.
