# Skill: Auth

## Triggers
Any code touching: Supabase Auth, login/logout, session, route protection, middleware, cookies.

## Rules

### Package
- ALWAYS use `@supabase/ssr` (NOT `@supabase/auth-helpers-nextjs` — deprecated).
- Server components and middleware: use `createServerClient` from `@supabase/ssr`.
- Client components: use `createBrowserClient` from `@supabase/ssr`.

### Middleware (middleware.ts)
- Place at project root (not inside `app/`).
- Must refresh session on every request via `supabase.auth.getUser()`.
- Must redirect unauthenticated users to `/login`.
- Must redirect authenticated users away from `/login`.
- Use `NextResponse` cookie forwarding pattern exactly as in @supabase/ssr docs.
- Matcher must exclude `_next/static`, `_next/image`, `favicon.ico`.

### Environment Variables
- NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY only on the client.
- NEVER reference SUPABASE_SERVICE_ROLE_KEY in any client-side code or component.
- On Vercel: all env vars set in dashboard, never hardcoded.

### Session
- Use cookie-based sessions (SSR-compatible). Never use localStorage for auth tokens.
- Session must persist across page refreshes.
- On logout: call `supabase.auth.signOut()` then redirect to `/login`.

### Login Page
- Route: `/login` — must be accessible without auth.
- On success: `router.push('/')`.
- On error: display Hebrew error message, never expose raw Supabase error codes to user.
- No registration form. Admin only — account pre-exists in Supabase Auth.

### Forbidden
- Do NOT use `getSession()` for auth checks in server code — it reads from cookie and can be spoofed. Use `getUser()` which validates against Supabase server.
- Do NOT create public API routes that return data without verifying auth.
