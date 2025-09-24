# Research Report: Hub App Content Management and Approval System

**Date**: 24 September 2025  
**Researcher**: Implementation Planning Agent  
**Purpose**: Technical research for content management and approval workflow implementation

## Current System Analysis

### Existing TV Display Schema

**Decision**: Extend existing comprehensive TV display schema rather than rebuild  
**Rationale**: The current schema (migration 007) already includes sophisticated content management with approval workflow concepts  
**Key findings**:

- `display_content` table exists with `status` enum ('pending', 'active', 'expired', 'rejected')
- `submitted_by` and `approved_by` fields already present for approval workflow
- Content types support images and YouTube videos ('image', 'youtube_video')
- Masjid-specific content via `masjid_id` and `display_id` relationships
- RLS policies already handle masjid admin permissions

### Existing Hub App Structure

**Decision**: Extend hub app with new content management pages and components  
**Rationale**: Hub app already has admin pages (`AdminDashboard`, `AdminApplications`) and masjid management (`MasjidList`, `MasjidView`)  
**Integration points**:

- Add content management routes to existing router structure
- Extend admin pages with content approval functionality
- Leverage existing authentication and role management
- Use established UI patterns with Material-UI components

### Package Architecture Analysis

**Decision**: Create new `content-management` package following existing patterns  
**Rationale**: Existing packages (`auth`, `supabase-client`, `ui-components`) demonstrate clear separation of concerns  
**Package dependencies**:

- Will use `supabase-client` for database operations
- Extend `shared-types` with content management types
- Leverage `ui-components` and `ui-theme` for consistent styling
- Use `auth` package for permission checks

## Technical Research Findings

### 1. Approval Workflow UI Patterns

**Decision**: Implement card-based approval dashboard with bulk actions  
**Rationale**: Material-UI Card components provide excellent content preview capabilities  
**Alternatives considered**:

- Table-based list (rejected: poor content preview)
- Modal-based workflow (rejected: inefficient for bulk operations)
- Kanban board (rejected: overkill for simple approve/reject)

**Implementation approach**:

- Content cards showing thumbnail, title, submitter, masjid
- Approve/Reject buttons with reason dialog
- Bulk selection for multiple approvals
- Status filters (pending, approved, rejected)
- Real-time updates using Supabase subscriptions

### 2. File Upload and Content Creation

**Decision**: Use Supabase Storage for images, embed YouTube videos by URL  
**Rationale**: Aligns with existing infrastructure and handles scaling automatically  
**Alternatives considered**:

- Local file storage (rejected: not scalable)
- External CDN (rejected: added complexity)
- Base64 encoding (rejected: performance issues)

**Implementation approach**:

- Image upload with preview and validation
- YouTube URL validation and thumbnail extraction
- Content type-specific form components
- Progressive upload with retry logic
- File size and format validation

### 3. Real-time Notifications

**Decision**: Use Supabase real-time subscriptions for approval notifications  
**Rationale**: Existing infrastructure supports real-time updates, no additional services needed  
**Alternatives considered**:

- Email notifications (will be secondary addition)
- WebSocket implementation (rejected: reinventing Supabase features)
- Polling-based updates (rejected: inefficient)

**Implementation approach**:

- Subscribe to `display_content` changes filtered by user permissions
- Toast notifications for approval/rejection updates
- Badge counts for pending approvals
- Optional email notifications (future enhancement)

### 4. Display Settings Management

**Decision**: Extend existing `tv_displays` table configuration UI  
**Rationale**: Schema already supports carousel interval and other display settings  
**Current capabilities**:

- `carousel_interval`: Content rotation timing (seconds)
- `auto_refresh_interval`: Display refresh interval (minutes)
- `content_transition_type`: Transition effects
- `prayer_time_position`: Prayer time display location

**Required extensions**:

- UI components for display settings forms
- Real-time preview of settings changes
- Masjid-specific permission enforcement
- Settings validation and constraints

## Integration Requirements

### Database Schema Extensions Required

**Minimal changes needed**:

1. No new tables required - existing schema is comprehensive
2. Possible new fields:
   - `display_content.approval_notes` TEXT - Admin feedback on decisions
   - `display_content.resubmission_of` UUID - Link to original rejected content

### API Endpoints Required

Based on existing patterns in supabase-client package:

- `createContent()` - Submit content for approval
- `getContentForApproval()` - Fetch pending content for admin
- `approveContent()` - Approve content with optional notes
- `rejectContent()` - Reject content with required reason
- `updateDisplaySettings()` - Modify display configuration
- `getContentByMasjid()` - View masjid-specific content

### UI Component Extensions

Following existing ui-components patterns:

- `ContentCreationForm` - Multi-step content submission
- `ApprovalDashboard` - Admin content review interface
- `DisplaySettingsForm` - Display configuration management
- `ContentPreview` - Preview component for different content types
- `ApprovalActions` - Approve/reject action components

## Performance Considerations

### Content Loading Strategy

**Decision**: Implement progressive loading with caching  
**Rationale**: Large images and video thumbnails require efficient loading  
**Approach**:

- Lazy loading for content cards
- Thumbnail generation for uploaded images
- YouTube thumbnail API integration
- Local storage caching for frequently accessed content

### Real-time Update Optimization

**Decision**: Use filtered Supabase subscriptions to minimize data transfer  
**Rationale**: Reduces bandwidth and improves performance  
**Filters**:

- Masjid-specific subscriptions for admins
- Status-based filters (pending only for notifications)
- User-specific subscriptions for content creators

## Security and Permissions

### Row Level Security (RLS) Extensions

**Current state**: RLS policies exist for masjid admin access  
**Required enhancements**:

- Ensure content creators can only submit to accessible masjids
- Prevent approval of own content (conflict of interest)
- Audit trail for all approval decisions

### Content Validation

**Client-side validation**:

- Image file type and size limits
- YouTube URL format validation
- Content title and description requirements

**Server-side validation**:

- File content verification (not just extension)
- YouTube video accessibility checks
- Spam and inappropriate content detection (future)

## Conclusion

The existing system provides an excellent foundation for implementing the content management and approval workflow. The comprehensive TV display schema eliminates the need for major database changes, and the established hub app architecture provides clear patterns for extending functionality.

**Key advantages**:

- Existing approval workflow fields in database
- Established RLS policies for multi-tenant access
- Proven UI patterns in hub app
- Comprehensive content type support

**Implementation path forward**:

1. Create content-management package with service layer
2. Extend hub app with content creation and approval pages
3. Add real-time notifications using existing Supabase subscriptions
4. Implement display settings UI extending current tv_displays management

The research confirms that this feature can be implemented efficiently within the constitutional constraints while leveraging existing infrastructure investments.
