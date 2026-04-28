-- =============================================================================
-- Phuket Admin — Supabase Setup SQL
-- Run this in the Supabase SQL Editor before first use.
-- =============================================================================

-- =============================================================================
-- 1. ENABLE ROW LEVEL SECURITY on all tables
-- =============================================================================

ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shabbatot ENABLE ROW LEVEL SECURITY;
ALTER TABLE incoming_payloads ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 2. RLS POLICIES — authenticated users only
-- =============================================================================

-- people
CREATE POLICY "Authenticated read on people"
  ON people FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- donations
CREATE POLICY "Authenticated read on donations"
  ON donations FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- event_registrations
CREATE POLICY "Authenticated read on event_registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- shabbatot
CREATE POLICY "Authenticated read on shabbatot"
  ON shabbatot FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- incoming_payloads
CREATE POLICY "Authenticated read on incoming_payloads"
  ON incoming_payloads FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- =============================================================================
-- 3. OPTIONAL: RPC FUNCTION FOR DASHBOARD STATS
--    (more efficient than 6 separate queries)
-- =============================================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_donations_sum        numeric,
  total_donations_count      bigint,
  total_registrations_count  bigint,
  total_shabbatot_count      bigint,
  current_month_donations_sum numeric,
  unprocessed_payloads_count bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    (SELECT COALESCE(SUM(amount), 0) FROM donations)                    AS total_donations_sum,
    (SELECT COUNT(*) FROM donations)                                     AS total_donations_count,
    (SELECT COUNT(*) FROM event_registrations)                           AS total_registrations_count,
    (SELECT COUNT(*) FROM shabbatot)                                     AS total_shabbatot_count,
    (SELECT COALESCE(SUM(amount), 0)
       FROM donations
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()))
                                                                         AS current_month_donations_sum,
    (SELECT COUNT(*)
       FROM incoming_payloads
      WHERE processed IS FALSE OR error_message IS NOT NULL)             AS unprocessed_payloads_count;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;

-- =============================================================================
-- 4. INDEXES — for commonly-filtered columns
-- =============================================================================

-- donations
CREATE INDEX IF NOT EXISTS idx_donations_person_id   ON donations(person_id);
CREATE INDEX IF NOT EXISTS idx_donations_payment_date ON donations(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_donations_created_at  ON donations(created_at DESC);

-- event_registrations
CREATE INDEX IF NOT EXISTS idx_regs_person_id  ON event_registrations(person_id);
CREATE INDEX IF NOT EXISTS idx_regs_event_id   ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_regs_shabbat_id ON event_registrations(shabbat_id);
CREATE INDEX IF NOT EXISTS idx_regs_created_at ON event_registrations(created_at DESC);

-- shabbatot
CREATE INDEX IF NOT EXISTS idx_shabbatot_date     ON shabbatot(date DESC);
CREATE INDEX IF NOT EXISTS idx_shabbatot_event_id ON shabbatot(event_id);

-- incoming_payloads
CREATE INDEX IF NOT EXISTS idx_payloads_processed   ON incoming_payloads(processed);
CREATE INDEX IF NOT EXISTS idx_payloads_created_at  ON incoming_payloads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payloads_payload_type ON incoming_payloads(payload_type);

-- =============================================================================
-- 5. GENERATE TYPESCRIPT TYPES
--    Run this CLI command from your project root after connecting supabase CLI:
--
--    npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> \
--      > lib/database.types.ts
--
-- =============================================================================
