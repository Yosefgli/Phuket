2026-04-28 — בנה מערכת ניהול מלאה: Next.js 14 + Supabase + RTL עברית — login, dashboard, shabbatot, registrations, donations, people, payloads, global search (40+ files, build pass)
- Fix column name mismatches across donations/registrations/shabbatot pages+clients (product→product_name, is_recurring→recurring, evening_count→reg_evening, morning_count→reg_morning, is_donor→reg_donation_success, language→lang, name→shabbat, date→event_date, time→event_time)

2026-04-28: fix donations page.tsx select('*') to match full Donation type — resolves Vercel build type error
2026-04-28: fix payloads page.tsx select('*') — added missing processed_at to select, resolves Vercel build type error
2026-04-28 — fix registrations/page.tsx: changed partial select to select('*') to match EventRegistration type, resolves Vercel build type error
- fix people/[id]/page.tsx: corrected column names (product_name, recurring, reg_evening, reg_morning, reg_donation_success, lang, shabbat.shabbat, shabbat.event_date) — donations and registrations were returning empty due to wrong column names in select
