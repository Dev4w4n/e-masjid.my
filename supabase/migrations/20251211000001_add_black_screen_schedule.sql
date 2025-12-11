-- Black Screen Schedule for TV Displays
-- Allows scheduling automatic black screen periods (e.g., during Friday prayers)

-- ============================================================================
-- Add black screen schedule columns to tv_displays table
-- ============================================================================

-- Enable black screen scheduling for this display
ALTER TABLE tv_displays 
ADD COLUMN IF NOT EXISTS black_screen_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Schedule type: 'daily' (every day at specified time) or 'weekly' (specific days)
ALTER TABLE tv_displays 
ADD COLUMN IF NOT EXISTS black_screen_schedule_type VARCHAR(20) NOT NULL DEFAULT 'daily';

-- Start time in HH:MM format (24-hour)
ALTER TABLE tv_displays 
ADD COLUMN IF NOT EXISTS black_screen_start_time TIME;

-- End time in HH:MM format (24-hour)
ALTER TABLE tv_displays 
ADD COLUMN IF NOT EXISTS black_screen_end_time TIME;

-- Days of week for weekly schedule (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
-- Stored as JSON array, e.g., [5] for Friday only, [0,6] for weekends
ALTER TABLE tv_displays 
ADD COLUMN IF NOT EXISTS black_screen_days INTEGER[] DEFAULT '{}';

-- Optional message to display during black screen (e.g., "Solat Jumaat sedang berlangsung")
ALTER TABLE tv_displays 
ADD COLUMN IF NOT EXISTS black_screen_message TEXT;

-- Show clock during black screen
ALTER TABLE tv_displays 
ADD COLUMN IF NOT EXISTS black_screen_show_clock BOOLEAN NOT NULL DEFAULT TRUE;

-- ============================================================================
-- Add comment for documentation
-- ============================================================================

COMMENT ON COLUMN tv_displays.black_screen_enabled IS 'Enable scheduled black screen periods';
COMMENT ON COLUMN tv_displays.black_screen_schedule_type IS 'Schedule type: daily (every day) or weekly (specific days)';
COMMENT ON COLUMN tv_displays.black_screen_start_time IS 'Start time for black screen in HH:MM format (24-hour, masjid local time)';
COMMENT ON COLUMN tv_displays.black_screen_end_time IS 'End time for black screen in HH:MM format (24-hour, masjid local time)';
COMMENT ON COLUMN tv_displays.black_screen_days IS 'Days of week (0=Sun to 6=Sat) when schedule applies, used for weekly type';
COMMENT ON COLUMN tv_displays.black_screen_message IS 'Optional message to display during black screen period';
COMMENT ON COLUMN tv_displays.black_screen_show_clock IS 'Show current time during black screen period';

-- ============================================================================
-- Create index for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tv_displays_black_screen 
ON tv_displays(black_screen_enabled) 
WHERE black_screen_enabled = TRUE;
