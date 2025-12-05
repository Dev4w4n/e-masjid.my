# E-Masjid.My Simplification Plan

**Date**: December 4, 2025  
**Status**: Awaiting Approval  
**Goal**: Simplify the project to a clean POC by removing unnecessary features and complexity

---

## Executive Summary

This plan outlines the simplification of E-Masjid.My from a complex multi-approval system to a clean POC with:

- **2 User Roles**: Super Admin and Masjid Admin only
- **No Approval Workflows**: Masjid admins directly create content without approval
- **Retained Apps**: TV Display and Public app remain fully functional
- **Removed Features**: User approval system, sponsorships, content approval workflows

---

## Current State Analysis

### Database Tables (Current)

✅ **KEEP**:

- `users` - Core authentication
- `profiles` - User profile data
- `masjids` - Mosque data
- `masjid_admins` - Admin assignments
- `tv_displays` - TV display configurations
- `display_content` - Content for TV displays
- `prayer_times` - Prayer time schedules
- `prayer_time_config` - Prayer time settings
- `display_content_assignments` - Content-to-display mappings
- `display_status` - Display monitoring
- `display_analytics` - Analytics data
- `content_preview_sessions` - Preview functionality

❌ **REMOVE**:

- `user_approvals` (Migration 019, 020) - User approval workflow
- `sponsorships` (Migration 007) - Sponsorship system
- `admin_applications` (Migration 005) - Admin application workflow
- Approval-related columns in `display_content`:
  - `approval_notes`
  - `resubmission_of`
  - `approved_by`
  - `approved_at`
  - `rejection_reason`

### User Roles (Simplified)

**BEFORE**: `public`, `registered`, `masjid_admin`, `super_admin`  
**AFTER**: `masjid_admin`, `super_admin`

**New Flow**:

1. User registers → automatically becomes `masjid_admin` (assigned by super admin)
2. Super admin assigns masjid_admins to specific mosques
3. Masjid admins create content directly (no approval needed)
4. Content status: `pending` → `active` (simple workflow)

---

## Detailed Changes

### 1. Database Schema Cleanup

#### Migrations to Remove/Revamp

- ❌ `005_create_admin_applications.sql` - Remove entirely
- ❌ `009_extend_display_content_for_approval.sql` - Remove approval columns
- ❌ `019_create_user_approvals.sql` - Remove entirely
- ❌ `020_add_user_approvals_rls.sql` - Remove entirely
- 🔧 `007_create_tv_display_tables.sql` - Remove sponsorship table and related fields
- 🔧 `023_add_super_admin_full_permissions.sql` - Remove sponsorship policies

#### display_content Table Changes

**Remove Columns**:

```sql
- approval_notes TEXT
- resubmission_of UUID
- approved_by UUID
- approved_at TIMESTAMP
- rejection_reason TEXT
- sponsorship_amount DECIMAL
- sponsorship_tier sponsorship_tier
- payment_status payment_status
- payment_reference VARCHAR
```

**Keep Columns**:

```sql
- id, masjid_id, display_id
- title, description, type, url, thumbnail_url
- duration, start_date, end_date
- status (simplified: 'draft', 'active', 'inactive')
- submitted_by, submitted_at
- file_size, file_type
- created_at, updated_at
```

#### tv_displays Table Changes

**Remove Columns**:

```sql
- show_sponsorship_amounts BOOLEAN
- sponsorship_tier_colors JSONB
```

### 2. Package Cleanup

#### Packages to Remove

- ❌ `packages/user-approval/` - Entire package

#### Packages to Update

- 🔧 `packages/content-management/` - Remove approval workflow logic
- 🔧 `packages/shared-types/` - Remove approval/sponsorship types
- 🔧 `packages/supabase-client/` - Remove approval/sponsorship functions

#### Removed Types (from shared-types)

```typescript
// Remove from types/
- SponsorshipRecord types
- ApproveSponsorshipRequest
- SponsorshipRecordWithRelations
- User approval types
- Approval workflow types
- Content approval types (ApproveContentRequest, etc.)
```

### 3. Hub App Simplification

#### Pages/Routes to Remove

- `/content/approvals` - Content approval dashboard
- `/admin/approvals` - User approval dashboard
- `/admin/applications` - Admin application dashboard
- `/sponsorship/*` - Sponsorship management

