# Storage Bucket Fix - Content Images

## Issue

The hub app is getting a 400 error when uploading content images because the `content-images` storage bucket doesn't exist in the staging environment.

## Root Cause

Migration `015_create_content_images_bucket.sql` was only a reference file - it didn't actually create the bucket. The bucket needs to be created via SQL or the Supabase Dashboard.

## Solution

A new migration `105_create_content_images_storage_bucket.sql` has been created to properly set up the storage bucket and policies.

## How to Apply the Fix

### Option 1: Apply via Supabase CLI (Recommended)

```bash
# Make sure you're connected to your staging project
supabase link --project-ref YOUR_STAGING_PROJECT_REF

# Run the migration
supabase db push

# Verify the bucket was created
supabase storage list
```

### Option 2: Apply via SQL Editor in Supabase Dashboard

1. Go to your Supabase staging project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/105_create_content_images_storage_bucket.sql`
4. Paste and run the SQL

### Option 3: Manual Creation via Dashboard

1. Go to Storage in your Supabase Dashboard
2. Click "Create a new bucket"
3. Configure:
   - Name: `content-images`
   - Public: ✅ Yes
   - File size limit: 10485760 (10MB)
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
4. After creation, go to Storage Policies
5. Add the policies from the migration file

## Verification

After applying the fix, test by:

1. Going to the hub app content creation page
2. Uploading an image
3. Verify it uploads successfully without the "Bucket not found" error

## What Changed

- ✅ Created migration `105_create_content_images_storage_bucket.sql`
- ✅ Properly creates storage bucket with correct settings
- ✅ Sets up all necessary RLS policies for content images
- ✅ Includes super admin access policies
- ✅ Enforces masjid-specific folder permissions

## Production Deployment

When deploying to production:

1. This migration will run automatically with `supabase db push`
2. The bucket will be created if it doesn't exist
3. Existing buckets will be updated with correct settings (ON CONFLICT)

## Notes

- The migration is idempotent (safe to run multiple times)
- Uses `CREATE POLICY IF NOT EXISTS` to avoid conflicts
- Uses `ON CONFLICT` for bucket creation to update existing buckets
