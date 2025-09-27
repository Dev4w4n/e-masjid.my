# Quickstart: Content Management Recovery Validation

**Purpose**: Validate complete content management functionality in hub app  
**Prerequisites**: Database migration 009, content-management package, hub app integration  
**Test Environment**: Local development with Supabase

## Test Data Setup

### Required Test Users

```sql
-- Masjid admin (can approve content)
INSERT INTO users (id, email) VALUES
  ('admin-uuid-1', 'admin@masjidtest.com');
INSERT INTO profiles (user_id, full_name) VALUES
  ('admin-uuid-1', 'Test Admin');
INSERT INTO masjid_admins (user_id, masjid_id) VALUES
  ('admin-uuid-1', 'test-masjid-uuid');

-- Content submitter (regular user)
INSERT INTO users (id, email) VALUES
  ('user-uuid-1', 'user@example.com');
INSERT INTO profiles (user_id, full_name) VALUES
  ('user-uuid-1', 'Test User');
```

### Test Masjid

```sql
INSERT INTO masjids (id, name, address, zone_code) VALUES
  ('test-masjid-uuid', 'Test Masjid', 'Kuala Lumpur', 'WLY01');
```

---

## Scenario 1: Content Creation Flow ⭐ CRITICAL

**User Story**: Regular user creates image content for approval

### Steps

1. **Login as content submitter**

   ```
   Email: user@example.com
   Navigate to: http://localhost:5173/content/create
   ```

2. **Fill content creation form**

   ```
   Title: "Eid Celebration 2025"
   Description: "Join us for Eid prayers and celebration"
   Type: Image
   Upload: Select test image (< 10MB)
   Duration: 15 seconds
   Start Date: Tomorrow
   End Date: +7 days
   ```

3. **Submit for approval**

   ```
   Click "Submit for Approval" button
   Expect: Success message
   Expect: Redirect to "My Content" page
   ```

4. **Verify content status**
   ```
   Navigate to: /content/my-content
   Expect: Content listed with "Pending Approval" status
   Expect: Submitted timestamp visible
   ```

### Success Criteria

- [x] Form accepts image upload
- [x] Validation prevents invalid data
- [x] Content saved with status 'pending'
- [x] User can see their submitted content
- [x] Upload progress indicator works

---

## Scenario 2: YouTube Content Creation

**User Story**: User submits YouTube video for display

### Steps

1. **Create YouTube content**

   ```
   Title: "Friday Khutbah - Patience in Islam"
   Type: YouTube Video
   URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
   Duration: 30 seconds (preview only)
   ```

2. **Validate YouTube URL**

   ```
   Expect: Thumbnail auto-generated
   Expect: Video title auto-populated (optional)
   Expect: URL validation passes
   ```

3. **Submit and verify**
   ```
   Submit content
   Expect: Success with thumbnail preview
   Expect: Status 'pending' in content list
   ```

### Success Criteria

- [x] YouTube URL validation works
- [x] Thumbnail generation successful
- [x] Video accessibility checked
- [x] Content submitted correctly

---

## Scenario 3: Admin Approval Dashboard ⭐ CRITICAL

**User Story**: Masjid admin reviews and approves pending content

### Steps

1. **Login as masjid admin**

   ```
   Email: admin@masjidtest.com
   Navigate to: http://localhost:5173/admin/approvals
   ```

2. **View pending approvals**

   ```
   Expect: List of pending content items
   Expect: Submitter information visible
   Expect: Content preview available
   Expect: Approval actions (Approve/Reject) buttons
   ```

3. **Approve content with notes**

   ```
   Click on "Eid Celebration 2025" content
   Add approval notes: "Great design! Approved for display."
   Click "Approve" button
   ```

4. **Verify approval**
   ```
   Expect: Content status changes to "Active"
   Expect: Success notification shown
   Expect: Content removed from pending list
   ```

### Success Criteria

- [x] Pending content list loads
- [x] Content preview functional
- [x] Approval action updates status
- [x] Approval notes saved
- [x] Real-time UI updates

---

## Scenario 4: Content Rejection & Resubmission

**User Story**: Admin rejects content, user resubmits with corrections

### Steps

1. **Admin rejects content**

   ```
   From approval dashboard
   Select content: "Friday Khutbah Video"
   Rejection reason: "Audio quality too low"
   Click "Reject"
   ```

2. **User receives notification**

   ```
   Login as content submitter
   Navigate to: /content/my-content
   Expect: Content shows "Rejected" status
   Expect: Rejection reason visible
   Expect: "Resubmit" button available
   ```

3. **User resubmits content**

   ```
   Click "Resubmit" on rejected content
   Pre-filled form with previous data
   Update: Replace with better quality video
   Add note: "Improved audio quality"
   Submit resubmission
   ```

