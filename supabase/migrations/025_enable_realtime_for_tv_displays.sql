-- Migration: Enable Real-time for TV Display Tables
-- Description: Enable Supabase real-time subscriptions for immediate updates
-- Date: 2025-10-17

-- ============================================================================
-- Enable Real-time for TV Displays table
-- ============================================================================

-- Enable real-time for tv_displays table
-- This allows hub app changes to immediately notify TV display apps
ALTER PUBLICATION supabase_realtime ADD TABLE tv_displays;

-- Set replica identity to FULL to get all column values in real-time updates
-- This ensures we get the full row data in the payload
ALTER TABLE tv_displays REPLICA IDENTITY FULL;

-- ============================================================================
-- Enable Real-time for Display Content table
-- ============================================================================

-- Enable real-time for display_content table
-- This allows content changes to immediately update TV displays
ALTER PUBLICATION supabase_realtime ADD TABLE display_content;

-- Set replica identity to FULL to get all column values in real-time updates
ALTER TABLE display_content REPLICA IDENTITY FULL;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE tv_displays IS 'TV display configurations with real-time updates enabled';
COMMENT ON TABLE display_content IS 'Display content assignments with real-time updates enabled';

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify real-time is enabled (run this manually to check):
-- SELECT schemaname, tablename 
-- FROM pg_publication_tables 
-- WHERE pubname = 'supabase_realtime';
