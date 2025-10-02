# Drag-and-Drop Content Ordering Feature

## Overview

This feature allows masjid admins to reorder assigned content in the Display Management page using drag-and-drop functionality. The content order determines the sequence in which content appears in the TV display carousel.

## Implementation Details

### Database Changes

**Migration**: `014_add_display_order_to_assignments.sql`

- Added `display_order` column to `display_content_assignments` table
- Type: `INTEGER NOT NULL DEFAULT 0`
- Index created for efficient querying: `idx_display_content_assignments_order`
- Lower numbers appear first in the carousel

### Type Definitions

**File**: `packages/shared-types/src/tv-display.ts`

Added new interfaces:

```typescript
export interface DisplayContentAssignment {
  id: string;
  display_id: string;
  content_id: string;
  assigned_at: string;
  assigned_by: string;
  display_order: number; // Order in which content appears (0-indexed)
}

export type CreateContentAssignment = Omit<
  DisplayContentAssignment,
  "id" | "assigned_at"
>;

export type UpdateContentAssignment = Partial<
  Omit<DisplayContentAssignment, "id" | "display_id" | "content_id">
>;
```

### Backend Services

**File**: `packages/supabase-client/src/services/display.ts`

#### Updated Functions:

1. **`getAssignedContent()`**
   - Now fetches `display_order` column
   - Orders results by `display_order` (ascending)
   - Returns content in the correct display sequence

2. **`assignContent()`**
   - Automatically calculates the next order number
   - New content is added to the end of the list
   - Sets `display_order` to max + 1

3. **`updateContentOrder()` (NEW)**
   - Updates the order of multiple content items
   - Takes an array of `{ contentId, order }` pairs
   - Batch updates all assignments for a display
   - Returns error if any update fails

### Frontend Implementation

**File**: `apps/hub/src/pages/admin/DisplayManagement.tsx`

#### Dependencies Added:

- `@dnd-kit/core` - Core drag-and-drop functionality
- `@dnd-kit/sortable` - Sortable list components
- `@dnd-kit/utilities` - CSS transform utilities

#### New Components:

1. **`SortableContentItem`**
   - Individual draggable list item
   - Shows drag handle icon (DragIndicator)
   - Displays content title, type, and duration
   - Includes "Remove" button
   - Visual feedback during drag (opacity change)
   - Cursor changes to "grab" when hovering

#### New Functions:

1. **`handleDragEnd()`**
   - Handles drag-and-drop completion
   - Reorders local state immediately for responsive UI
   - Calls `updateContentOrder()` to persist changes
   - Shows success/error notification
   - Reverts order on failure

#### UI Changes:

**Assigned Content Section**:

- Wrapped in `DndContext` for drag-and-drop
- Uses `SortableContext` with vertical list strategy
- Each item is a `SortableContentItem`
- Helper text: "Drag and drop to reorder content"
- Visual drag handle on each item
- Smooth animations during drag

### User Experience

#### Features:

1. **Drag Handle**: Clear visual indicator (≡ icon) on the left of each item
2. **Visual Feedback**: Item becomes semi-transparent while dragging
3. **Cursor Changes**:
   - "grab" when hovering
   - "grabbing" when dragging
4. **Instant Updates**: UI updates immediately on drop
5. **Notifications**: Success/error messages after save
6. **Error Recovery**: Reverts to original order if save fails

#### Workflow:

1. Navigate to Display Management → Content Assignment tab
2. Select a display with assigned content
3. Click and hold the drag handle (≡ icon)
4. Drag item to desired position
5. Release to drop
6. Order automatically saves to database
7. Success notification appears

### Keyboard Accessibility

The implementation supports keyboard navigation:

- `KeyboardSensor` enables keyboard drag-and-drop
- Arrow keys to move items
- Space/Enter to pick up and drop items
- Follows `sortableKeyboardCoordinates` pattern

### Database Schema

```sql
-- Table: display_content_assignments
CREATE TABLE display_content_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  display_id UUID NOT NULL REFERENCES tv_displays(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES display_content(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID NOT NULL REFERENCES users(id),
  display_order INTEGER NOT NULL DEFAULT 0,  -- NEW COLUMN

  UNIQUE(display_id, content_id)
);

-- Index for efficient ordering queries
CREATE INDEX idx_display_content_assignments_order
  ON display_content_assignments(display_id, display_order);
```

### API Updates

The content API automatically respects the `display_order`:

- GET requests return content sorted by order
- TV display carousel shows content in correct sequence
- No changes required to TV display app

### Testing Checklist

- [ ] Can drag and drop items in assigned content list
- [ ] Order persists after page refresh
- [ ] TV display shows content in correct order
- [ ] Multiple content items reorder correctly
- [ ] Error handling works when save fails
- [ ] Keyboard navigation works
- [ ] Works with 1 item (no drag)
- [ ] Works with 10+ items
- [ ] Visual feedback during drag
- [ ] Success notification appears
- [ ] Remove button still works after reordering

### Future Enhancements

Possible improvements:

1. Bulk reordering interface
2. "Move to top/bottom" buttons
3. Numerical order input
4. Drag between displays
5. Visual preview of TV display order
6. Undo/redo functionality

### Technical Notes

- **Library Choice**: `@dnd-kit` chosen for:
  - Modern React 18+ support
  - Built-in accessibility
  - Lightweight (no dependencies)
  - TypeScript support
  - Active maintenance

- **Performance**:
  - Uses `closestCenter` collision detection for smooth dragging
  - Optimistic UI updates (local state first, then DB)
  - Batch updates reduce API calls

- **Error Handling**:
  - Network errors revert UI to original state
  - User sees error notification
  - Console logs detailed error information

### Related Files

- `supabase/migrations/014_add_display_order_to_assignments.sql` - Migration
- `packages/shared-types/src/tv-display.ts` - Type definitions
- `packages/supabase-client/src/services/display.ts` - Backend logic
- `packages/supabase-client/src/index.ts` - Export function
- `apps/hub/src/pages/admin/DisplayManagement.tsx` - UI implementation
- `apps/hub/package.json` - Dependencies

### Build Status

✅ All packages build successfully
✅ TypeScript compilation passes
✅ No lint errors
✅ Database migration applied

---

**Feature Status**: ✅ Complete and Ready for Testing
**Last Updated**: 2 October 2025
