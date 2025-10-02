-- Add content-specific display settings to display_content_assignments table
-- These settings override the display-level defaults for each individual content item

ALTER TABLE display_content_assignments
  ADD COLUMN carousel_duration INTEGER DEFAULT 10 CHECK (carousel_duration >= 5 AND carousel_duration <= 300),
  ADD COLUMN transition_type VARCHAR(20) DEFAULT 'fade' CHECK (transition_type IN ('fade', 'slide', 'zoom', 'none')),
  ADD COLUMN image_display_mode VARCHAR(20) DEFAULT 'contain' CHECK (image_display_mode IN ('contain', 'cover', 'fill', 'none'));

-- Add comments
COMMENT ON COLUMN display_content_assignments.carousel_duration IS 
  'Duration in seconds for how long this content is displayed (5-300 seconds)';

COMMENT ON COLUMN display_content_assignments.transition_type IS 
  'Transition animation when this content appears (fade, slide, zoom, none)';

COMMENT ON COLUMN display_content_assignments.image_display_mode IS 
  'How images should be displayed for this content (contain, cover, fill, none)';

-- Update existing records to use default values
UPDATE display_content_assignments
SET 
  carousel_duration = 10,
  transition_type = 'fade',
  image_display_mode = 'contain'
WHERE carousel_duration IS NULL;
