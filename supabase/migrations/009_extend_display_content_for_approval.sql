-- Migration 009: Extend display_content for approval workflow
-- Adds fields for content management and approval system

-- ============================================================================
-- Extend display_content table for approval workflow
-- ============================================================================

-- Add new fields for approval workflow
ALTER TABLE display_content 
  ADD COLUMN approval_notes TEXT,
  ADD COLUMN resubmission_of UUID REFERENCES display_content(id);

-- Add index for resubmission tracking
CREATE INDEX idx_display_content_resubmission ON display_content(resubmission_of);

-- ============================================================================
-- Update RLS policies for content management
-- ============================================================================

-- Update existing policy to allow content creators to view their own submissions
DROP POLICY IF EXISTS "Users can view content for their masjids" ON display_content;

CREATE POLICY "Users can view content for their masjids or their own submissions" ON display_content
  FOR SELECT USING (
    masjid_id = ANY(get_user_admin_masjids())
    OR submitted_by = auth.uid() -- Users can see their own submissions
    OR status = 'active' -- Public displays can see active content
  );

-- Allow users to update their own rejected content for resubmission
CREATE POLICY "Users can update their rejected content for resubmission" ON display_content
  FOR UPDATE USING (
    submitted_by = auth.uid() 
    AND status = 'rejected'
  ) WITH CHECK (
    submitted_by = auth.uid() 
    AND status = 'pending' -- Can only resubmit as pending
  );

-- ============================================================================
-- Functions for approval workflow
-- ============================================================================

