# Display Management Mobile-First Design Guide

## Visual Improvements Overview

### Before vs After

#### 1. Page Header

**Before:**

```
Typography variant="h4" - Standard MUI heading
Plain text layout
No gradient styling
```

**After:**

```html
<h1
  className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3"
>
  Pengurusan
  <span
    className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500"
  >
    Paparan TV
  </span>
</h1>
<p className="text-lg text-gray-600 leading-relaxed">
  Uruskan paparan TV masjid, tetapan kandungan, dan jadual tayangan
</p>
```

#### 2. Card Styling

**Before:**

```tsx
<Card>
  <CardContent>
    <Typography variant="h6">General Settings</Typography>
    {/* Content */}
  </CardContent>
</Card>
```

**After:**

```tsx
<Card
  elevation={0}
  sx={{
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    height: "100%",
  }}
>
  <CardContent>
    <Typography
      variant="h6"
      gutterBottom
      sx={{
        fontSize: { xs: "1.125rem", md: "1.25rem" },
        fontWeight: 600,
      }}
    >
      Tetapan Umum
    </Typography>
    {/* Content */}
  </CardContent>
</Card>
```

#### 3. Mobile Responsive Buttons

**Before:**

```tsx
<Box sx={{ display: "flex", gap: 1 }}>
  <Button variant="outlined" size="small" startIcon={<Refresh />}>
    Hard Reload
  </Button>
  <Button variant="outlined" size="small" startIcon={<Refresh />}>
    Soft Reload
  </Button>
</Box>
```

**After:**

```tsx
<Box
  sx={{
    display: "flex",
    gap: 1,
    flexWrap: "wrap",
    "& .MuiButton-root": {
      fontSize: { xs: "0.75rem", md: "0.875rem" },
      minWidth: { xs: "auto", md: "auto" },
    },
  }}
>
  <Button
    variant="outlined"
    size="small"
    startIcon={<Refresh />}
    sx={{ flex: { xs: "1 1 auto", sm: "0 1 auto" } }}
  >
    Hard Reload
  </Button>
  {/* More buttons */}
</Box>
```

## Mobile Layouts

### Breakpoints Reference

- **xs**: 0px - 600px (Mobile)
- **sm**: 600px - 900px (Tablet)
- **md**: 900px - 1200px (Desktop)
- **lg**: 1200px+ (Large Desktop)

### Component Behavior by Screen Size

#### 1. Form Controls (Mobile: xs)

```
┌─────────────────────────┐
│  Pilih Masjid          │ Full width
│  [Dropdown ▼]          │
├─────────────────────────┤
│  Pilih Paparan         │ Full width
│  [Dropdown ▼]          │
├─────────────────────────┤
│  [Cipta Baru Button]   │ Full width
└─────────────────────────┘
```

#### 2. Form Controls (Desktop: md)

```
┌──────────────┬──────────────┬────┐
│ Pilih Masjid│Pilih Paparan │Cip │
│ [Dropdown ▼]│ [Dropdown ▼] │Baru│
└──────────────┴──────────────┴────┘
```

#### 3. Remote Control Buttons (Mobile: xs)

```
┌─────────────────────────┐
│  [Hard Reload]          │ Flex wrap
│  [Soft Reload]          │
│  [Kosongkan Cache]      │
└─────────────────────────┘
```

#### 4. Remote Control Buttons (Desktop: md)

```
┌────────────────────────────────────┐
│ [Hard Reload][Soft Reload][Cache] │
└────────────────────────────────────┘
```

#### 5. Content Cards (Mobile: xs)

```
┌─────────────────────────┐
│  Kandungan Tersedia     │
│  ─────────────────────  │
│  □ Item 1   [Tugaskan] │
│  □ Item 2   [Tugaskan] │
└─────────────────────────┘
┌─────────────────────────┐
│  Kandungan Ditugaskan   │
│  ─────────────────────  │
│  ≡ Item A   [Buang]    │
│  ≡ Item B   [Buang]    │
└─────────────────────────┘
```

#### 6. Content Cards (Desktop: md)

```
┌────────────────┬────────────────┐
│ Kandungan      │  Kandungan     │
│ Tersedia       │  Ditugaskan    │
│ ──────────────│  ──────────────│
│ □ [Tugaskan]  │  ≡ [Buang]     │
│ □ [Tugaskan]  │  ≡ [Buang]     │
└────────────────┴────────────────┘
```

