# Quickstart Guide: Masjid Digital Display TV App

## Overview

This guide will help you set up and run the Masjid Digital Display TV App in your development environment and deploy a basic display configuration.

## Prerequisites

### System Requirements

- Node.js 18+ and pnpm
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- TV or large monitor for display testing
- Internet connection for prayer times and YouTube content

### Development Environment

- VS Code with recommended extensions
- Git for version control
- Access to existing e-Masjid.my repository and Supabase instance

## Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
# Navigate to repository root
cd /path/to/e-masjid.my

# Install dependencies for the TV display app
cd apps/tv-display
pnpm install

# Install Playwright for testing
pnpm playwright install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Configure required environment variables
echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key" >> .env.local
echo "JAKIM_API_BASE_URL=https://api.jakim.gov.my" >> .env.local
```

### 3. Database Setup

```bash
# Run database migrations for TV display tables
cd ../../supabase
npx supabase db push

# Seed with sample data
npx supabase db seed
```

### 4. Start Development Server

```bash
cd ../apps/tv-display
pnpm dev
```

The app will be available at `http://localhost:3000`

## First Display Setup (10 minutes)

### 1. Create Sample Masjid and Display

```bash
# Run the setup script to create sample data
pnpm run setup:sample-data
```

This creates:

- Sample masjid with JAKIM zone ID
- Display configuration with default settings
- Sample content items with sponsorship data

### 2. Access Display Interface

Navigate to: `http://localhost:3000/display/{display-id}`

You should see:

- ✅ Background carousel rotating through sponsored content
- ✅ Prayer times overlay in configured position
- ✅ Smooth transitions between content items
- ✅ Bahasa Malaysia interface text

### 3. Verify Core Features

#### Content Carousel Test

1. **Sponsorship Ranking**: Content should display in order of sponsorship amount (highest first)
2. **Mixed Media**: Both YouTube videos and images should display correctly
3. **Top 10 Limit**: Only the top 10 sponsored items should appear in rotation
4. **Automatic Transition**: Content should change based on configured interval

#### Prayer Times Overlay Test

1. **Current Times**: Prayer times should show today's schedule
2. **Position Configuration**: Prayer times should appear in the configured position
3. **JAKIM Integration**: Times should be fetched from JAKIM API
4. **Non-obstructive**: Overlay should not block main content viewing

#### Error Handling Test

1. **Network Issues**: Disconnect network and verify graceful fallback
2. **Content Failures**: YouTube video errors should skip to next content
3. **Prayer Time Failures**: Should retry 3 times then show error

## Configuration Testing (15 minutes)

### 1. Multi-Display Setup

```bash
# Create additional display configurations
curl -X POST http://localhost:3000/api/v1/displays \
  -H "Content-Type: application/json" \
  -d '{
    "masjid_id": "your-masjid-id",
    "display_name": "Main Hall Display",
    "prayer_time_position": "top",
    "carousel_interval": 30
  }'
```

### 2. Content Management

```bash
# Add new sponsored content
curl -X POST http://localhost:3000/api/v1/content \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ceramah Jumaat",
    "type": "youtube_video",
    "url": "https://youtube.com/watch?v=example",
    "sponsorship_amount": 500.00,
    "duration": 300
  }'
```

### 3. Prayer Time Configuration

Test different masjid locations:

```bash
# Update masjid zone ID
curl -X PUT http://localhost:3000/api/v1/masjids/{masjid-id} \
  -H "Content-Type: application/json" \
  -d '{
    "jakim_zone_id": "SGR01"
  }'
```

## Testing with Playwright (10 minutes)

### 1. Run Contract Tests

```bash
# Run API contract tests
pnpm test:contracts

# Run E2E display tests
pnpm test:e2e
```

### 2. Visual Display Testing

```bash
# Test display on different screen sizes
pnpm test:visual

# Test multi-display scenarios
pnpm test:multi-display
```

### 3. Performance Testing

```bash
# Test 60fps animation performance
pnpm test:performance

# Test memory usage over time
pnpm test:memory
```

