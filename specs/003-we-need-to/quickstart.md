# Quickstart Guide: Content Management and Approval System

**Feature**: Hub App Content Management and Approval System  
**Date**: 24 September 2025  
**Purpose**: End-to-end validation scenarios for testing feature implementation

## Prerequisites

Before running this quickstart, ensure:

1. **Development Environment Setup**:

   ```bash
   cd /path/to/e-masjid-my
   pnpm install
   ./scripts/setup-supabase.sh  # Initialize test data
   ```

2. **Required Test Data**:
   - Test users (content creator, masjid admin)
   - Test masjid with admin relationships
   - Supabase local development running

3. **Hub App Running**:
   ```bash
   cd apps/hub
   pnpm dev
   ```

## Test Scenarios

### Scenario 1: User Content Creation Flow

**Goal**: Validate that registered users can create content and submit it for approval

**Steps**:

1. **Navigate to Hub App**: `http://localhost:5173`
2. **Sign in as Test User**:
   - Email: `test-user@example.com`
   - Password: `testpassword123`
3. **Access Content Creation**:
   - Navigate to `/content/create` (will be implemented)
   - Should see content creation form
4. **Create Image Content**:
   - Title: "Test Eid Announcement"
   - Description: "Community Eid celebration details"
   - Type: Select "Image"
   - Upload test image file (< 10MB, JPG/PNG)
   - Select target masjid from dropdown
   - Set duration: 15 seconds
   - Set date range: Today to +7 days
   - Click "Submit for Approval"
5. **Verify Submission**:
   - Should see success message
   - Content status should be "Pending"
   - Should appear in user's content history
   - Admin should receive notification

**Expected Results**:

- Content created with `status = 'pending'`
- `submitted_by` field set to current user ID
- `masjid_id` field set to selected masjid
- Thumbnail generated for uploaded image
- Real-time notification sent to masjid admins

### Scenario 2: YouTube Content Creation

**Goal**: Validate YouTube video content submission

**Steps**:

1. **Access Content Creation** (from Scenario 1)
2. **Create YouTube Content**:
   - Title: "Friday Khutbah Highlights"
   - Description: "Key sermon points"
   - Type: Select "YouTube Video"
   - URL: `https://youtube.com/watch?v=dQw4w9WgXcQ`
   - Select same masjid
   - Set duration: 30 seconds
   - Set date range: Today to +5 days
   - Click "Submit for Approval"
3. **Verify YouTube Processing**:
   - Should extract video thumbnail automatically
   - Should validate YouTube URL format
   - Should create content with proper metadata

**Expected Results**:

- Content created with YouTube URL
- Thumbnail extracted from YouTube API
- URL validation prevents invalid formats
- Same approval workflow as image content

### Scenario 3: Admin Approval Dashboard

**Goal**: Validate that masjid admins can review and approve content

**Steps**:

1. **Sign out current user**
2. **Sign in as Masjid Admin**:
   - Email: `admin@testmasjid.com`
   - Password: `adminpassword123`
3. **Access Admin Dashboard**:
   - Navigate to `/admin/approvals` (will be implemented)
   - Should see pending approvals list
4. **Review Content**:
   - Should see content from Scenarios 1 & 2
   - Each item should show:
     - Content preview (thumbnail)
     - Title and description
     - Submitter name
     - Submission date
     - Approve/Reject buttons
5. **Approve First Content**:
   - Click "Approve" on Eid announcement
   - Add approval note: "Great content for community"
   - Confirm approval
6. **Reject Second Content**:
   - Click "Reject" on YouTube content
   - Add rejection reason: "Please provide higher quality video"
   - Confirm rejection

**Expected Results**:

- First content: `status = 'active'`, `approved_by` set, `approved_at` timestamp
- Second content: `status = 'rejected'`, rejection reason stored
- Real-time notifications sent to content creators
- Content removed from pending approvals list

### Scenario 4: Content Creator Notifications

**Goal**: Validate that users receive approval/rejection notifications

**Steps**:

1. **Switch back to test user account** (from Scenario 1)
2. **Check Notifications**:
   - Should see approval notification for Eid content
   - Should see rejection notification for YouTube content
3. **View Content History**:
   - Navigate to `/content/my-content` (will be implemented)
   - Should see both content items with updated statuses
   - Approved content should show "Active" status
   - Rejected content should show rejection reason
4. **Resubmit Rejected Content**:
   - Click "Resubmit" on rejected YouTube content
   - Modify content (new YouTube URL)
   - Add note: "Updated with higher quality video"
   - Submit for approval again

**Expected Results**:

- Real-time notifications display correctly
- Content history shows accurate statuses
- Rejection reasons are visible to creator
- Resubmission creates new content linked to original
- New submission enters pending status

### Scenario 5: Display Settings Configuration

**Goal**: Validate that admins can configure TV display settings

**Steps**:

1. **As Masjid Admin** (continue from Scenario 3)
2. **Access Display Settings**:
   - Navigate to `/admin/display-settings` (will be implemented)
   - Should see current display configuration
