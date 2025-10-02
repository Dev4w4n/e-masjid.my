-- Add image display settings to tv_displays table
-- This allows masjid admins to control how images are displayed on TV screens

ALTER TABLE tv_displays
ADD COLUMN image_display_mode VARCHAR(20) NOT NULL DEFAULT 'contain',
ADD COLUMN image_background_color VARCHAR(7) DEFAULT '#000000';

-- Add check constraint for valid display modes
ALTER TABLE tv_displays
ADD CONSTRAINT check_image_display_mode 
  CHECK (image_display_mode IN ('contain', 'cover', 'fill', 'none'));

-- Create index for efficient querying
CREATE INDEX idx_tv_displays_image_mode ON tv_displays(image_display_mode);

-- Add comments explaining the columns
COMMENT ON COLUMN tv_displays.image_display_mode IS 
  'How images should be displayed: contain (fit with letterbox), cover (fill and crop), fill (stretch to fit), none (original size)';

COMMENT ON COLUMN tv_displays.image_background_color IS 
  'Background color for letterboxed images (hex format)';
