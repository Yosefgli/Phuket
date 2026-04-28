# Skill: Dashboard

## Triggers
Any code touching: summary cards, stat aggregations, dashboard page, shabbat detail summaries, donation totals, "next shabbat" logic.

## Rules

### Data Fetching
- All dashboard aggregations fetched server-side in the page Server Component.
- Each stat is a separate Supabase query or RPC — do NOT fetch all rows and reduce client-side.
- Required stats:
  - `count(*)` from `people`
  - `count(*)` and `sum(amount)` from `donations`
  - `count(*)` from `event_registrations`
  - `count(*)` from `shabbatot`
  - `sum(amount)` from `donations` WHERE month = current month
  - `count(*)` from `event_registrations` WHERE event_id = next shabbat's event_id
  - `count(*)` from `incoming_payloads` WHERE processed = false OR error_message IS NOT NULL

### "Next Shabbat" Logic
- Query `shabbatot` WHERE `date >= today` ORDER BY `date ASC` LIMIT 1.
- If none found, show "אין שבת קרובה" in the card.
- Display: shabbat name + date + registration count prominently at top of dashboard.

### Stat Cards Layout
- 7 cards in total (see BIG_PICTURE.md).
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.
- Each card: large number (text-3xl font-bold), Hebrew label (text-sm text-muted), optional icon.
- Currency amounts: format as `₪X,XXX` using `Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' })`.

### Shabbat Detail Summary
- On the per-shabbat detail page, show 4 summary numbers at top (large, boxed):
  - סך נרשמים לערב
  - סך נרשמים לבוקר
  - סך אנשים ייחודיים (distinct person_id or phone)
  - כמה סימנו תרומה
- These are computed from the registrations for that specific shabbat only.

### Donations Page Summary
- 4 stat cards above the table:
  - סך תרומות (sum)
  - מספר תרומות (count)
  - תרומה ממוצעת (avg)
  - תרומה גבוהה ביותר (max)
- Recompute when filters change (filter stats must reflect filtered dataset, not total).

### Forbidden
- Do NOT show placeholder/fake numbers while loading — show skeleton shimmer instead.
- Do NOT hardcode any amounts or counts.
- Do NOT compute aggregates in client-side JavaScript over large arrays.
