-- Migration: Add RLS policies for users to edit their own content
-- Allows users to update and delete their own pending/rejected content
-- Created: 2025-12-06

-- ============================================================================
-- Add RLS policies for users to manage their own content
-- ============================================================================

-- Allow users to update their own pending or rejected content
CREATE POLICY "Users can update their own pending or rejected content" ON public.display_content
  FOR UPDATE USING (
    submitted_by = auth.uid() 
    AND status IN ('pending', 'rejected')
  )
  WITH CHECK (
    submitted_by = auth.uid() 
    AND status IN ('pending', 'rejected')
  );

-- Allow users to delete their own pending or rejected content
CREATE POLICY "Users can delete their own pending or rejected content" ON public.display_content
  FOR DELETE USING (
    submitted_by = auth.uid() 
    AND status IN ('pending', 'rejected')
  );

-- Add comment for documentation
COMMENT ON POLICY "Users can update their own pending or rejected content" ON public.display_content IS 
  'Allows users to edit their own content before approval or after rejection';

COMMENT ON POLICY "Users can delete their own pending or rejected content" ON public.display_content IS 
  'Allows users to delete their own content that has not been approved yet';
