-- Migration: Pre-emptively drop storage policies before they are recreated
-- This migration runs BEFORE 20251206082450 to prevent duplicate policy errors
-- It ensures a clean state for policy recreation

-- Drop all policies that might have been created by previous migrations
DROP POLICY IF EXISTS "content_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "content_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "content_images_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "content_images_authenticated_delete" ON storage.objects;