## Production Deployment (20 minutes)

### 1. Build and Deploy

```bash
# Build production version
pnpm build

# Deploy to Vercel (or your hosting platform)
pnpm deploy
```

### 2. Configure Production Environment

```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add JAKIM_API_BASE_URL
```

### 3. Setup Monitoring

- Configure error tracking (Sentry)
- Setup uptime monitoring
- Enable performance metrics

## TV Display Setup

### 1. Hardware Configuration

- Connect TV to internet via Ethernet (preferred) or WiFi
- Set TV to browser/smart TV mode
- Configure auto-start to load display URL
- Disable screen saver and power management

### 2. Browser Configuration

- Open full-screen mode (F11)
- Disable address bar and toolbars
- Enable auto-refresh if browser supports
- Set homepage to display URL

### 3. Display URL Format

```
https://your-domain.com/display/{display-id}?fullscreen=true&autostart=true
```

## Validation Checklist

### ✅ Technical Validation

- [ ] App builds and runs without errors
- [ ] All API endpoints respond correctly
- [ ] Prayer times update from JAKIM API
- [ ] Content carousel displays sponsored items in order
- [ ] YouTube videos play automatically
- [ ] Images display with correct timing
- [ ] Prayer time overlay positioned correctly
- [ ] Multi-display configurations work independently

### ✅ User Experience Validation

- [ ] Interface displays in Bahasa Malaysia
- [ ] Content transitions are smooth (60fps)
- [ ] Prayer times are clearly visible
- [ ] Content is appropriately sized for TV viewing
- [ ] Error states show helpful messages
- [ ] Offline mode provides graceful degradation

### ✅ Performance Validation

- [ ] Initial page load under 2 seconds
- [ ] Content transitions under 500ms
- [ ] Memory usage stable over 24+ hours
- [ ] No frame drops during video playback
- [ ] API responses under 1 second

### ✅ Integration Validation

- [ ] Existing turborepo packages work correctly
- [ ] Supabase integration functional
- [ ] Authentication (if required) works
- [ ] Shared UI components render properly

## Troubleshooting

### Common Issues

#### Content Not Loading

```bash
# Check API connectivity
curl http://localhost:3000/api/v1/displays/{display-id}/content

# Verify database connection
pnpm db:test-connection

# Check browser console for errors
```

#### Prayer Times Not Updating

```bash
# Test JAKIM API directly
curl "https://api.jakim.gov.my/solat/{zone-id}"

# Check retry logic in logs
pnpm logs:prayer-times

# Verify zone ID configuration
```

#### Performance Issues

```bash
# Profile memory usage
pnpm analyze:memory

# Check frame rate
pnpm analyze:fps

# Monitor network requests
pnpm analyze:network
```

#### Display Configuration Issues

```bash
# Reset display configuration
pnpm reset:display-config {display-id}

# Sync with database
pnpm sync:config

# Clear browser cache
```

## Next Steps

### Phase 2: Advanced Features

- Content scheduling by time of day
- Advanced analytics and reporting
- Content approval workflow
- Multi-language support beyond Bahasa Malaysia

### Phase 3: Scale Optimization

- CDN integration for media content
- Caching layer optimization
- Load balancing for multiple displays
- Real-time content updates via WebSocket

### Phase 4: Management Tools

- Admin dashboard for content management
- Automated content moderation
- Sponsorship payment integration
- Display health monitoring dashboard

## Support and Resources

- **Documentation**: `/docs` folder in repository
- **API Reference**: `/specs/002-create-a-new/contracts/api-spec.yaml`
- **Data Model**: `/specs/002-create-a-new/data-model.md`
- **Architecture**: `/specs/002-create-a-new/research.md`

For technical support, create an issue in the repository with:

- Display ID and masjid information
- Browser and TV hardware details
- Steps to reproduce the issue
- Screenshots or video of the problem

---

**Success Criteria**: After completing this quickstart, you should have a fully functional digital display showing sponsored Islamic content with prayer times overlay, ready for deployment in a masjid environment.
