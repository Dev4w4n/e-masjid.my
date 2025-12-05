-- Add public read access to display_content_assignments
-- This allows TV displays to fetch their assigned content without authentication

CREATE POLICY "Public can view display content assignments"
ON public.display_content_assignments
FOR SELECT
TO public
USING (true);
