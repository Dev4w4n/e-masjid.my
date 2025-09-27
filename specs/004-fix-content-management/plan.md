# Plan: Fix Content Management System Implementation

**Feature ID**: 004-fix-content-management  
**Priority**: P0 (Critical - Hub app missing core functionality)  
**Timeline**: 3-4 days  
**Dependencies**: specs/003-we-need-to/ (design complete)

## Problem Statement

The Content Management & Approval System from feature 003 was incompletely implemented:

- ❌ Content-management package source files missing (only compiled artifacts remain)
- ❌ Hub app has no content management pages or navigation
- ❌ Database missing approval workflow extensions
- ❌ No tests implemented (TDD requirement violated)
- ❌ Zero user-visible functionality in hub app

## Solution Overview

**Approach**: Complete re-implementation following existing task specifications from 003-we-need-to/tasks.md, prioritizing user-visible features first.

**Core Strategy**:

1. **Database-first**: Extend display_content table for approval workflow
2. **Package-first**: Recreate content-management package with proper structure
3. **Hub-first**: Add visible pages and navigation immediately
4. **Test-after**: Implement tests to validate working features (pragmatic TDD)

## Technical Architecture

**Framework Stack** (unchanged):

- React 18+ with TypeScript
- Material-UI v6 components
- Supabase backend with RLS
- pnpm monorepo with Turborepo

**Package Dependencies**:

```
hub app → content-management package → shared-types + supabase-client
```

**Database Extensions**:

```sql
ALTER TABLE display_content ADD COLUMN approval_notes TEXT;
ALTER TABLE display_content ADD COLUMN resubmission_of UUID REFERENCES display_content(id);
```

## User Experience Flow

**Masjid Admin Journey**:

1. Navigate to "Content" in hub app sidebar
2. Create image/YouTube content with upload/URL
3. Submit for approval → status: pending
4. Admin reviews in "Admin > Approvals" dashboard
5. Approve/reject with notes → real-time notifications
6. Content appears on TV displays when approved

**Key UI Components**:

- ContentCreationForm (image upload + YouTube URL)
- ApprovalDashboard (pending items with actions)
- ContentCard (preview with approval status)
- NotificationCenter (real-time approval updates)

## Success Criteria

**Functional Requirements**:

- [ ] Hub app shows "Content" and "Approvals" navigation items
- [ ] Users can create and submit image/YouTube content
- [ ] Admins can approve/reject with notes in dashboard
- [ ] Real-time notifications for approval status changes
- [ ] Content appears in TV display app after approval

**Technical Requirements**:

- [ ] Content-management package exports all components/services
- [ ] Database migration 009 extends approval workflow
- [ ] RLS policies enforce masjid-specific access
- [ ] Package builds successfully with TypeScript
- [ ] E2E tests validate complete workflow

**Performance Requirements**:

- [ ] Content upload completes <2 seconds
- [ ] Approval notifications appear <1 second
- [ ] Hub app loads content pages <1 second

## Implementation Strategy

**Phase 1**: Database & Package Foundation

- Create migration 009 for approval workflow
- Recreate content-management package structure
- Implement core types and basic services

**Phase 2**: Hub App Integration (User-Visible)

- Add content creation page with working form
- Add admin approval dashboard with actions
- Update navigation and routing
- Test manually in browser

**Phase 3**: Real-time Features

- Implement notification system
- Add approval workflow logic
- Connect to TV display app

**Phase 4**: Testing & Polish

- Add E2E tests for verified workflows
- Performance optimization
- Documentation updates

## Risk Mitigation

**Missing Source Files**:

- Rebuild from compiled .d.ts files as reference
- Use design documents from specs/003-we-need-to/

**Integration Complexity**:

- Start with simple static pages first
- Add interactivity incrementally
- Test each component in isolation

**Database Consistency**:

- Use existing display_content table structure
- Add minimal required fields only
- Preserve existing RLS policies

## Definition of Done

**User-Visible Features**:

1. Hub app navigation shows "Content Management" sections
2. Content creation form accepts images and YouTube URLs
3. Admin approval dashboard lists pending content
4. Approval/rejection updates content status
5. Approved content visible in TV display app

**Technical Completeness**:

1. Content-management package builds without errors
2. Hub app integrates package successfully
3. Database migration runs cleanly
4. Basic E2E test covers creation → approval → display workflow
5. Code follows existing monorepo patterns

---

**Estimated Effort**: 24-32 hours  
**Completion Target**: 4 days from start  
**Success Metric**: Working content approval workflow visible to end users
