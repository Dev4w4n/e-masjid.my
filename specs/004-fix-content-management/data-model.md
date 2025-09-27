# Data Model: Content Management Recovery

**Context**: Extending existing display_content table for approval workflow  
**Approach**: Minimal additions to preserve existing TV display functionality  
**Database**: PostgreSQL with Supabase extensions

## Current Schema Analysis

### Existing Tables (Working)

```sql
-- From migration 007_create_tv_display_tables.sql
CREATE TABLE display_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  masjid_id UUID NOT NULL REFERENCES masjids(id) ON DELETE CASCADE,
  display_id UUID REFERENCES tv_displays(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type content_type NOT NULL, -- 'image', 'youtube_video', 'text_announcement', 'event_poster'
  url TEXT NOT NULL,
  thumbnail_url TEXT,

  -- Approval fields (basic)
  status content_status NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'expired', 'rejected'
  submitted_by UUID NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,

  -- Display settings
  duration INTEGER NOT NULL DEFAULT 10,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),

  -- Sponsorship (existing)
  sponsorship_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  sponsorship_tier sponsorship_tier,

  -- Metadata
  file_size BIGINT,
  file_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Required Extensions

### Migration 009: Approval Workflow Enhancement

```sql
-- Add approval workflow columns to existing display_content table
ALTER TABLE display_content
ADD COLUMN approval_notes TEXT,
ADD COLUMN resubmission_of UUID REFERENCES display_content(id);

-- Add index for resubmission tracking
CREATE INDEX idx_display_content_resubmission ON display_content(resubmission_of);

-- Update RLS policies to handle approval workflow
CREATE POLICY "Users can resubmit their own content" ON display_content
  FOR INSERT WITH CHECK (
    resubmission_of IS NULL
    OR (
      SELECT submitted_by FROM display_content
      WHERE id = NEW.resubmission_of
    ) = auth.uid()
  );
```

### Content Types (Existing Enums - No Changes)

```sql
-- Already defined in migration 007
CREATE TYPE content_type AS ENUM (
  'image',
  'youtube_video',
  'text_announcement',
  'event_poster'
);

CREATE TYPE content_status AS ENUM (
  'pending',    -- Submitted for approval
  'active',     -- Approved and displaying
  'expired',    -- Past end_date
  'rejected'    -- Rejected by admin
);
```

## TypeScript Interface Definitions

### Core Content Model

```typescript
// packages/content-management/src/types/content.ts
export interface DisplayContent {
  id: string;
  masjid_id: string;
  display_id?: string;
  title: string;
  description?: string;
  type: ContentType;
  url: string;
  thumbnail_url?: string;

  // Approval workflow
  status: ContentStatus;
  submitted_by: string;
  submitted_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  approval_notes?: string; // NEW
  resubmission_of?: string; // NEW

  // Display settings
  duration: number;
  start_date: string;
  end_date: string;

  // Sponsorship
  sponsorship_amount: number;
  sponsorship_tier?: SponsorshipTier;

  // Metadata
  file_size?: number;
  file_type?: string;
  created_at: string;
  updated_at: string;
}

export type ContentType =
  | "image"
  | "youtube_video"
  | "text_announcement"
  | "event_poster";
export type ContentStatus = "pending" | "active" | "expired" | "rejected";
export type SponsorshipTier = "bronze" | "silver" | "gold" | "platinum";
```

### Create/Update Models

```typescript
export interface CreateContentRequest {
  masjid_id: string;
  display_id?: string;
  title: string;
  description?: string;
  type: ContentType;
  url: string;
  thumbnail_url?: string;
  duration?: number;
  start_date?: string;
  end_date?: string;
  sponsorship_amount?: number;
  resubmission_of?: string;
}

export interface ApprovalRequest {
  content_id: string;
  action: "approve" | "reject";
  notes?: string;
  approved_by: string;
}

export interface ContentFilters {
  masjid_id?: string;
  status?: ContentStatus[];
  type?: ContentType[];
  submitted_by?: string;
  date_from?: string;
  date_to?: string;
}
```

## API Contract Models

### Content Management Endpoints

```typescript
// POST /api/content - Create content
interface CreateContentResponse {
  data: DisplayContent;
  success: boolean;
  error?: string;
}