#### Pages/Routes to Keep & Simplify

- `/content/create` - Direct content creation (no approval)
- `/content/my-content` - User's content list
- `/admin/masjids` - Masjid management (super admin)
- `/admin/users` - User & admin assignment (super admin)
- `/admin/display-settings` - Display configuration

#### Simplified Content Creation Flow

```
Masjid Admin → Create Content → Save as Draft
                                 ↓
                             Publish (Active)
                                 ↓
                         TV Display Shows Content
```

### 4. Super Admin Capabilities

- ✅ Create/edit/delete masjids
- ✅ Assign users as masjid admins
- ✅ Remove masjid admin assignments
- ✅ View all content across all masjids
- ✅ Edit TV display configurations
- ✅ Update JAKIM zones

### 5. Masjid Admin Capabilities

- ✅ Create/edit/delete content for their masjid
- ✅ Configure TV displays for their masjid
- ✅ Manage prayer times for their masjid
- ✅ View analytics for their masjid
- ❌ Cannot create content for other masjids
- ❌ Cannot approve other users

---

## Migration Strategy

### Phase 1: Database Cleanup (Breaking Changes)

1. Create new clean migrations in `supabase/migrations/`
2. Backup current database
3. Drop removed tables:
   ```sql
   DROP TABLE user_approvals CASCADE;
   DROP TABLE sponsorships CASCADE;
   DROP TABLE admin_applications CASCADE;
   ```
4. Remove columns from existing tables
5. Update RLS policies to remove approval logic
6. Simplify functions/triggers

### Phase 2: Type System Update

1. Update `packages/shared-types/`
2. Remove sponsorship/approval types
3. Simplify content types
4. Update validation functions
5. Generate new TypeScript types from Supabase

### Phase 3: Package Cleanup

1. Delete `packages/user-approval/`
2. Update `packages/content-management/` - remove approval logic
3. Update `packages/supabase-client/` - remove approval functions
4. Update workspace dependencies

### Phase 4: Hub App Refactor

1. Remove approval-related pages
2. Simplify content creation forms
3. Update admin dashboards
4. Remove sponsorship UI components
5. Test all user flows

### Phase 5: Verification

1. Test TV Display app - ensure content still displays
2. Test Public app - ensure functionality intact
3. Test Hub app - all simplified flows work
4. Run E2E tests
5. Update documentation

---

## Files to Delete

```
packages/user-approval/                          # Entire package
apps/hub/src/pages/content/approvals.tsx        # Approval UI
apps/hub/src/pages/admin/user-approvals.tsx     # User approval UI
apps/hub/src/pages/admin/applications.tsx       # Admin applications
apps/hub/src/pages/sponsorship/                 # Sponsorship pages
apps/hub/src/components/approval/               # Approval components
supabase/migrations/005_create_admin_applications.sql
supabase/migrations/009_extend_display_content_for_approval.sql
supabase/migrations/019_create_user_approvals.sql
supabase/migrations/020_add_user_approvals_rls.sql
```

---

## New Clean Migration File

Create: `supabase/migrations/100_simplification_cleanup.sql`

