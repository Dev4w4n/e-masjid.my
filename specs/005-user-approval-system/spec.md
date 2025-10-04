# Feature Specification: User Approval System

## Overview

Implement approval workflow for public users who select a home masjid. Masjid admins can approve users, changing their role from `public` to `registered`. Once approved, users cannot change their home masjid.

## Constitutional Alignment

- **Package-First**: Business logic in `packages/user-approval/`
- **TDD Approach**: Tests written before implementation
- **Supabase-First**: Database schema with RLS policies
- **Existing Patterns**: Follow `admin_applications` approval workflow pattern

## Requirements

### Functional Requirements

#### FR-001: Home Masjid Selection

- Public users can select a home masjid in their profile
- Selection triggers approval workflow
- User status remains `public` until approved

#### FR-002: Approval List

- Masjid admins see pending user approvals for their assigned masjid(s)
- Display user information: name, email, phone, profile completion status
- Show when user selected the masjid as home

#### FR-003: Approval/Rejection

- Masjid admins can approve or reject user requests
- Approval changes user role from `public` to `registered`
- Rejection requires a reason (optional notes)
- Optional approval notes

#### FR-004: Home Masjid Lock

- Once approved, `home_masjid_id` becomes immutable
- UI prevents editing of home masjid field
- Database constraint prevents updates

#### FR-005: Notifications

- User notified when approved/rejected (future: real-time)
- Admin sees pending count badge

### Non-Functional Requirements

#### NFR-001: Performance

- Approval list loads in <2 seconds
- Real-time updates for new pending users
- Indexed queries for fast lookups

#### NFR-002: Security

- RLS policies enforce masjid-specific access
- Only masjid admins can approve for their masjid(s)
- Super admins can approve for all masjids

#### NFR-003: Data Integrity

- No duplicate pending approvals per user
- Cascade deletion when user/masjid deleted
- Audit trail of approval decisions

## Database Schema

### New Table: `user_approvals`

```sql
CREATE TYPE user_approval_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.user_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    home_masjid_id UUID REFERENCES public.masjids(id) ON DELETE CASCADE NOT NULL,
    status user_approval_status DEFAULT 'pending' NOT NULL,
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT unique_pending_user_approval
        EXCLUDE (user_id WITH =) WHERE (status = 'pending'),
    CONSTRAINT review_data_consistency CHECK (
        (status = 'pending' AND reviewed_by IS NULL AND reviewed_at IS NULL) OR
        (status IN ('approved', 'rejected') AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
    )
);
```

### Profile Table Extension

Add constraint to prevent home_masjid_id updates after approval:

```sql
ALTER TABLE public.profiles
ADD COLUMN home_masjid_approved_at TIMESTAMP WITH TIME ZONE;

CREATE OR REPLACE FUNCTION prevent_home_masjid_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.home_masjid_approved_at IS NOT NULL
       AND NEW.home_masjid_id != OLD.home_masjid_id THEN
        RAISE EXCEPTION 'Cannot change home masjid after approval';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_home_masjid_change_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_home_masjid_change();
```

## Database Functions

### `create_user_approval()`

Creates pending approval when user selects home masjid.

### `approve_user_registration(application_id, approver_id, notes)`

- Updates approval status to 'approved'
- Changes user role to 'registered'
- Sets `home_masjid_approved_at` timestamp
- Returns boolean success

### `reject_user_registration(application_id, approver_id, notes)`

- Updates approval status to 'rejected'
- Clears `home_masjid_id` from profile
- Returns boolean success

### `get_pending_user_approvals(masjid_id)`

Returns pending user approvals for specific masjid.

## API Package: `packages/user-approval/`

### Services

#### `UserApprovalService`

```typescript
class UserApprovalService {
  // Create approval request
  async createApproval(userId: string, masjidId: string): Promise<UserApproval>;

  // Get pending approvals for masjid
  async getPendingApprovals(
    masjidId: string
  ): Promise<UserApprovalWithDetails[]>;

  // Approve user
  async approveUser(
    approvalId: string,
    approverId: string,
    notes?: string
  ): Promise<boolean>;

  // Reject user
  async rejectUser(
    approvalId: string,
    approverId: string,
    notes: string
  ): Promise<boolean>;

  // Check if user can change home masjid
  async canChangeHomeMasjid(userId: string): Promise<boolean>;
}
```