// GET /api/content - List content
interface ListContentResponse {
  data: DisplayContent[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
  };
  success: boolean;
}

// PATCH /api/content/{id}/approve - Approve/reject content
interface ApproveContentResponse {
  data: DisplayContent;
  success: boolean;
  notification_sent: boolean;
}

// GET /api/approvals - Pending approvals for admin
interface PendingApprovalsResponse {
  data: {
    content: DisplayContent;
    submitter: {
      id: string;
      email: string;
      full_name?: string;
    };
    resubmission_history?: DisplayContent[];
  }[];
  count: number;
}
```

## Database Access Patterns

### Content CRUD Operations

```sql
-- Create content (user submission)
INSERT INTO display_content (
  masjid_id, title, type, url, submitted_by,
  start_date, end_date, duration, resubmission_of
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- List content for masjid admin
SELECT dc.*, u.email as submitter_email, u.full_name as submitter_name
FROM display_content dc
JOIN users u ON dc.submitted_by = u.id
WHERE dc.masjid_id = ANY(get_user_admin_masjids())
ORDER BY dc.created_at DESC;

-- Approve content
UPDATE display_content
SET
  status = 'active',
  approved_by = $1,
  approved_at = NOW(),
  approval_notes = $2
WHERE id = $3 AND masjid_id = ANY(get_user_admin_masjids())
RETURNING *;

-- Get pending approvals with submitter info
SELECT
  dc.*,
  u.email,
  u.full_name,
  orig.title as original_title
FROM display_content dc
JOIN users u ON dc.submitted_by = u.id
LEFT JOIN display_content orig ON dc.resubmission_of = orig.id
WHERE dc.status = 'pending'
  AND dc.masjid_id = ANY(get_user_admin_masjids())
ORDER BY dc.created_at ASC;
```

### RLS Policy Extensions

```sql
-- Allow users to view approval status of their own content
CREATE POLICY "Users can view their own content approval status" ON display_content
  FOR SELECT USING (submitted_by = auth.uid());

-- Allow admins to view pending approvals with full details
CREATE POLICY "Admins can view pending approvals" ON display_content
  FOR SELECT USING (
    status = 'pending'
    AND masjid_id = ANY(get_user_admin_masjids())
  );
```

## File Upload Handling

### Image Content

```typescript
interface ImageUploadConfig {
  max_file_size: 10 * 1024 * 1024; // 10MB
  allowed_types: ['image/jpeg', 'image/png', 'image/webp'];
  storage_bucket: 'content-images';
  thumbnail_generation: true;
  compression_quality: 0.8;
}
```

### YouTube Content

```typescript
interface YouTubeValidation {
  url_patterns: [
    /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]+/,
    /^https:\/\/youtu\.be\/[\w-]+/
  ];
  extract_video_id: (url: string) => string;
  generate_thumbnail: (video_id: string) => string;
  validate_accessibility: boolean; // Check if video is public
}
```

## Notification Events

### Real-time Subscription Topics

```typescript
interface ContentNotificationEvent {
  type: "content_status_changed";
  content_id: string;
  old_status: ContentStatus;
  new_status: ContentStatus;
  masjid_id: string;
  approved_by?: string;
  approval_notes?: string;
  timestamp: string;
}

// Supabase real-time subscription
const subscription = supabase
  .channel("content-approvals")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "display_content",
      filter: `masjid_id=in.(${userMasjidIds.join(",")})`,
    },
    handleContentUpdate
  )
  .subscribe();
```

## Data Validation Rules

### Business Rules

```typescript
const contentValidation = {
  title: {
    required: true,
    min_length: 3,
    max_length: 255,
  },
  duration: {
    min: 5,
    max: 300, // 5 minutes max
    default: 10,
  },
  date_range: {
    start_date: "today_or_future",
    end_date: "after_start_date",
    max_duration_days: 30,
  },
  resubmission: {
    max_attempts: 3,
    cooling_period_hours: 24,
  },
};
```

---

**Schema Impact**: Minimal - only 2 new columns added to existing table  
**Migration Risk**: Low - additive changes only  
**Backward Compatibility**: Full - existing TV display functionality preserved
