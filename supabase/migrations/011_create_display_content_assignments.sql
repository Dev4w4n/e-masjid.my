-- Create a join table for many-to-many relationship between displays and content
CREATE TABLE display_content_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  display_id UUID NOT NULL REFERENCES tv_displays(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES display_content(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID NOT NULL REFERENCES users(id),
  
  -- Additional assignment-specific settings can go here
  -- e.g., priority, schedule overrides
  
  UNIQUE(display_id, content_id)
);

-- RLS Policies for the new table
ALTER TABLE display_content_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Masjid admins can manage content assignments"
  ON display_content_assignments
  FOR ALL
  USING (
    display_id IN (
      SELECT id FROM tv_displays WHERE masjid_id = ANY(get_user_admin_masjids())
    )
  );

-- Remove the direct link from display_content to tv_displays
ALTER TABLE display_content DROP COLUMN display_id;
