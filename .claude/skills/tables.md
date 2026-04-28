# Skill: Tables

## Triggers
Any code touching: TanStack Table, data tables, pagination, column filters, sorting, CSV export, search within tables.

## Rules

### TanStack Table Setup
- Use `@tanstack/react-table` v8 — `useReactTable` with `getCoreRowModel`.
- Define column definitions with `ColumnDef<RowType>[]` — always typed, never `any`.
- Use `accessorKey` for simple columns, `accessorFn` for computed/joined fields.
- Cell renderers for special formatting (dates, currency, phone, boolean) must be defined in the column def — not inline in JSX.

### Pagination
- Server-side pagination for all tables (fetch only current page from Supabase).
- Page size options: 20, 50, 100. Default: 50.
- Show: "מציג X–Y מתוך Z רשומות" in Hebrew.
- Pagination controls: first, prev, next, last buttons + current page indicator.

### Filtering
- Filters are controlled state passed as query params (URL search params) — so filters survive page refresh.
- Debounce text inputs: 300ms before triggering query.
- "נקה פילטרים" button resets all filters to default.
- Date range filter: two date inputs (מ / עד), both optional.

### Sorting
- Server-side sorting via Supabase `.order()`.
- Clicking column header toggles asc → desc → unsorted.
- Sort state in URL params.

### CSV Export
- Export only the currently filtered/sorted dataset (NOT all rows regardless of pagination).
- Use client-side CSV generation (no server endpoint needed): build CSV string from fetched data, trigger download via `URL.createObjectURL`.
- Filename format: `[table-name]-[YYYY-MM-DD].csv`.
- Hebrew column headers in CSV.

### Phone Numbers
- Every phone cell: display number + copy-to-clipboard icon button + WhatsApp link icon.
- WhatsApp link: `https://wa.me/972XXXXXXXXX` (strip leading 0, add 972).
- Copy feedback: brief "הועתק!" tooltip.

### Error Rows
- Rows from `incoming_payloads` where `processed = false` or `error_message IS NOT NULL`: apply `bg-red-50` row class.

### Forbidden
- Do NOT load all table rows into client memory for client-side filtering — always filter server-side.
- Do NOT use HTML `<table>` without TanStack Table — use TanStack consistently.
- Do NOT show more than 100 rows per page.