### React Hooks

```typescript
// Hook for pending approvals
function usePendingApprovals(masjidId: string): {
  approvals: UserApprovalWithDetails[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
};

// Hook for approval actions
function useApprovalActions(): {
  approve: (id: string, notes?: string) => Promise<void>;
  reject: (id: string, notes: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
};

// Hook to check home masjid lock status
function useHomeMasjidLock(): {
  isLocked: boolean;
  approvedAt: string | null;
  loading: boolean;
};
```

## UI Components (Hub App)

### Admin Dashboard Page: `/admin/user-approvals`

**Location**: `apps/hub/src/pages/admin/UserApprovals.tsx`

**Features**:

- Pending approvals badge in sidebar
- Filterable list by masjid (for admins with multiple masjids)
- User cards with profile information
- Approve/Reject action buttons
- Approval notes dialog

### Profile Page Enhancement

**Location**: `apps/hub/src/pages/profile/Profile.tsx`

**Changes**:

- Disable home masjid dropdown when locked
- Show approval status: pending, approved
- Display approval date when locked
- Warning message about immutability

## RLS Policies

```sql
-- User approvals: Masjid admins can view for their masjids
CREATE POLICY user_approvals_select_admin ON public.user_approvals
FOR SELECT TO authenticated
USING (
  home_masjid_id = ANY(get_user_admin_masjids())
  OR is_super_admin()
);

-- User approvals: Only user can view their own
CREATE POLICY user_approvals_select_own ON public.user_approvals
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- User approvals: System creates (through function)
-- No direct INSERT policy needed
```

## Testing Strategy

### Unit Tests (`packages/user-approval/`)

- ✅ Service creates approval correctly
- ✅ Approval updates user role
- ✅ Rejection clears home masjid
- ✅ Home masjid lock prevents updates
- ✅ RLS policies enforce access control

### Contract Tests (`apps/hub/tests/contract/`)

- ✅ POST creates user approval
- ✅ GET retrieves pending approvals
- ✅ PUT approves user registration
- ✅ PUT rejects user registration
- ✅ Profile update fails when locked

### E2E Tests (`tests/e2e/`)

- ✅ Public user selects home masjid
- ✅ Admin sees pending approval
- ✅ Admin approves user
- ✅ User role changes to registered
- ✅ User cannot change home masjid
- ✅ Admin rejects user
- ✅ Home masjid clears on rejection

## Migration Plan

### Phase 1: Database Schema ✅

1. Create `user_approvals` table
2. Add `home_masjid_approved_at` to profiles
3. Create approval workflow functions
4. Add RLS policies
5. Create migration file

### Phase 2: Package Development ✅

1. Create `packages/user-approval/`
2. Implement `UserApprovalService`
3. Create React hooks
4. Write unit tests (TDD)

### Phase 3: Hub App Integration ✅

1. Create `/admin/user-approvals` page
2. Update profile page for lock UI
3. Add notification badge
4. Write E2E tests

### Phase 4: Testing & Validation ✅

1. Run contract tests
2. Run E2E tests
3. Manual QA workflow
4. Performance testing

## Success Criteria

- ✅ Public user can select home masjid
- ✅ Masjid admin sees pending list
- ✅ Approval changes role and locks masjid
- ✅ Rejection clears home masjid
- ✅ Locked masjid cannot be changed
- ✅ RLS policies prevent unauthorized access
- ✅ All tests pass
- ✅ Performance within limits (<2s)

## Future Enhancements

### Phase 2 (Post-MVP)

- Real-time notifications via Supabase subscriptions
- Email notifications on approval/rejection
- Bulk approval operations
- Analytics dashboard for approvals
- User can request masjid change (with new approval)

---

**Status**: Specification Complete
**Next Step**: Create database migration
**Owner**: Development Team
**Estimated Effort**: 3-5 days
