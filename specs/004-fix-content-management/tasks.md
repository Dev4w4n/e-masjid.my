# Tasks: Content Management System Recovery & Implementation

**Spec**: 004-fix-content-management  
**Context**: Complete re-implementation of missing content management functionality  
**Priority**: P0 - Hub app currently has no content management features

## Execution Strategy

**Approach**: User-visible features first, then testing validation  
**Rationale**: Stakeholders need to see working functionality immediately  
**Testing**: Implement working features, then add comprehensive tests

## Prerequisites Verification

- [x] Display_content table exists (migration 007)
- [x] Supabase client configured
- [x] Hub app authentication working
- [x] Material-UI v6 components available
- [x] pnpm monorepo structure functional

## Phase 1: Database & Package Foundation (Day 1)

### T001 Create Database Migration 009

**Path**: `./supabase/migrations/009_extend_display_content_for_approval.sql`

```sql
ALTER TABLE display_content
ADD COLUMN approval_notes TEXT,
ADD COLUMN resubmission_of UUID REFERENCES display_content(id);

CREATE INDEX idx_display_content_resubmission ON display_content(resubmission_of);
```

- [ ] Create migration file with approval workflow extensions
- [ ] Add RLS policy for resubmission tracking
- [ ] Test migration runs cleanly with existing data
- [ ] Verify no breaking changes to TV display functionality

### T002 Recreate Content-Management Package Structure

**Path**: `./packages/content-management/`

```
├── package.json (with proper dependencies)
├── tsconfig.json (extending workspace config)
├── src/
│   ├── index.ts (main exports)
│   ├── types/
│   ├── services/
│   ├── hooks/
│   ├── components/
│   └── utils/
└── tests/ (placeholder structure)
```

- [ ] Create package.json with Material-UI v6, React 18+, workspace dependencies
- [ ] Setup TypeScript configuration
- [ ] Initialize src/ directory structure
- [ ] Configure build scripts and exports
- [ ] Verify package builds with `pnpm build`

### T003 Create Core TypeScript Interfaces

**Path**: `./packages/content-management/src/types/`

```typescript
// content.ts - DisplayContent, CreateContentRequest, ApprovalRequest
// display-settings.ts - DisplayConfiguration interfaces
// notifications.ts - Real-time event types
```

- [ ] Define DisplayContent interface matching database schema
- [ ] Create request/response types for API contracts
- [ ] Add validation types and enums
- [ ] Export all types from package index

## Phase 2: Hub App Integration (Day 1-2) ⭐ CRITICAL

### T004 Create Content Creation Page

**Path**: `./apps/hub/src/pages/content/CreateContent.tsx`

- [ ] Build form with Material-UI components (title, description, type selector)
- [ ] Add image upload component with preview
- [ ] Add YouTube URL input with validation
- [ ] Implement form submission to Supabase
- [ ] Add success/error handling with toast notifications
- [ ] Test manual content creation end-to-end

### T005 Create Admin Approval Dashboard Page

**Path**: `./apps/hub/src/pages/admin/ApprovalsDashboard.tsx`

- [ ] List pending content with submitter information
- [ ] Add content preview components (image/YouTube)
- [ ] Implement approve/reject actions with notes
- [ ] Add bulk approval functionality
- [ ] Display resubmission history
- [ ] Test approval workflow manually

### T006 Update Hub App Routing

**Path**: `./apps/hub/src/App.tsx`

```typescript
// Add content management routes with authentication guards
<Route path="content/create" element={<CreateContent />} />
<Route path="content/my-content" element={<MyContent />} />
<Route path="admin/approvals" element={<ApprovalsDashboard />} />
<Route path="admin/display-settings" element={<DisplaySettings />} />
```

- [ ] Add content management routes with proper authentication
- [ ] Add permission guards for admin-only routes
- [ ] Test navigation to all new pages
- [ ] Verify route protection works correctly

### T007 Update Navigation in Layout Component

**Path**: `./apps/hub/src/components/Layout.tsx`

```typescript
// Add content management navigation items
{
  text: "Content",
  icon: <ContentPaste />,
  path: "/content",
  roles: ["masjid_admin", "registered"]
},
{
  text: "Approvals",
  icon: <Assignment />,
  path: "/admin/approvals",
  roles: ["masjid_admin"]
}
```