3. **Modify Settings**:
   - Carousel interval: Change to 12 seconds
   - Auto refresh: Change to 3 minutes
   - Transition type: Change to "slide"
   - Max content items: Change to 15
   - Prayer time position: Change to "top"
   - Click "Save Settings"
4. **Verify Changes**:
   - Settings should update immediately
   - Should see success confirmation
   - Changes should persist on page refresh

**Expected Results**:

- Display settings update in `tv_displays` table
- Settings validation prevents invalid values
- Changes apply to live TV display (if connected)
- Admin-only access enforced

### Scenario 6: Live Display Integration

**Goal**: Validate that approved content appears on TV display

**Steps**:

1. **Access TV Display App**: `http://localhost:3000`
2. **Configure Display**:
   - Select test masjid from dropdown
   - Should load display with approved content
3. **Verify Content Display**:
   - Should show approved Eid announcement from Scenario 3
   - Should NOT show rejected YouTube content
   - Should respect carousel interval settings (12 seconds)
   - Should use slide transitions
4. **Test Real-time Updates**:
   - Keep TV display open
   - Approve more content as admin
   - Approved content should appear in rotation automatically

**Expected Results**:

- Only approved content displays
- Content rotates according to admin settings
- Real-time updates work without page refresh
- Display respects date ranges for content

### Scenario 7: Permission Enforcement

**Goal**: Validate that permissions are properly enforced

**Steps**:

1. **Test Cross-Masjid Access**:
   - As admin for Masjid A, try to approve content for Masjid B
   - Should be blocked with permission error
2. **Test Self-Approval Prevention**:
   - As admin, submit content to own masjid
   - Try to approve own content
   - Should be blocked with conflict of interest error
3. **Test Unauthorized Access**:
   - Sign out all users
   - Try to access `/admin/approvals`
   - Should redirect to login
4. **Test Regular User Restrictions**:
   - As regular user, try to access admin pages
   - Should see "Access denied" message

**Expected Results**:

- RLS policies prevent unauthorized data access
- UI blocks admin actions for wrong masjid
- Authentication required for all admin functions
- Role-based access control works correctly

## Performance Validation

### Load Testing Scenarios

**Content Upload Performance**:

- Upload 10MB image file
- Should complete within 10 seconds
- Should show upload progress

**Approval Dashboard Performance**:

- Load page with 50+ pending approvals
- Should render within 2 seconds
- Should support pagination smoothly

**Real-time Update Performance**:

- With 5+ concurrent users
- Approval notifications should arrive within 1 second
- No memory leaks with long-running subscriptions

## Data Validation

### Database State Verification

After completing all scenarios, verify database state:

```sql
-- Check content creation
SELECT COUNT(*) FROM display_content WHERE submitted_by = (
  SELECT id FROM users WHERE email = 'test-user@example.com'
);
-- Expected: 3 (original 2 + 1 resubmission)

-- Check approval decisions
SELECT status, COUNT(*) FROM display_content GROUP BY status;
-- Expected: pending (1), active (1), rejected (1)

-- Check admin activity
SELECT approved_by, COUNT(*) FROM display_content
WHERE approved_by IS NOT NULL GROUP BY approved_by;
-- Expected: 1 admin with 2 decisions

-- Check display settings updates
SELECT carousel_interval, auto_refresh_interval
FROM tv_displays WHERE masjid_id = (
  SELECT id FROM masjids WHERE name = 'Test Masjid'
);
-- Expected: 12, 3
```

## Troubleshooting

### Common Issues

**Content Upload Fails**:

- Check file size (< 10MB)
- Verify file type (JPG, PNG, WebP)
- Ensure Supabase storage permissions

**Approval Dashboard Empty**:

- Verify admin user has masjid_admin relationship
- Check RLS policies on display_content table
- Ensure test content exists with pending status

**Real-time Updates Not Working**:

- Check Supabase connection
- Verify subscription filters
- Check browser console for errors

**Permission Errors**:

- Verify user authentication
- Check masjid_admin relationships
- Review RLS policy definitions

### Reset Test Environment

To reset for clean testing:

```bash
# Reset database to clean state
./scripts/setup-supabase.sh --reset

# Clear browser cache and localStorage
# Restart hub and tv-display apps
```

## Success Criteria

This quickstart is complete when all scenarios pass with:

✅ **Content Creation**: Users can create image and YouTube content  
✅ **Approval Workflow**: Admins can approve/reject with notifications  
✅ **Display Integration**: Approved content appears on TV display  
✅ **Settings Management**: Admins can configure display behavior  
✅ **Permission Enforcement**: Proper access controls throughout  
✅ **Real-time Updates**: Notifications and updates work instantly  
✅ **Performance**: All operations complete within acceptable time

## Next Steps

Once quickstart scenarios pass:

1. **Run Full Test Suite**: `pnpm test`
2. **Performance Testing**: Load test with realistic data volumes
3. **Security Audit**: Verify all permission scenarios
4. **User Acceptance**: Demo to stakeholders
5. **Production Deployment**: Deploy to staging environment

---

_This quickstart validates the complete content management and approval workflow from end to end._
