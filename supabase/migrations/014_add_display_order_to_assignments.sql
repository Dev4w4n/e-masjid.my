-- Add display_order column to display_content_assignments table
-- This allows masjid admins to reorder content for each display

ALTER TABLE display_content_assignments
ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;

-- Create index for efficient ordering queries
CREATE INDEX idx_display_content_assignments_order 
  ON display_content_assignments(display_id, display_order);

-- Add comment explaining the column
COMMENT ON COLUMN display_content_assignments.display_order IS 
  'Display order for content in TV display carousel. Lower numbers appear first.';
