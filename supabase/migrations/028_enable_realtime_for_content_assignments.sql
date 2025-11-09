-- Migration: Enable Real-time for Display Content Assignments
-- Description: Enable Supabase real-time subscriptions for content assignment changes
-- Date: 2025-10-28

-- ============================================================================
-- Enable Real-time for Display Content Assignments table
-- ============================================================================

-- Enable real-time for display_content_assignments table
-- This allows assignment changes to immediately notify TV display apps
ALTER PUBLICATION supabase_realtime ADD TABLE display_content_assignments;

-- Set replica identity to FULL to get all column values in real-time updates
-- This ensures we get the full row data in the payload
ALTER TABLE display_content_assignments REPLICA IDENTITY FULL;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE display_content_assignments IS 'Display content assignment relationships with real-time updates enabled for immediate carousel updates';

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify real-time is enabled (run this manually to check):
-- SELECT schemaname, tablename 
-- FROM pg_publication_tables 
-- WHERE pubname = 'supabase_realtime'
-- AND tablename = 'display_content_assignments';
