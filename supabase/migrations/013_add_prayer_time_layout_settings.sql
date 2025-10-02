-- Add prayer time layout and alignment settings to tv_displays table
-- These settings control how prayer times are displayed on the TV display

ALTER TABLE tv_displays
ADD COLUMN prayer_time_layout VARCHAR(20) NOT NULL DEFAULT 'horizontal',
ADD COLUMN prayer_time_alignment VARCHAR(20) NOT NULL DEFAULT 'center';

-- Add check constraints for valid values
ALTER TABLE tv_displays
ADD CONSTRAINT prayer_time_layout_check 
  CHECK (prayer_time_layout IN ('horizontal', 'vertical'));

ALTER TABLE tv_displays
ADD CONSTRAINT prayer_time_alignment_check 
  CHECK (prayer_time_alignment IN ('left', 'center', 'right', 'top', 'bottom', 'space-between', 'space-around'));

COMMENT ON COLUMN tv_displays.prayer_time_layout IS 'Layout direction for prayer times display: horizontal (side by side) or vertical (stacked)';
COMMENT ON COLUMN tv_displays.prayer_time_alignment IS 'Alignment of prayer times within their container: left, center, right, top, bottom, space-between, space-around';
