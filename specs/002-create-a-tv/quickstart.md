# Quickstart: Masjid TV Display App

**Purpose**: Validate the TV display feature works end-to-end  
**Duration**: ~15 minutes  
**Environment**: Development setup with test data

## Prerequisites

- Node.js 18+ installed
- Access to Supabase project
- Test masjid data in database
- TV or large monitor for testing

## Quick Setup

### 1. Install Dependencies

```bash
cd apps/tv-display
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Configure required variables
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_JAKIM_API_URL=https://www.e-solat.gov.my/index.php
```

### 3. Database Setup

```bash
# Run migrations (if not already done)
npx supabase db push

# Seed test data
npm run seed:tv-display
```

### 4. Start Development Server

```bash
npm run dev
```

## Test Scenarios

### Scenario 1: Basic TV Display Load

**Goal**: Verify app loads in fullscreen mode with default content

**Steps**:

1. Open browser to `http://localhost:5173/tv/{test-masjid-id}`
2. Press F11 for fullscreen mode
3. Verify clean fullscreen interface loads

**Expected Results**:

- ✅ Fullscreen mode activated
- ✅ No browser UI visible (address bar, etc.)
- ✅ Loading state shows briefly
- ✅ Bahasa Malaysia interface loads

### Scenario 2: Content Carousel Display

**Goal**: Verify content ranking and carousel functionality

**Test Data** (seeded):

```
Content Items for Test Masjid:
1. YouTube Video - RM 500 sponsorship
2. Image - RM 300 sponsorship
3. YouTube Video - RM 200 sponsorship
4. Image - RM 150 sponsorship
... (up to 15 items, only top 10 should show)
```

**Steps**:

1. Wait for content to load
2. Observe carousel rotation
3. Count displayed items
4. Verify ranking order

**Expected Results**:

- ✅ Only top 10 items by sponsorship amount displayed
- ✅ Content transitions smoothly every 10 seconds
- ✅ YouTube videos autoplay with audio
- ✅ Images display for configured duration
- ✅ Smooth 60fps transitions between items

### Scenario 3: Prayer Times Overlay

**Goal**: Verify prayer times display and positioning

**Steps**:

1. Check prayer times appear as overlay
2. Verify times are accurate for today
3. Test different position settings
4. Verify overlay doesn't block content

**Expected Results**:

- ✅ Prayer times visible at bottom position (default)
- ✅ Times match JAKIM API for masjid's zone
- ✅ Overlay is non-intrusive and readable
- ✅ Hijri date displayed correctly
- ✅ Times update at midnight

### Scenario 4: Error Handling

**Goal**: Verify graceful degradation and error states

**Test Cases**:

**4a. No Content Available**:

```bash
# Remove all content for test masjid
npm run test:clear-content {test-masjid-id}
```

- ✅ Shows prayer times only
- ✅ Displays appropriate message in Bahasa Malaysia
- ✅ No error boundaries triggered

**4b. Network Disconnection**:

```bash
# Simulate network failure
npm run test:offline-mode
```

- ✅ Shows cached content
- ✅ Displays offline indicator
- ✅ Prayer times from cache still work
- ✅ Attempts reconnection every 15 minutes

**4c. YouTube Video Blocked**:

- Ensure test data includes blocked/private YouTube video
- ✅ Skips unavailable video gracefully
- ✅ Continues to next content item
- ✅ No broken iframe display

### Scenario 5: Performance Validation

**Goal**: Verify performance targets are met

**Monitoring**:

```bash
# Open Chrome DevTools
# Navigate to Performance tab
# Record 60 seconds of carousel operation
```

**Validation Checklist**:

- ✅ Consistent 60fps during transitions
- ✅ Memory usage stays under 50MB
- ✅ Content loads within 200ms
- ✅ CPU usage remains reasonable for 24/7 operation
- ✅ No memory leaks after 10+ carousel cycles

### Scenario 6: TV Hardware Testing

**Goal**: Verify compatibility with actual TV displays

**Physical Setup**:

1. Connect laptop/computer to TV via HDMI
2. Set TV as primary display
3. Launch app in fullscreen mode
4. Test for extended period (30+ minutes)

**TV-Specific Validation**:

- ✅ Proper resolution adaptation
- ✅ No overscan issues
- ✅ Audio plays correctly through TV speakers
- ✅ Remote control navigation (if applicable)
- ✅ Screen saver/sleep mode handling
- ✅ Stable operation without browser crashes

## Configuration Testing

### Prayer Times Position

```bash
# Test different prayer time positions
npm run test:prayer-position top
npm run test:prayer-position bottom
npm run test:prayer-position left
npm run test:prayer-position right
npm run test:prayer-position center
```

**Validation**:

- ✅ Prayer times appear in correct position
- ✅ Content still fully visible
- ✅ Readable text at all positions
- ✅ No content overlap

### Carousel Timing

```bash
# Test different transition durations
npm run test:carousel-timing 5   # 5 seconds
npm run test:carousel-timing 30  # 30 seconds
```

**Validation**:

- ✅ Timing changes take effect immediately
- ✅ Smooth transitions at all speeds
- ✅ No timing drift over long periods

## Automated Test Execution

### Unit Tests

```bash
npm run test:unit
```

### Integration Tests

```bash
npm run test:integration
```

### End-to-End Tests

```bash
npm run test:e2e:tv-display
```

### Performance Tests

```bash
npm run test:performance
```

## Success Criteria

### Functional ✅

- [x] Fullscreen TV display mode works
- [x] Content carousel shows top 10 items by sponsorship
- [x] Prayer times overlay displays correctly
- [x] YouTube videos autoplay with audio
- [x] Images display with correct timing
- [x] Bahasa Malaysia interface throughout

### Performance ✅

- [x] 60fps smooth transitions
- [x] <200ms content loading time
- [x] <50MB memory usage
- [x] No memory leaks in 24/7 operation
- [x] Stable for extended periods

### Error Handling ✅

- [x] Graceful offline mode
- [x] Handles missing content appropriately
- [x] Skips unavailable YouTube videos
- [x] Shows appropriate error messages in Bahasa Malaysia

### TV Compatibility ✅

- [x] Works on Samsung Smart TV browsers
- [x] Works on LG WebOS browsers
- [x] Works on Android TV devices
- [x] Proper HDMI display output
- [x] Audio through TV speakers

## Troubleshooting

### Common Issues

**App doesn't load in fullscreen**:

- Check browser fullscreen API support
- Try manual F11 fullscreen
- Verify no browser security restrictions

**YouTube videos don't autoplay**:

- Check browser autoplay policies
- Verify kiosk mode settings
- Test with different YouTube URLs

**Prayer times not showing**:

- Verify JAKIM API accessibility
- Check masjid zone code configuration
- Ensure date/time settings correct

**Performance issues**:

- Check available system memory
- Verify hardware acceleration enabled
- Monitor CPU usage during operation

### Debug Mode

```bash
# Enable debug logging
VITE_DEBUG_MODE=true npm run dev

# Check browser console for detailed logs
# Monitor network requests in DevTools
```

## Production Deployment

After successful quickstart validation:

1. **Build for production**: `npm run build`
2. **Deploy to hosting**: Upload to TV display hosting
3. **Configure kiosk mode**: Set browser to kiosk/presentation mode
4. **Test on actual hardware**: Validate on target TV displays
5. **Monitor performance**: Set up logging and monitoring

## Next Steps

- ✅ Quickstart completed successfully
- → Ready for full implementation
- → Proceed to tasks.md for development breakdown
- → Set up production TV display hardware
- → Configure masjid-specific content and settings