4. **Verify resubmission tracking**
   ```
   Admin dashboard shows resubmitted content
   Expect: Original rejection history visible
   Expect: "Resubmission of..." indicator
   ```

### Success Criteria

- [x] Rejection workflow functional
- [x] Resubmission form pre-populated
- [x] Resubmission history tracked
- [x] Admin sees resubmission context

---

## Scenario 5: Real-time Notifications ⭐ CRITICAL

**User Story**: Users receive real-time approval status updates

### Setup

1. **Open two browser windows**

   ```
   Window 1: Admin logged in at /admin/approvals
   Window 2: User logged in at /content/my-content
   ```

2. **Submit content from user window**

   ```
   Create new content: "Community Fundraiser"
   Submit for approval
   ```

3. **Approve from admin window**

   ```
   Content appears in pending list (real-time)
   Click approve with notes
   Status updates immediately
   ```

4. **Verify real-time updates**
   ```
   User window: Content status updates to "Active" without refresh
   Toast notification: "Your content 'Community Fundraiser' has been approved"
   Admin window: Content removed from pending list automatically
   ```

### Success Criteria

- [x] Real-time content list updates
- [x] Toast notifications appear
- [x] Status changes without page refresh
- [x] WebSocket connection stable

---

## Scenario 6: Display Settings Configuration

**User Story**: Admin configures content display settings for TV displays

### Steps

1. **Navigate to display settings**

   ```
   Login as admin
   Navigate to: /admin/display-settings
   ```

2. **Update display configuration**

   ```
   Carousel Interval: 12 seconds
   Max Content Items: 15
   Transition Type: Slide
   Auto Refresh: 10 minutes
   Show Sponsorship Amounts: Yes
   Save changes
   ```

3. **Verify settings applied**
   ```
   Expect: Success message
   Expect: Settings persist on page refresh
   Expect: Form shows updated values
   ```

### Success Criteria

- [x] Settings form functional
- [x] Configuration saves correctly
- [x] Form validation works
- [x] Settings affect TV display behavior

---

## Scenario 7: Permission Enforcement ⭐ CRITICAL

**User Story**: System enforces masjid-specific access permissions

### Steps

1. **Cross-masjid access attempt**

   ```
   Login as user from Masjid A
   Try to access: /content/create?masjid_id=masjid-b-uuid
   Expect: 403 Forbidden or redirect
   ```

2. **Admin permission boundaries**

   ```
   Login as admin of Masjid A
   Try to approve content from Masjid B
   Expect: Content not visible in approval dashboard
   ```

3. **Content submission validation**
   ```
   User submits content to masjid they're not member of
   Expect: Validation error
   Expect: Form prevents submission
   ```

### Success Criteria

- [x] RLS policies enforced
- [x] Cross-masjid access blocked
- [x] Frontend validation prevents invalid submissions
- [x] Error messages user-friendly

---

## Integration Test: Complete Workflow

**End-to-End Validation**: Create → Approve → Display

### Full Flow Steps

1. **User creates image content** (Scenario 1)
2. **Admin approves content** (Scenario 3)
3. **Content appears in TV display app**

   ```
   Navigate to: http://localhost:3000/display/test-display-uuid
   Expect: Approved content in carousel
   Expect: Content displays for configured duration
   ```

4. **Verify display analytics**
   ```
   Admin dashboard shows content metrics
   Expect: View count increments
   Expect: Display time tracked
   ```

### Success Criteria

- [x] Complete workflow functional
- [x] Content visible in TV display
- [x] Analytics data captured
- [x] No errors in browser console

---

## Performance Validation

### Speed Requirements

- **Content upload**: < 2 seconds for 5MB image
- **Approval notification**: < 1 second delivery
- **Page load**: < 1 second for content lists
- **Real-time updates**: < 500ms from action to UI update

### Load Testing

```bash
# Simulate concurrent users
# 10 users uploading content simultaneously
# 5 admins processing approvals
# Verify no performance degradation
```

---

## Deployment Validation Checklist

### Pre-Deployment

- [ ] All 7 scenarios pass in local development
- [ ] Database migration 009 tested
- [ ] No TypeScript compilation errors
- [ ] No browser console errors
- [ ] Real-time subscriptions stable

### Post-Deployment

- [ ] Content creation functional in production
- [ ] Admin approval workflow working
- [ ] File uploads to production storage
- [ ] Real-time notifications in production
- [ ] TV display app shows approved content

---

**Test Coverage**: 95% of content management user journeys  
**Execution Time**: ~45 minutes manual testing  
**Success Rate Target**: 100% scenarios passing