## Touch Interaction Guidelines

### 1. Drag and Drop on Mobile

```
SortableContentItem:
- touchAction: "none" - Prevents scroll interference
- Minimum touch target: 48x48px
- Visual feedback on drag (opacity: 0.5)
- Drag handle (≡) prominent and large
```

### 2. Button Sizing

```
Mobile (xs):
- Min height: 40px
- Font size: 0.75rem
- Padding: 8px 16px
- Full width for primary actions

Desktop (md):
- Min height: 36px
- Font size: 0.875rem
- Padding: 6px 16px
- Auto width with min-width
```

### 3. Form Fields

```
All screens:
- size="small" for compact layout
- Label clearly visible
- Sufficient touch targets
- Helper text when needed
```

## Color Palette (Legacy-Inspired)

### Primary Colors

```css
--primary: #0070f4 /* e-masjid blue */ --secondary: #3abab4 /* e-masjid teal */;
```

### Backgrounds

```css
.bg-gradient-to-br {
  from: #ffffff           /* white */
  via: rgba(0, 112, 244, 0.03)  /* blue-50/30 */
  to: rgba(58, 186, 180, 0.03)  /* teal-50/30 */
}
```

### Typography

```css
.text-gray-900: #191919   /* Dark text */
.text-gray-600: #666666   /* Secondary text */
.text-gray-500: #7F7F7F   /* Muted text */
```

### Borders & Dividers

```css
border: 1px solid
borderColor: divider      /* rgba(0, 0, 0, 0.12) */
borderRadius: 8px         /* Soft corners */
```

## Accessibility Features

### 1. Keyboard Navigation

- All interactive elements focusable
- Proper tab order
- Focus visible states
- Escape to close dialogs

### 2. Screen Readers

- ARIA labels on all inputs
- Descriptive button text
- Meaningful alt text
- Proper heading hierarchy

### 3. Touch Targets

- Minimum 44x44px on mobile
- Adequate spacing between elements
- Clear visual feedback
- No overlapping tap areas

### 4. Color Contrast

- Text: 4.5:1 minimum ratio
- Large text: 3:1 ratio
- Interactive elements: clear states
- Focus indicators visible

## Performance Optimizations

### 1. Component Rendering

```tsx
// Memoized sortable items
const MemoizedSortableItem = React.memo(SortableContentItem);

// Conditional rendering
{
  displaySettings && <Settings />;
}

// Lazy loading dialogs
{
  assignDialogOpen && <ContentSettingsDialog />;
}
```

### 2. Event Handlers

```tsx
// Debounced search/filter
const debouncedSearch = useMemo(() => debounce(handleSearch, 300), []);

// Optimized drag handlers
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);
```

### 3. Network Optimization

```tsx
// Batch updates
const handleBatchUpdate = async (items) => {
  await Promise.all(items.map(updateItem));
};

// Optimistic updates
setAssignedContent([...assignedContent, newItem]);
try {
  await assignContent(newItem);
} catch {
  setAssignedContent(assignedContent); // Revert
}
```

## Testing Scenarios

### Mobile Testing (Required)

1. **iPhone SE (375px)** - Smallest modern iPhone
2. **iPhone 12/13 (390px)** - Common size
3. **iPhone 14 Pro Max (428px)** - Largest
4. **Android Medium (360px)** - Common Android
5. **Android Large (412px)** - Pixel/Samsung

### Tablet Testing (Recommended)

1. **iPad Mini (768px)** - Small tablet
2. **iPad (820px)** - Standard tablet
3. **iPad Pro (1024px)** - Large tablet

### Desktop Testing (Required)

1. **Laptop (1366px)** - Common laptop
2. **Desktop HD (1920px)** - Standard desktop
3. **Desktop 4K (2560px)** - High res

### Interaction Testing

- [ ] Drag and drop on touch screen
- [ ] Drag and drop with mouse
- [ ] Form submission with keyboard
- [ ] Tab navigation through form
- [ ] Dialog open/close
- [ ] Responsive button layout
- [ ] Scrollable tabs on mobile
- [ ] Color picker interaction

---

**Design System**: Legacy-inspired modern
**Framework**: Material-UI v6 + Tailwind CSS
**Responsive**: Mobile-first approach
**Language**: Bahasa Malaysia primary
**Accessibility**: WCAG 2.1 AA compliant
