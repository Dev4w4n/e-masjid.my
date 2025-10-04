# Quickstart Guide: User Approval System

## Overview

This system implements approval workflow for public users selecting their home masjid. Once approved by masjid admins, users are promoted to 'registered' role and their home masjid selection becomes permanent.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│ Public User │────1───>│ Select Home  │────2───>│ Pending      │
│             │         │ Masjid       │         │ Approval     │
└─────────────┘         └──────────────┘         └──────┬───────┘
                                                          │
                                                          │ 3
                                                          v
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│ Registered  │<───5────│ Masjid Admin │────4───>│ Approve/     │
│ User        │         │ Reviews      │         │ Reject       │
└─────────────┘         └──────────────┘         └──────────────┘
```

##

Implementation Steps

### Phase 1: Database Setup ✅

**Run Migrations**:

```bash
# Reset database (will run all migrations)
cd supabase
supabase db reset
```

**Verify Tables**:

```sql
-- Check user_approvals table
SELECT * FROM user_approvals LIMIT 1;

-- Check profiles has new column
\d profiles
-- Should see: home_masjid_approved_at
```

**Generate TypeScript Types**:

```bash
supabase gen types typescript --local > packages/shared-types/src/database.types.ts
```

### Phase 2: Install Package ✅

```bash
pnpm install
pnpm run build:clean
```

### Phase 3: Test the Workflow

#### 3.1. Create Public User

```bash
# Using psql or Supabase UI
INSERT INTO auth.users (id, email) VALUES
  ('...uuid...', 'ahmad@example.com');

-- User should be created with role='public' automatically
```

#### 3.2. Select Home Masjid

```typescript
import { profileService } from "@masjid-suite/supabase-client";

// Update profile with home masjid
await profileService.upsertProfile({
  user_id: "ahmad-user-id",
  home_masjid_id: "masjid-id",
});

// Approval record created automatically via trigger!
```

#### 3.3. Check Pending Approvals (as Masjid Admin)

```typescript
import { UserApprovalService } from "@masjid-suite/user-approval";

// Get pending approvals for your masjid
const pending = await UserApprovalService.getPendingApprovals("masjid-id");

console.log(pending);
// [
//   {
//     approval_id: '...',
//     user_id: 'ahmad-user-id',
//     user_email: 'ahmad@example.com',
//     user_full_name: 'Ahmad bin Ali',
//     user_phone: '+60123456789',
//     profile_complete: true,
//     requested_at: '2025-10-03T10:00:00Z'
//   }
// ]
```

#### 3.4. Approve User

```typescript
// As masjid admin
const success = await UserApprovalService.approveUser({
  approval_id: "approval-id",
  approver_id: "admin-user-id",
  notes: "Approved - active member of community",
});

// User role changes to 'registered' automatically
// home_masjid_approved_at is set
```

#### 3.5. Verify Home Masjid is Locked

```typescript
// Try to change home masjid
await profileService.upsertProfile({
  user_id: "ahmad-user-id",
  home_masjid_id: "different-masjid-id", // ❌ Should fail!
});

// Error: "Cannot change home masjid after approval. Home masjid was approved on..."
```

### Phase 4: Hub App Integration

#### 4.1. Create User Approvals Page

```bash
# Location: apps/hub/src/pages/admin/UserApprovals.tsx
```

```typescript
import React from 'react';
import { UserApprovalService } from '@masjid-suite/user-approval';
import { useProfile } from '@masjid-suite/auth';

export default function UserApprovals() {
  const profile = useProfile();
  const [pending, setPending] = React.useState([]);

  React.useEffect(() => {
    // Get user's admin masjids
    const loadApprovals = async () => {
      // For each admin masjid, load pending approvals
      const data = await UserApprovalService.getPendingApprovals(masjidId);
      setPending(data);
    };

    loadApprovals();
  }, []);

  const handleApprove = async (approvalId: string) => {
    await UserApprovalService.approveUser({
      approval_id: approvalId,
      approver_id: profile!.user_id,
      notes: 'Approved'
    });

    // Refresh list
  };

  return (
    // UI for approval list
  );
}
```

#### 4.2. Update Profile Page

```typescript
// apps/hub/src/pages/profile/Profile.tsx

import { UserApprovalService } from '@masjid-suite/user-approval';

// Inside component:
const [lockStatus, setLockStatus] = React.useState<HomeMasjidLockStatus>();

React.useEffect(() => {
  UserApprovalService.getHomeMasjidLockStatus(userId).then(setLockStatus);
}, [userId]);