-- Function to approve content
CREATE OR REPLACE FUNCTION approve_content(
  p_content_id UUID,
  p_approved_by UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_masjid_id UUID;
  v_is_admin BOOLEAN := FALSE;
BEGIN
  -- Get the masjid_id for the content
  SELECT masjid_id INTO v_masjid_id
  FROM display_content
  WHERE id = p_content_id;
  
  -- Check if user is admin for this masjid
  SELECT v_masjid_id = ANY(get_user_admin_masjids()) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'User is not authorized to approve content for this masjid';
  END IF;
  
  -- Update the content
  UPDATE display_content
  SET 
    status = 'active',
    approved_by = p_approved_by,
    approved_at = NOW(),
    approval_notes = p_notes,
    updated_at = NOW()
  WHERE id = p_content_id
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject content
CREATE OR REPLACE FUNCTION reject_content(
  p_content_id UUID,
  p_rejected_by UUID,
  p_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_masjid_id UUID;
  v_is_admin BOOLEAN := FALSE;
BEGIN
  -- Get the masjid_id for the content
  SELECT masjid_id INTO v_masjid_id
  FROM display_content
  WHERE id = p_content_id;
  
  -- Check if user is admin for this masjid
  SELECT v_masjid_id = ANY(get_user_admin_masjids()) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'User is not authorized to reject content for this masjid';
  END IF;
  
  -- Update the content
  UPDATE display_content
  SET 
    status = 'rejected',
    approved_by = p_rejected_by,
    approved_at = NOW(),
    rejection_reason = p_reason,
    approval_notes = p_reason,
    updated_at = NOW()
  WHERE id = p_content_id
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending approvals for a masjid admin
CREATE OR REPLACE FUNCTION get_pending_approvals(p_masjid_id UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  type content_type,
  url TEXT,
  thumbnail_url TEXT,
  submitted_by UUID,
  submitter_email TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.title,
    dc.description,
    dc.type,
    dc.url,
    dc.thumbnail_url,
    dc.submitted_by,
    p.email as submitter_email,
    dc.submitted_at,
    dc.duration
  FROM display_content dc
  LEFT JOIN profiles p ON dc.submitted_by = p.user_id
  WHERE dc.masjid_id = p_masjid_id
    AND dc.status = 'pending'
  ORDER BY dc.submitted_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Add notifications table for real-time updates
-- ============================================================================

CREATE TABLE content_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES display_content(id) ON DELETE CASCADE,
  masjid_id UUID NOT NULL REFERENCES masjids(id) ON DELETE CASCADE,
  
  notification_type VARCHAR(50) NOT NULL, -- 'approval_needed', 'approved', 'rejected', 'resubmitted'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_notification_type CHECK (
    notification_type IN ('approval_needed', 'approved', 'rejected', 'resubmitted')
  )
);

-- Indexes for notifications
CREATE INDEX idx_content_notifications_user_id ON content_notifications(user_id);
CREATE INDEX idx_content_notifications_masjid_id ON content_notifications(masjid_id);
CREATE INDEX idx_content_notifications_unread ON content_notifications(user_id, is_read);
CREATE INDEX idx_content_notifications_created ON content_notifications(created_at DESC);

-- Enable RLS on notifications
ALTER TABLE content_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON content_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON content_notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Function to create notification
CREATE OR REPLACE FUNCTION create_content_notification(
  p_user_id UUID,
  p_content_id UUID,
  p_masjid_id UUID,
  p_notification_type VARCHAR,
  p_title VARCHAR,
  p_message TEXT
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO content_notifications (
    user_id,
    content_id,
    masjid_id,
    notification_type,
    title,
    message
  ) VALUES (
    p_user_id,
    p_content_id,
    p_masjid_id,
    p_notification_type,
    p_title,
    p_message
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Triggers for automatic notifications
-- ============================================================================

-- Function to handle content status changes and create notifications
CREATE OR REPLACE FUNCTION handle_content_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_submitter_notification_id UUID;
  v_admin_user_id UUID;
  v_admin_notification_id UUID;
  v_masjid_name VARCHAR;
BEGIN
  -- Get masjid name for notifications
  SELECT name INTO v_masjid_name 
  FROM masjids 
  WHERE id = NEW.masjid_id;
  
  -- Handle different status changes
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    -- New content submitted - notify masjid admins
    FOR v_admin_user_id IN 
      SELECT user_id 
      FROM masjid_admins 
      WHERE masjid_id = NEW.masjid_id 
        AND is_active = TRUE
    LOOP
      SELECT create_content_notification(
        v_admin_user_id,
        NEW.id,
        NEW.masjid_id,
        'approval_needed',
        'New Content Awaiting Approval',
        format('New content "%s" has been submitted to %s and requires your approval.', NEW.title, v_masjid_name)
      ) INTO v_admin_notification_id;
    END LOOP;
    
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' THEN
    IF NEW.status = 'active' THEN
      -- Content approved - notify submitter
      SELECT create_content_notification(
        NEW.submitted_by,
        NEW.id,
        NEW.masjid_id,
        'approved',
        'Content Approved',
        format('Your content "%s" has been approved and is now live at %s.', NEW.title, v_masjid_name)
      ) INTO v_submitter_notification_id;
      
    ELSIF NEW.status = 'rejected' THEN
      -- Content rejected - notify submitter
      SELECT create_content_notification(
        NEW.submitted_by,
        NEW.id,
        NEW.masjid_id,
        'rejected',
        'Content Rejected',
        format('Your content "%s" was rejected. Reason: %s', NEW.title, COALESCE(NEW.rejection_reason, 'No reason provided'))
      ) INTO v_submitter_notification_id;
    END IF;
    
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'rejected' AND NEW.status = 'pending' THEN
    -- Content resubmitted - notify admins
    FOR v_admin_user_id IN 
      SELECT user_id 
      FROM masjid_admins 
      WHERE masjid_id = NEW.masjid_id 
        AND is_active = TRUE
    LOOP
      SELECT create_content_notification(
        v_admin_user_id,
        NEW.id,
        NEW.masjid_id,
        'resubmitted',
        'Content Resubmitted for Approval',
        format('Content "%s" has been resubmitted to %s and requires your review.', NEW.title, v_masjid_name)
      ) INTO v_admin_notification_id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for content status changes
CREATE TRIGGER content_status_change_notification
  AFTER INSERT OR UPDATE OF status ON display_content
  FOR EACH ROW EXECUTE FUNCTION handle_content_status_change();

-- ============================================================================
-- Views for easier querying
-- ============================================================================

-- View for content with submitter information
CREATE VIEW content_with_submitter AS
SELECT 
  dc.*,
  p.email as submitter_email,
  p.full_name as submitter_name,
  m.name as masjid_name
FROM display_content dc
LEFT JOIN profiles p ON dc.submitted_by = p.user_id
LEFT JOIN masjids m ON dc.masjid_id = m.id;

-- View for pending approvals with detailed information
CREATE VIEW pending_approvals_detailed AS
SELECT 
  dc.id,
  dc.title,
  dc.description,
  dc.type,
  dc.url,
  dc.thumbnail_url,
  dc.masjid_id,
  m.name as masjid_name,
  dc.submitted_by,
  p.email as submitter_email,
  p.full_name as submitter_name,
  dc.submitted_at,
  dc.duration,
  dc.sponsorship_amount,
  dc.file_size,
  dc.file_type
FROM display_content dc
LEFT JOIN profiles p ON dc.submitted_by = p.user_id
LEFT JOIN masjids m ON dc.masjid_id = m.id
WHERE dc.status = 'pending'
ORDER BY dc.submitted_at ASC;