- [ ] Add "Content" menu section with Create/My Content links
- [ ] Add "Approvals" to admin menu with badge for pending count
- [ ] Add "Display Settings" to admin menu
- [ ] Test navigation visibility based on user roles
- [ ] Verify menu highlighting works for content routes

## Phase 3: Core Package Implementation (Day 2-3)

### T008 Implement Content Service

**Path**: `./packages/content-management/src/services/content.service.ts`

```typescript
// createContent, listContent, updateContent, deleteContent
// File upload to Supabase Storage
// YouTube URL validation and metadata extraction
```

- [ ] Implement CRUD operations using Supabase client
- [ ] Add file upload functionality to Supabase Storage
- [ ] Add YouTube URL validation and thumbnail extraction
- [ ] Handle error cases and validation
- [ ] Test service methods independently

### T009 Implement Approval Service

**Path**: `./packages/content-management/src/services/approval.service.ts`

```typescript
// approveContent, rejectContent, getPendingApprovals
// Real-time subscription to approval status changes
```

- [ ] Implement approval workflow operations
- [ ] Add resubmission handling logic
- [ ] Create notification trigger functions
- [ ] Add real-time subscription setup
- [ ] Test approval state transitions

### T010 Create Content Management Hooks

**Path**: `./packages/content-management/src/hooks/`

```typescript
// useContentManagement, useContentApprovals, useNotifications
// React hooks for state management and real-time updates
```

- [ ] Create useContentManagement hook for CRUD operations
- [ ] Create useContentApprovals hook for admin functionality
- [ ] Create useNotifications hook for real-time updates
- [ ] Add loading states and error handling
- [ ] Test hooks with actual Supabase data

## Phase 4: React Components (Day 3)

### T011 Build ContentCreationForm Component

**Path**: `./packages/content-management/src/components/ContentCreationForm.tsx`

- [ ] Form with validation using Material-UI
- [ ] Image upload with drag-and-drop support
- [ ] YouTube URL input with preview
- [ ] Duration selector and date range picker
- [ ] Form submission with loading states
- [ ] Integration with content service

### T012 Build ApprovalDashboard Component

**Path**: `./packages/content-management/src/components/ApprovalDashboard.tsx`

- [ ] List view of pending content items
- [ ] Content preview cards with thumbnails
- [ ] Approve/reject action buttons
- [ ] Notes input for approval feedback
- [ ] Bulk selection and actions
- [ ] Real-time updates via WebSocket

### T013 Build ContentCard Component

**Path**: `./packages/content-management/src/components/ContentCard.tsx`

- [ ] Display content information (title, type, status)
- [ ] Show thumbnails for images/videos
- [ ] Status indicators with color coding
- [ ] Action buttons based on user permissions
- [ ] Responsive design for mobile/desktop

### T014 Create MyContent Page

**Path**: `./apps/hub/src/pages/content/MyContent.tsx`

- [ ] List user's submitted content with status
- [ ] Filter by status (pending, approved, rejected)
- [ ] Resubmit functionality for rejected content
- [ ] Delete draft content
- [ ] Real-time status updates

## Phase 5: Real-time Features (Day 3-4)

### T015 Implement Notification System

**Path**: `./packages/content-management/src/hooks/useNotifications.ts`

```typescript
// Supabase real-time subscriptions
// Toast notification integration
// Status change event handling
```

- [ ] Setup Supabase real-time channel subscriptions
- [ ] Create notification event handlers
- [ ] Add toast notification integration
- [ ] Handle connection errors and reconnection
- [ ] Test real-time updates between admin and user

### T016 Add Display Settings Management

**Path**: `./apps/hub/src/pages/admin/DisplaySettings.tsx`

- [ ] Form for carousel and display configuration
- [ ] Content filtering settings (types, duration limits)
- [ ] Preview of settings changes
- [ ] Save/reset functionality
- [ ] Integration with TV display app

## Phase 6: Integration Testing (Day 4)

### T017 Manual End-to-End Testing

