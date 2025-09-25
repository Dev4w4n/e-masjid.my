# Data Model: Content Management and Approval System

**Feature**: Hub App Content Management and Approval System  
**Date**: 24 September 2025  
**Status**: Phase 1 Design Output

## Entity Overview

Based on research findings, this feature extends existing TV display schema rather than creating new tables. The current `display_content` table already supports the core approval workflow with minimal extensions needed.

## Core Entities

### 1. Content (extends existing `display_content` table)

**Purpose**: Represents user-created content submitted for masjid TV displays  
**Lifecycle**: pending → active/rejected → expired

**Key Fields** (existing):

- `id`: UUID primary key
- `masjid_id`: Target masjid for content display
- `title`: User-provided content title
- `description`: Optional content description
- `type`: content_type ENUM ('image', 'youtube_video')
- `url`: File URL or YouTube video URL
- `thumbnail_url`: Generated thumbnail for preview
- `status`: content_status ENUM ('pending', 'active', 'expired', 'rejected')
- `submitted_by`: Content creator user ID
- `approved_by`: Admin who made approval decision
- `approved_at`: Timestamp of approval decision
- `rejection_reason`: Reason for rejection

**Proposed Extensions**:

- `approval_notes`: TEXT - Admin feedback/notes on approval decision
- `resubmission_of`: UUID - Reference to original content if this is a resubmission

**Validation Rules**:

- Title length: 1-255 characters
- Image files: Max 10MB, formats: JPG, PNG, WebP
- YouTube URLs: Must match youtube.com or youtu.be patterns
- Duration: 5-300 seconds for display time
- Date range: start_date ≤ end_date, max 30 days duration

**State Transitions**:

```
pending → active (admin approval)
pending → rejected (admin rejection)
active → expired (automatic, date-based)
rejected → pending (user resubmission)
```

### 2. Approval Request (logical entity, data in `display_content`)

**Purpose**: Represents the approval workflow state for content  
**Implementation**: Uses existing `display_content` fields

**Key Data Points**:

- Content reference (`display_content.id`)
- Requesting user (`submitted_by`)
- Target masjid (`masjid_id`)
- Current status (`status`)
- Decision maker (`approved_by`)
- Decision timestamp (`approved_at`, `updated_at`)
- Decision rationale (`rejection_reason`, `approval_notes`)

**Business Rules**:

- Admins cannot approve their own content
- Only masjid admins can approve content for their masjid
- Rejected content can be modified and resubmitted
- Approved content becomes active if within date range

### 3. Display Configuration (extends existing `tv_displays` table)

**Purpose**: Masjid-specific display settings managed by admins  
**Scope**: Per-masjid display behavior and preferences

**Key Settings** (existing):

- `carousel_interval`: Content rotation timing (seconds)
- `auto_refresh_interval`: Display refresh rate (minutes)
- `content_transition_type`: Visual transition effects
- `max_content_items`: Maximum content items in rotation
- `prayer_time_position`: Prayer times display location
- `show_sponsorship_amounts`: Display sponsorship information

**Admin Controls**:

- Content rotation speed (5-60 seconds)
- Display schedule configuration
- Content approval preferences
- Prayer time display settings
- Sponsorship visibility controls

**Validation Rules**:

- Carousel interval: 5-60 seconds
- Auto refresh: 1-60 minutes
- Max content items: 1-50
- Settings apply immediately to live displays

### 4. User Roles and Permissions (existing entities)

**Registered User**:

- Can create content for any masjid
- Can view own content submission history
- Receives notifications on approval/rejection
- Can resubmit modified rejected content

**Masjid Admin**:

- Can approve/reject content for assigned masjid(s)
- Can configure display settings for assigned masjid(s)
- Can view approval history and analytics
- Cannot approve own submitted content

**Permissions Matrix**:
| Action | Registered User | Masjid Admin | Super Admin |
|--------|----------------|--------------|-------------|
| Create Content | ✓ | ✓ | ✓ |
| Approve Content | ✗ | ✓ (own masjid) | ✓ (all) |
| Reject Content | ✗ | ✓ (own masjid) | ✓ (all) |
| Configure Display | ✗ | ✓ (own masjid) | ✓ (all) |
| View Analytics | ✗ | ✓ (own masjid) | ✓ (all) |

