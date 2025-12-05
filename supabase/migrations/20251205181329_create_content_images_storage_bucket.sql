-- Migration: Create content-images storage bucket
-- This migration creates the storage bucket and policies for content images

-- Create storage bucket for content images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-images',
  'content-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload content images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read content images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their masjid content images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their masjid content images" ON storage.objects;
DROP POLICY IF EXISTS "Super admins can manage all content images" ON storage.objects;

-- Policy: Allow authenticated users to upload images to their masjid folders
CREATE POLICY "Authenticated users can upload content images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-images' AND
  (storage.foldername(name))[1] = 'content-images' AND
  -- Users can only upload to folders of masjids they are admins of
  (storage.foldername(name))[2]::uuid IN (
    SELECT masjid_id FROM masjid_admins WHERE user_id = auth.uid()
  )
);

-- Policy: Allow public read access to all content images
CREATE POLICY "Public can read content images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'content-images');

-- Policy: Allow users to update their own masjid's images
CREATE POLICY "Users can update their masjid content images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-images' AND
  (storage.foldername(name))[2]::uuid IN (
    SELECT masjid_id FROM masjid_admins WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'content-images' AND
  (storage.foldername(name))[2]::uuid IN (
    SELECT masjid_id FROM masjid_admins WHERE user_id = auth.uid()
  )
);

-- Policy: Allow users to delete their own masjid's images
CREATE POLICY "Users can delete their masjid content images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-images' AND
  (storage.foldername(name))[2]::uuid IN (
    SELECT masjid_id FROM masjid_admins WHERE user_id = auth.uid()
  )
);

-- Policy: Allow super admins full access
CREATE POLICY "Super admins can manage all content images"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'content-images' AND
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
  )
)
WITH CHECK (
  bucket_id = 'content-images' AND
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
  )
);
