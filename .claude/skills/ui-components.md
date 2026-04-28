# Skill: UI Components

## Triggers
Any code touching: layout, components, shadcn/ui, Tailwind, Hebrew text, RTL, sidebar, responsive design, loading/error/empty states.

## Rules

### RTL & Hebrew
- Root `<html>` must have `dir="rtl"` and `lang="he"`.
- Tailwind RTL: use `rtl:` prefix variants where directional utilities differ (e.g., `rtl:text-right`).
- All user-facing strings in Hebrew. No English text visible to user (error messages, labels, placeholders, buttons).
- Font: use `var(--font-sans)` — set to a Hebrew-supporting font (Rubik or Assistant via Google Fonts in `layout.tsx`).

### shadcn/ui
- Install components via `npx shadcn@latest add <component>` — never copy-paste component code manually.
- Use shadcn's `cn()` utility for conditional class merging.
- Do NOT override shadcn component internals unless absolutely required — extend via `className` prop.

### Layout
- Sidebar navigation: fixed on desktop, collapsible drawer on mobile.
- Sidebar items: דשבורד | שבתות | הרשמות | תרומות | אנשים | שגיאות.
- Top bar: global search + logout button.
- Main content area: `min-h-screen` with proper padding, scrollable independently of sidebar.

### States (REQUIRED on every data-fetching page)
- **Loading:** skeleton cards/rows — never a blank white screen.
- **Empty:** Hebrew message + icon — never just an empty table.
- **Error:** Hebrew error card with retry option — never a raw error string.

### Cards
- Summary stat cards: large number, label below, subtle icon, border, light background.
- Consistent spacing: `p-6` for cards, `gap-4` for grids, `space-y-4` for stacks.

### Colors
- Neutral palette (slate/gray). One accent color (blue or indigo) for CTAs only.
- Error states: `red-50` bg with `red-600` text.
- Warning/unprocessed: `amber-50` bg.
- No bright gradients. No dark mode unless explicitly requested.

### Responsive
- Sidebar collapses to hamburger on `md` breakpoint.
- Tables scroll horizontally on mobile — wrap in `overflow-x-auto`.
- Cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.

### Forbidden
- Do NOT use inline styles (`style={{}}`) — use Tailwind only.
- Do NOT use `margin: auto` centering hacks — use Tailwind flex/grid.
- Do NOT add animations or transitions unless specifically requested.
