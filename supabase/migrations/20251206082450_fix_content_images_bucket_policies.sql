-- Migration: Fix content-images bucket and policies
-- This migration fixes the previous migration that had incorrect bucket schema
-- and replaces complex folder-based policies with simpler ones

-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'content-images',
  'content-images',
  true
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop the old complex policies that were causing storage service issues
DROP POLICY IF EXISTS "Authenticated users can upload content images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read content images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their masjid content images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their masjid content images" ON storage.objects;
DROP POLICY IF EXISTS "Super admins can manage all content images" ON storage.objects;

-- Create simplified policies that don't depend on storage.foldername()
-- This avoids dependency issues during storage service initialization

-- Policy: Allow authenticated users to upload images
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

-- Note: Masjid-level permissions should be enforced at the application layer
-- or via additional RLS policies on the display_content table
