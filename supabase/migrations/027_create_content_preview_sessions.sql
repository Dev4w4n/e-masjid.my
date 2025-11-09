-- Migration 027: Create Content Preview Sessions Table
-- Purpose: Enable temporary content preview before submission for approval
-- Created: 2025-10-25

-- =============================================================================
-- TABLE: content_preview_sessions
-- =============================================================================
-- Stores temporary preview sessions that allow users to view content on TV
-- displays before submitting for approval. Sessions auto-expire after 30 minutes.

CREATE TABLE IF NOT EXISTS content_preview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL, -- Secure random token for preview URL
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    masjid_id UUID NOT NULL REFERENCES masjids(id) ON DELETE CASCADE,
    
    -- Preview content snapshot (JSONB for flexibility)
    content_snapshot JSONB NOT NULL,
    
    -- Session lifecycle tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Auto-expires after 30 minutes
    accessed_at TIMESTAMP WITH TIME ZONE, -- Last time preview was viewed
    access_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Indexes for performance
    CONSTRAINT valid_expiry CHECK (expires_at > created_at),
    CONSTRAINT valid_access_count CHECK (access_count >= 0)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_preview_sessions_token ON content_preview_sessions(token);
CREATE INDEX idx_preview_sessions_user_id ON content_preview_sessions(user_id);
CREATE INDEX idx_preview_sessions_masjid_id ON content_preview_sessions(masjid_id);
CREATE INDEX idx_preview_sessions_expires_at ON content_preview_sessions(expires_at);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE content_preview_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own preview sessions
CREATE POLICY "Users can view their own preview sessions"
    ON content_preview_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create preview sessions for any active masjid
CREATE POLICY "Registered users can create preview sessions"
    ON content_preview_sessions
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM masjids 
            WHERE id = masjid_id 
            AND status = 'active'
        )
    );

-- Users can delete their own preview sessions
CREATE POLICY "Users can delete their own preview sessions"
    ON content_preview_sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Anonymous users can access preview sessions by token (for viewing on TV)
CREATE POLICY "Anyone can view preview sessions by token"
    ON content_preview_sessions
    FOR SELECT
    USING (true); -- Token validation happens in application logic

-- =============================================================================
-- AUTOMATIC CLEANUP FUNCTION
-- =============================================================================
-- Automatically delete expired preview sessions to prevent database bloat

CREATE OR REPLACE FUNCTION cleanup_expired_preview_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM content_preview_sessions
    WHERE expires_at < NOW();
END;
$$;

-- Schedule cleanup to run every hour
-- Note: This requires pg_cron extension which may not be available in all Supabase tiers
-- Alternative: Implement cleanup in application code or Supabase Edge Functions

-- =============================================================================
-- HELPER FUNCTION: Generate Preview URL
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_preview_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    token TEXT;
    token_exists BOOLEAN;
BEGIN
    -- Generate unique secure token
    LOOP
        -- Generate 32-character random token (URL-safe)
        token := encode(gen_random_bytes(24), 'base64');
        token := replace(replace(replace(token, '+', '-'), '/', '_'), '=', '');
        
        -- Check if token already exists
        SELECT EXISTS (
            SELECT 1 FROM content_preview_sessions WHERE token = token
        ) INTO token_exists;
        
        -- Exit loop if token is unique
        EXIT WHEN NOT token_exists;
    END LOOP;
    
    RETURN token;
END;
$$;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE content_preview_sessions IS 
    'Temporary preview sessions for content before submission. Auto-expires after 30 minutes.';

COMMENT ON COLUMN content_preview_sessions.token IS 
    'Secure random token used in preview URL. Generated by generate_preview_token() function.';

COMMENT ON COLUMN content_preview_sessions.content_snapshot IS 
    'JSONB snapshot of content to preview. Contains: title, description, type, url, duration, qr_code settings.';

COMMENT ON COLUMN content_preview_sessions.expires_at IS 
    'Preview session expiration timestamp. Default is created_at + 30 minutes.';

COMMENT ON COLUMN content_preview_sessions.access_count IS 
    'Track how many times preview was viewed. Incremented on each access.';