```sql
-- ============================================================================
-- SIMPLIFICATION CLEANUP
-- Remove user approval, sponsorship, and content approval systems
-- ============================================================================

-- Drop tables
DROP TABLE IF EXISTS user_approvals CASCADE;
DROP TABLE IF EXISTS sponsorships CASCADE;
DROP TABLE IF EXISTS admin_applications CASCADE;

-- Drop enums
DROP TYPE IF EXISTS user_approval_status CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS sponsorship_tier CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;

-- Remove columns from display_content
ALTER TABLE display_content
  DROP COLUMN IF EXISTS approval_notes,
  DROP COLUMN IF EXISTS resubmission_of,
  DROP COLUMN IF EXISTS approved_by,
  DROP COLUMN IF EXISTS approved_at,
  DROP COLUMN IF EXISTS rejection_reason,
  DROP COLUMN IF EXISTS sponsorship_amount,
  DROP COLUMN IF EXISTS sponsorship_tier,
  DROP COLUMN IF EXISTS payment_status,
  DROP COLUMN IF EXISTS payment_reference;

-- Remove columns from tv_displays
ALTER TABLE tv_displays
  DROP COLUMN IF EXISTS show_sponsorship_amounts,
  DROP COLUMN IF EXISTS sponsorship_tier_colors;

-- Remove columns from profiles (user approval related)
ALTER TABLE profiles
  DROP COLUMN IF EXISTS home_masjid_approved_at;

-- Simplify content_status enum
ALTER TYPE content_status RENAME TO content_status_old;
CREATE TYPE content_status AS ENUM ('draft', 'active', 'inactive', 'expired');

-- Migrate existing data
ALTER TABLE display_content
  ALTER COLUMN status TYPE content_status
  USING (
    CASE
      WHEN status::text = 'pending' THEN 'draft'::content_status
      WHEN status::text = 'active' THEN 'active'::content_status
      WHEN status::text = 'expired' THEN 'expired'::content_status
      WHEN status::text = 'rejected' THEN 'inactive'::content_status
      ELSE 'draft'::content_status
    END
  );

DROP TYPE content_status_old;

-- Drop approval-related functions
DROP FUNCTION IF EXISTS validate_user_approval() CASCADE;
DROP FUNCTION IF EXISTS process_approved_user() CASCADE;
DROP FUNCTION IF EXISTS prevent_home_masjid_change() CASCADE;
DROP FUNCTION IF EXISTS create_user_approval_on_home_masjid_set() CASCADE;
DROP FUNCTION IF EXISTS get_pending_user_approvals(UUID) CASCADE;
DROP FUNCTION IF EXISTS approve_user_registration(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS reject_user_registration(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS validate_admin_application() CASCADE;
DROP FUNCTION IF EXISTS process_approved_application() CASCADE;
DROP FUNCTION IF EXISTS get_pending_applications() CASCADE;
DROP FUNCTION IF EXISTS approve_admin_application(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS reject_admin_application(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS approve_content(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS reject_content(UUID, UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_resubmission_history(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_pending_approvals_count(UUID) CASCADE;

-- Update RLS policies (remove approval-related policies)
-- ... (detailed policy updates)

-- Comments
COMMENT ON TABLE display_content IS 'Content for TV displays - simplified without approval workflow';
COMMENT ON TYPE content_status IS 'Simplified content status: draft, active, inactive, expired';
```

---

## Testing Checklist

### Database

- [ ] All removed tables are dropped
- [ ] All removed columns are dropped
- [ ] RLS policies work correctly
- [ ] Super admin can assign masjid admins
- [ ] Masjid admins can create content

### Hub App

- [ ] Content creation works (no approval)
- [ ] Content list displays correctly
- [ ] Super admin can manage users
- [ ] Super admin can assign admins
- [ ] No broken links to removed pages

### TV Display App

- [ ] Content displays correctly
- [ ] Real-time updates work
- [ ] Prayer times display
- [ ] QR codes work

### Public App

- [ ] All features remain functional
- [ ] No references to removed features

---

## Rollback Plan

If issues arise:

1. Restore database from backup
2. Revert code changes via git
3. Run `pnpm install` and `pnpm run build:clean`
4. Restart services

---

## Estimated Timeline

- **Phase 1**: Database Cleanup - 2 hours
- **Phase 2**: Type System Update - 1 hour
- **Phase 3**: Package Cleanup - 1 hour
- **Phase 4**: Hub App Refactor - 3 hours
- **Phase 5**: Verification - 2 hours

**Total**: ~9 hours

---

## Next Steps

**BEFORE PROCEEDING**: Review this plan and confirm:

1. ✅ Approach is acceptable
2. ✅ No critical features are being removed inadvertently
3. ✅ TV Display and Public apps will remain functional
4. ✅ Ready to proceed with breaking changes

**TO START**: Reply "Proceed with simplification" or request modifications.

---

## Success Criteria

✅ Only 2 user roles: super_admin and masjid_admin  
✅ No approval workflows anywhere  
✅ Masjid admins create content directly  
✅ No sponsorship system  
✅ TV Display app works perfectly  
✅ Public app works perfectly  
✅ Hub app is clean and simple  
✅ All tests pass  
✅ Build succeeds without errors