- [ ] **Scenario 1**: User creates image content → Admin approves → Content displays
- [ ] **Scenario 2**: YouTube content creation and approval workflow
- [ ] **Scenario 3**: Content rejection and resubmission process
- [ ] **Scenario 4**: Real-time notifications between admin and user sessions
- [ ] **Scenario 5**: Display settings configuration affects TV display
- [ ] **Scenario 6**: Permission enforcement (cross-masjid access blocked)

### T018 Performance Validation

- [ ] Content upload completes <2 seconds (5MB image)
- [ ] Approval notifications appear <1 second
- [ ] Content list loads <1 second (50 items)
- [ ] Real-time updates <500ms from action to UI
- [ ] No memory leaks in WebSocket connections

### T019 Browser Compatibility Testing

- [ ] Test in Chrome, Firefox, Safari
- [ ] Mobile responsive design validation
- [ ] Touch interface functionality
- [ ] File upload on mobile devices
- [ ] No JavaScript errors in console

## Phase 7: Polish & Documentation (Day 4)

### T020 Error Handling & User Experience

- [ ] Add proper error messages for all failure cases
- [ ] Loading states for all async operations
- [ ] Confirmation dialogs for destructive actions
- [ ] Input validation with user-friendly messages
- [ ] Offline handling for network issues

### T021 Update Package Documentation

**Path**: `./packages/content-management/README.md`

- [ ] API documentation for exported components/hooks
- [ ] Usage examples for common scenarios
- [ ] Setup and configuration instructions
- [ ] Type definitions reference
- [ ] Troubleshooting guide

### T022 Update Root Documentation

**Path**: `./README.md` (Content Management section)

- [ ] Feature overview and capabilities
- [ ] User guide with screenshots
- [ ] Admin workflow documentation
- [ ] Configuration options
- [ ] Development setup instructions

## Phase 8: Production Readiness (Optional)

### T023 Add Basic E2E Tests (Time Permitting)

**Path**: `./tests/e2e/content-management.spec.ts`

- [ ] Content creation flow test
- [ ] Approval workflow test
- [ ] Real-time notification test
- [ ] Permission enforcement test
- [ ] File upload functionality test

### T024 Database Optimization (Time Permitting)

- [ ] Add database indexes for performance
- [ ] Optimize RLS policies for scale
- [ ] Add database constraints for data integrity
- [ ] Cleanup expired content automatically
- [ ] Monitor query performance

## Success Criteria Checklist

### User-Visible Functionality

- [ ] Hub app shows "Content" in navigation menu
- [ ] Content creation page accepts image uploads and YouTube URLs
- [ ] Admin approval dashboard lists pending content with actions
- [ ] Approve/reject actions update content status immediately
- [ ] Real-time notifications appear for status changes
- [ ] My Content page shows user's submission history
- [ ] Approved content appears in TV display app

### Technical Implementation

- [ ] Content-management package builds without errors
- [ ] Hub app integrates package successfully
- [ ] Database migration 009 runs cleanly
- [ ] All TypeScript types are properly defined
- [ ] Real-time WebSocket connections are stable
- [ ] File uploads work to Supabase Storage
- [ ] Permission enforcement prevents unauthorized access

### Performance & Quality

- [ ] No browser console errors during usage
- [ ] All async operations have loading states
- [ ] Error handling covers edge cases
- [ ] Mobile responsive design works
- [ ] Package follows existing monorepo patterns

## Dependencies & Blocking Issues

**Critical Path**:

- T001 (Migration) → T008/T009 (Services) → T004/T005 (Pages) → T006/T007 (Navigation)

**Parallel Work**:

- T002/T003 (Package setup) can run parallel to T001 (Migration)
- T011-T013 (Components) can be built while T004/T005 (Pages) are in progress
- T015/T016 (Real-time features) can be developed after core CRUD is working

**Risk Mitigation**:

- Test each phase incrementally in browser
- Keep backup of working migration 007 before running 009
- Validate package build after each major component addition
- Test hub app functionality after each navigation/routing change

---

**Estimated Duration**: 4 days  
**Total Tasks**: 24 tasks  
**Focus**: User-visible functionality first, comprehensive testing second  
**Success Metric**: Working content approval workflow visible to end users
