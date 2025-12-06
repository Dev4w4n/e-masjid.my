-- Migration: Create content-images storage bucket
-- This migration creates the storage bucket and policies for content images

-- Create storage bucket for content images
-- Note: public, file_size_limit, and allowed_mime_types are configured via Supabase Dashboard
-- or storage.buckets configuration, not in the table columns
INSERT INTO storage.buckets (id, name)
VALUES (
  'content-images',
  'content-images'
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "content_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "content_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "content_images_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "content_images_authenticated_delete" ON storage.objects;

-- Policy: Allow authenticated users to upload images
-- Simplified version without folder-based restrictions to avoid storage service startup issues
CREATE POLICY "content_images_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-images'
);

-- Policy: Allow public read access to all content images
CREATE POLICY "content_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'content-images');

-- Policy: Allow authenticated users to update their own uploaded files
CREATE POLICY "content_images_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-images' AND
  auth.uid() = owner
);

-- Policy: Allow authenticated users to delete their own uploaded files
CREATE POLICY "content_images_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-images' AND
  auth.uid() = owner
);