// In form:
<Select
  disabled={lockStatus?.is_locked} // Disable if locked
  helperText={
    lockStatus?.is_locked
      ? `Home masjid approved on ${new Date(lockStatus.approved_at).toLocaleDateString()}`
      : 'Select your home masjid'
  }
>
  {/* masjid options */}
</Select>
```

#### 4.3. Add Route

```typescript
// apps/hub/src/App.tsx

import UserApprovals from './pages/admin/UserApprovals';

// Inside Routes:
<Route
  path="/admin/user-approvals"
  element={
    <ProtectedRoute>
      <WithRole role={["masjid_admin", "super_admin"]}>
        <UserApprovals />
      </WithRole>
    </ProtectedRoute>
  }
/>
```

## Testing Checklist

### Unit Tests

- [ ] UserApprovalService.getPendingApprovals() returns correct data
- [ ] UserApprovalService.approveUser() changes role
- [ ] UserApprovalService.rejectUser() clears home masjid
- [ ] getHomeMasjidLockStatus() returns lock state
- [ ] Rejection requires notes (min 5 chars)

### Integration Tests

- [ ] Trigger creates approval when home_masjid_id set
- [ ] Approval updates user role to 'registered'
- [ ] Home masjid becomes immutable after approval
- [ ] Rejection clears home_masjid_id
- [ ] RLS policies enforce masjid-specific access

### E2E Tests

1. **Public User Flow**:
   - [ ] Sign up as public user
   - [ ] Complete profile
   - [ ] Select home masjid
   - [ ] See "pending approval" status
2. **Admin Approval Flow**:
   - [ ] Sign in as masjid admin
   - [ ] Navigate to user approvals
   - [ ] See pending user in list
   - [ ] Approve user
   - [ ] Verify user role changed
3. **Home Masjid Lock**:
   - [ ] As approved user, try to edit profile
   - [ ] Home masjid field is disabled
   - [ ] Shows approval date
   - [ ] Cannot submit changed masjid

4. **Rejection Flow**:
   - [ ] Admin rejects user
   - [ ] User's home masjid cleared
   - [ ] User can select new masjid
   - [ ] New approval created

## API Reference

### Database Functions

```sql
-- Get pending approvals
SELECT * FROM get_pending_user_approvals('masjid-id');

-- Approve user
SELECT approve_user_registration('approval-id', 'admin-id', 'optional notes');

-- Reject user
SELECT reject_user_registration('approval-id', 'admin-id', 'required notes');

-- Get approval history
SELECT * FROM get_user_approvals_history('masjid-id');
```

### Service Methods

```typescript
// Get pending
const pending = await UserApprovalService.getPendingApprovals(masjidId);

// Get history
const history = await UserApprovalService.getApprovalsHistory(masjidId);

// Approve
await UserApprovalService.approveUser({ approval_id, approver_id, notes? });

// Reject
await UserApprovalService.rejectUser({ approval_id, rejector_id, notes });

// Check lock status
const lock = await UserApprovalService.getHomeMasjidLockStatus(userId);

// Get pending count
const count = await UserApprovalService.getPendingCount(masjidId);

// Subscribe to real-time updates
const unsubscribe = UserApprovalService.subscribeToApprovals(masjidId, (payload) => {
  console.log('Approval updated:', payload);
});
```

## Troubleshooting

### "Cannot find table 'user_approvals'"

Run migrations:

```bash
supabase db reset
```

### "Property 'home_masjid_approved_at' does not exist"

Regenerate types:

```bash
supabase gen types typescript --local > packages/shared-types/src/database.types.ts
pnpm run build:clean
```

### "Only public users can request approval"

Check user role:

```sql
SELECT id, email, role FROM users WHERE email = 'user@example.com';
```

### "Only masjid admins can approve"

Verify admin assignment:

```sql
SELECT * FROM masjid_admins WHERE user_id = 'admin-id' AND masjid_id = 'masjid-id';
```

### RLS blocking access

Check policies:

```sql
SELECT * FROM pg_policies WHERE tablename = 'user_approvals';
```

## Next Steps

1. **Real-time Notifications**: Use Supabase realtime subscriptions
2. **Email Notifications**: Send email on approval/rejection
3. **Bulk Operations**: Approve multiple users at once
4. **Analytics**: Track approval metrics
5. **Change Requests**: Allow users to request masjid change (with re-approval)

---

**Status**: Implementation Ready
**Last Updated**: 3 October 2025
**Maintainer**: Development Team
