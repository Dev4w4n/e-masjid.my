-- Migration: Create analytics_events sink for landing/display measurement
-- Feature: 007-tv-landing-tiers
-- Purpose: FR-022 event governance with idempotency and retention readiness

CREATE TABLE IF NOT EXISTS public.analytics_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL CHECK (
    event_name IN (
      'landing_cta_click',
      'zone_selection_success',
      'faq_item_expand',
      'upgrade_intent'
    )
  ),
  event_time TIMESTAMPTZ NOT NULL,
  session_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('ms', 'en')),
  idempotency_key TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_events_idempotency_key
  ON public.analytics_events (idempotency_key);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name_time
  ON public.analytics_events (event_name, event_time DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at
  ON public.analytics_events (created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS analytics_events_no_direct_read ON public.analytics_events;
CREATE POLICY analytics_events_no_direct_read
  ON public.analytics_events
  FOR SELECT
  USING (false);

DROP POLICY IF EXISTS analytics_events_no_direct_write ON public.analytics_events;
CREATE POLICY analytics_events_no_direct_write
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (false);

COMMENT ON TABLE public.analytics_events IS
  'Authoritative landing/display analytics sink. Records FR-022 events with idempotency key and 180-day retention handled by maintenance migration.';