## Relationships

### Primary Relationships

```
User (1) ──────── (N) Content [submitted_by]
User (1) ──────── (N) Content [approved_by]
Masjid (1) ─────── (N) Content [masjid_id]
Masjid (1) ─────── (N) TV_Display [masjid_id]
Content (N) ─────── (1) Content [resubmission_of]
```

### Data Flow

**Content Creation Flow**:

1. User creates content → `display_content.status = 'pending'`
2. Admin receives notification → approval dashboard
3. Admin approves → `status = 'active'`, `approved_by = admin_id`
4. Content appears on TV display → based on date range and settings

**Approval Workflow**:

1. Content submitted → RLS ensures masjid access validation
2. Admin query → filtered by `masjid_id` and `status = 'pending'`
3. Approval decision → update status, timestamps, notes
4. Real-time notification → Supabase subscription to submitting user

## Data Integrity Constraints

### Database Constraints (existing)

- **Date Range**: `end_date >= start_date`
- **Duration**: `duration BETWEEN 5 AND 300` (seconds)
- **Sponsorship**: `sponsorship_amount >= 0`
- **Unique Display Names**: `UNIQUE(masjid_id, display_name)`

### Business Logic Constraints

- **Self-Approval Prevention**: Admin cannot approve content where `submitted_by = approved_by`
- **Masjid Access Control**: Content operations limited by `get_user_admin_masjids()` RLS function
- **Content Limits**: Max 20 active content items per display
- **File Size Limits**: 10MB for images, YouTube videos validated by URL format

## Performance Considerations

### Query Optimization

**High-Frequency Queries**:

- Get pending content for admin: `WHERE masjid_id IN (admin_masjids) AND status = 'pending'`
- Get active content for display: `WHERE masjid_id = ? AND status = 'active' AND date range`
- User content history: `WHERE submitted_by = user_id ORDER BY created_at DESC`

**Existing Indexes** (from schema):

- `idx_display_content_masjid_id`
- `idx_display_content_status`
- `idx_display_content_dates`
- `idx_display_content_submitted_by`

### Caching Strategy

- **Content Thumbnails**: Browser cache + Supabase Storage CDN
- **Display Settings**: Local storage for admin preferences
- **User Permissions**: Session cache for masjid admin lists

## Real-time Updates

### Supabase Subscriptions

**Admin Dashboard**:

```sql
SELECT * FROM display_content
WHERE masjid_id IN (user_masjids)
AND status = 'pending'
```

**User Notifications**:

```sql
SELECT * FROM display_content
WHERE submitted_by = current_user_id
AND status IN ('active', 'rejected')
```

**Live Display**:

```sql
SELECT * FROM display_content
WHERE masjid_id = display_masjid_id
AND status = 'active'
AND current_date BETWEEN start_date AND end_date
```

## Migration Requirements

### Schema Changes

**Minimal Required**:

```sql
-- Add optional approval notes field
ALTER TABLE display_content
ADD COLUMN approval_notes TEXT;

-- Add resubmission tracking
ALTER TABLE display_content
ADD COLUMN resubmission_of UUID REFERENCES display_content(id);

-- Add index for resubmission tracking
CREATE INDEX idx_display_content_resubmission
ON display_content(resubmission_of);
```

### Data Migration

No data migration required - existing content can remain in current state. New workflow applies to future content submissions.

## Testing Data Requirements

### Mock Data Structure

**Test Users**:

- Regular user (content creator)
- Masjid admin (approver)
- Multi-masjid admin (multiple approvals)

**Test Content**:

- Pending image content
- Pending YouTube video content
- Approved content (active)
- Rejected content with reasons
- Expired content

**Test Masjids**:

- Masjid with single admin
- Masjid with multiple admins
- Masjid with different display settings

### E2E Test Data Setup

E2E tests must retrieve live masjid IDs and user IDs from Supabase before execution to ensure test accuracy with real data relationships.

---

_This data model extends the existing comprehensive TV display schema with minimal changes while providing full content management and approval workflow capabilities._
