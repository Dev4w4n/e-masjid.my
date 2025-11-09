-- Add public read access to TV displays for the public app
-- This allows the public website to display TV display links on masjid detail pages

-- Create policy for anonymous/public access to view active TV displays
CREATE POLICY "tv_displays_public_select" ON public.tv_displays
  FOR SELECT
  USING (
    is_active = true
  );

COMMENT ON POLICY "tv_displays_public_select" ON public.tv_displays IS 
  'Allows public/anonymous users to view active TV displays for display on public masjid detail pages';
