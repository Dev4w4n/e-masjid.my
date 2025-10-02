-- Add show_debug_info column to tv_displays table
-- This setting controls whether to show debugging views in the TV display app
-- such as Display Status, Display Info, Configuration Updated notification, and Offline Mode label

ALTER TABLE tv_displays
ADD COLUMN show_debug_info BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN tv_displays.show_debug_info IS 'Controls visibility of debugging information in the TV display app (Display Status, Display Info, Configuration Updated notification, Offline Mode label)';
