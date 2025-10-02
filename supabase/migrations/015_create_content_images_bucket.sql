-- Create storage bucket for content images
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true);

-- Allow authenticated users to upload images to their masjid folders
CREATE POLICY "Authenticated users can upload content images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-images' AND
  (storage.foldername(name))[1] = 'content-images'
);

-- Allow public read access to content images
CREATE POLICY "Public read access to content images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'content-images');

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update their uploaded images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-images' AND
  auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'content-images' AND
  auth.uid() = owner
);

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their uploaded images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-images' AND
  auth.uid() = owner
);

-- Allow masjid admins to manage content images for their masjids
CREATE POLICY "Masjid admins can manage content images for their masjids"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'content-images' AND
  (storage.foldername(name))[2] IN (
    SELECT masjid_id::text 
    FROM masjid_admins 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'content-images' AND
  (storage.foldername(name))[2] IN (
    SELECT masjid_id::text 
    FROM masjid_admins 
    WHERE user_id = auth.uid()
  )
);
