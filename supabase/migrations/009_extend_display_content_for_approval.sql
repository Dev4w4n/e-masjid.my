-- Extension to display_content table for Content Management approval workflow
-- This migration extends the existing display_content table with approval workflow fields
-- Preserves all existing functionality for TV display app

-- ============================================================================
-- Add approval workflow columns to existing display_content table
-- ============================================================================

ALTER TABLE display_content 
ADD COLUMN approval_notes TEXT,
ADD COLUMN resubmission_of UUID REFERENCES display_content(id);

-- ============================================================================
-- Add indexes for performance optimization
-- ============================================================================

-- Index for resubmission tracking and queries
CREATE INDEX idx_display_content_resubmission ON display_content(resubmission_of);

-- Index for approval workflow queries (status + masjid combination)
CREATE INDEX idx_display_content_approval_workflow ON display_content(masjid_id, status, submitted_at DESC);

-- ============================================================================
-- Add RLS policies for approval workflow
-- ============================================================================

-- Allow users to view approval status and notes for their own content
CREATE POLICY "Users can view approval details of their own content" ON display_content
  FOR SELECT USING (
    submitted_by = auth.uid()
  );

-- Allow users to resubmit content (create new content referencing their rejected content)
CREATE POLICY "Users can resubmit their own rejected content" ON display_content
  FOR INSERT WITH CHECK (
    -- User can only reference their own content for resubmission
    resubmission_of IS NULL 
    OR (
      SELECT submitted_by 
      FROM display_content 
      WHERE id = resubmission_of
    ) = auth.uid()
  );

-- Allow masjid admins to view pending approvals with full context
CREATE POLICY "Masjid admins can view approval workflow details" ON display_content
  FOR SELECT USING (
    masjid_id = ANY(get_user_admin_masjids())
  );

-- Allow masjid admins to update approval status and notes
CREATE POLICY "Masjid admins can manage approval workflow" ON display_content
  FOR UPDATE USING (
    masjid_id = ANY(get_user_admin_masjids())
  );

-- ============================================================================
-- Functions for approval workflow
-- ============================================================================

-- Function to get resubmission history for content
CREATE OR REPLACE FUNCTION get_resubmission_history(content_id UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  status content_status,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  approval_notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE resubmission_chain AS (
    -- Base case: find the original content
    SELECT 
      dc.id,
      dc.title,
      dc.status,
      dc.submitted_at,
      dc.approved_at,
      dc.rejection_reason,
      dc.approval_notes,
      dc.resubmission_of,
      1 as level
    FROM display_content dc
    WHERE dc.id = content_id
    
    UNION ALL
    
    -- Recursive case: find previous versions
    SELECT 
      dc.id,
      dc.title,
      dc.status,
      dc.submitted_at,
      dc.approved_at,
      dc.rejection_reason,
      dc.approval_notes,
      dc.resubmission_of,
      rc.level + 1
    FROM display_content dc
    INNER JOIN resubmission_chain rc ON dc.id = rc.resubmission_of
  )
  SELECT 
    rc.id,
    rc.title,
    rc.status,
    rc.submitted_at,
    rc.approved_at,
    rc.rejection_reason,
    rc.approval_notes
  FROM resubmission_chain rc
  ORDER BY rc.level DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending approvals count for a masjid admin
CREATE OR REPLACE FUNCTION get_pending_approvals_count(admin_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  pending_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO pending_count
  FROM display_content dc
  WHERE dc.status = 'pending'
    AND dc.masjid_id = ANY(
      SELECT ma.masjid_id 
      FROM masjid_admins ma 
      WHERE ma.user_id = admin_user_id
    );
  
  RETURN COALESCE(pending_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve content with notes
CREATE OR REPLACE FUNCTION approve_content(
  content_id UUID,
  approver_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS display_content AS $$
DECLARE
  updated_content display_content;
BEGIN
  -- Check if user is admin of the masjid
  IF NOT EXISTS (
    SELECT 1 
    FROM display_content dc
    JOIN masjid_admins ma ON dc.masjid_id = ma.masjid_id
    WHERE dc.id = content_id 
      AND ma.user_id = approver_id
  ) THEN
    RAISE EXCEPTION 'User not authorized to approve content for this masjid';
  END IF;

  -- Update content status
  UPDATE display_content
  SET 
    status = 'active',
    approved_by = approver_id,
    approved_at = NOW(),
    approval_notes = notes,
    updated_at = NOW()
  WHERE id = content_id
    AND status = 'pending'
  RETURNING * INTO updated_content;

  IF updated_content.id IS NULL THEN
    RAISE EXCEPTION 'Content not found or not in pending status';
  END IF;

  RETURN updated_content;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject content with reason
CREATE OR REPLACE FUNCTION reject_content(
  content_id UUID,
  approver_id UUID,
  reason TEXT,
  notes TEXT DEFAULT NULL
)
RETURNS display_content AS $$
DECLARE
  updated_content display_content;
BEGIN
  -- Check if user is admin of the masjid
  IF NOT EXISTS (
    SELECT 1 
    FROM display_content dc
    JOIN masjid_admins ma ON dc.masjid_id = ma.masjid_id
    WHERE dc.id = content_id 
      AND ma.user_id = approver_id
  ) THEN
    RAISE EXCEPTION 'User not authorized to reject content for this masjid';
  END IF;

  -- Update content status
  UPDATE display_content
  SET 
    status = 'rejected',
    approved_by = approver_id,
    approved_at = NOW(),
    rejection_reason = reason,
    approval_notes = notes,
    updated_at = NOW()
  WHERE id = content_id
    AND status = 'pending'
  RETURNING * INTO updated_content;

  IF updated_content.id IS NULL THEN
    RAISE EXCEPTION 'Content not found or not in pending status';
  END IF;

  RETURN updated_content;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Triggers for approval workflow
-- ============================================================================

-- Function to notify about content approval status changes
CREATE OR REPLACE FUNCTION notify_content_approval_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Insert notification for real-time subscriptions
    PERFORM pg_notify(
      'content_approval_changed',
      json_build_object(
        'content_id', NEW.id,
        'masjid_id', NEW.masjid_id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'approved_by', NEW.approved_by,
        'approval_notes', NEW.approval_notes,
        'rejection_reason', NEW.rejection_reason,
        'submitted_by', NEW.submitted_by
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for approval notifications
CREATE TRIGGER content_approval_notification_trigger
  AFTER UPDATE ON display_content
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_content_approval_change();

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON COLUMN display_content.approval_notes IS 'Admin notes provided during approval/rejection process';
COMMENT ON COLUMN display_content.resubmission_of IS 'Reference to original content if this is a resubmission';
COMMENT ON FUNCTION get_resubmission_history(UUID) IS 'Returns the complete resubmission history for a content item';
COMMENT ON FUNCTION get_pending_approvals_count(UUID) IS 'Returns count of pending approvals for a masjid admin';
COMMENT ON FUNCTION approve_content(UUID, UUID, TEXT) IS 'Approves content with admin notes';
COMMENT ON FUNCTION reject_content(UUID, UUID, TEXT, TEXT) IS 'Rejects content with reason and optional notes';