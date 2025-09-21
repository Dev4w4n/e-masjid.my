-- TV Display Database Schema Extensions
-- These migrations will add tables for display management, content, prayer times, and sponsorships

-- ============================================================================
-- Create new enums for TV display functionality
-- ============================================================================

CREATE TYPE content_type AS ENUM ('image', 'youtube_video', 'text_announcement', 'event_poster');
CREATE TYPE content_status AS ENUM ('pending', 'active', 'expired', 'rejected');
CREATE TYPE sponsorship_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('fpx', 'credit_card', 'bank_transfer', 'cash');
CREATE TYPE prayer_time_position AS ENUM ('top', 'bottom', 'left', 'right', 'center', 'hidden');
CREATE TYPE display_orientation AS ENUM ('landscape', 'portrait');
CREATE TYPE display_resolution AS ENUM ('1920x1080', '3840x2160', '1366x768', '2560x1440');
CREATE TYPE prayer_time_source AS ENUM ('JAKIM_API', 'MANUAL_ENTRY', 'CACHED_FALLBACK');

-- ============================================================================
-- TV Displays table
-- ============================================================================

CREATE TABLE tv_displays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  masjid_id UUID NOT NULL REFERENCES masjids(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Physical display settings
  resolution display_resolution NOT NULL DEFAULT '1920x1080',
  orientation display_orientation NOT NULL DEFAULT 'landscape',
  is_touch_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  location_description TEXT, -- e.g., "Main Hall", "Entrance"
  
  -- Content settings
  carousel_interval INTEGER NOT NULL DEFAULT 10, -- seconds
  max_content_items INTEGER NOT NULL DEFAULT 20,
  content_transition_type VARCHAR(20) NOT NULL DEFAULT 'fade', -- 'fade', 'slide', 'zoom', 'none'
  auto_refresh_interval INTEGER NOT NULL DEFAULT 5, -- minutes
  
  -- Prayer times display
  prayer_time_position prayer_time_position NOT NULL DEFAULT 'top',
  prayer_time_font_size VARCHAR(20) NOT NULL DEFAULT 'large', -- 'small', 'medium', 'large', 'extra_large'
  prayer_time_color VARCHAR(7) NOT NULL DEFAULT '#FFFFFF', -- hex color
  prayer_time_background_opacity DECIMAL(3,2) NOT NULL DEFAULT 0.8, -- 0-1
  
  -- Sponsorship display
  show_sponsorship_amounts BOOLEAN NOT NULL DEFAULT FALSE,
  sponsorship_tier_colors JSONB NOT NULL DEFAULT '{"bronze": "#CD7F32", "silver": "#C0C0C0", "gold": "#FFD700", "platinum": "#E5E4E2"}',
  
  -- Network and caching
  offline_cache_duration INTEGER NOT NULL DEFAULT 24, -- hours
  heartbeat_interval INTEGER NOT NULL DEFAULT 30, -- seconds
  max_retry_attempts INTEGER NOT NULL DEFAULT 3,
  retry_backoff_multiplier DECIMAL(3,2) NOT NULL DEFAULT 2.0,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(masjid_id, display_name)
);

-- ============================================================================
-- Display Content table
-- ============================================================================

CREATE TABLE display_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  masjid_id UUID NOT NULL REFERENCES masjids(id) ON DELETE CASCADE,
  display_id UUID REFERENCES tv_displays(id) ON DELETE SET NULL, -- null means all displays for masjid
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type content_type NOT NULL,
  url TEXT NOT NULL, -- file URL or YouTube URL
  thumbnail_url TEXT,
  
  -- Sponsorship and financial
  sponsorship_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  sponsorship_tier sponsorship_tier,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_reference VARCHAR(255),
  
  -- Display settings
  duration INTEGER NOT NULL DEFAULT 10, -- seconds
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
  
  -- Content management
  status content_status NOT NULL DEFAULT 'pending',
  submitted_by UUID NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- File metadata
  file_size BIGINT, -- bytes
  file_type VARCHAR(100), -- MIME type
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT valid_duration CHECK (duration BETWEEN 5 AND 300),
  CONSTRAINT valid_sponsorship_amount CHECK (sponsorship_amount >= 0)
);

-- ============================================================================
-- Prayer Times table
-- ============================================================================

CREATE TABLE prayer_times (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  masjid_id UUID NOT NULL REFERENCES masjids(id) ON DELETE CASCADE,
  prayer_date DATE NOT NULL,
  
  -- Prayer times
  fajr_time TIME NOT NULL,
  sunrise_time TIME NOT NULL,
  dhuhr_time TIME NOT NULL,
  asr_time TIME NOT NULL,
  maghrib_time TIME NOT NULL,
  isha_time TIME NOT NULL,
  
  -- Source and metadata
  source prayer_time_source NOT NULL DEFAULT 'JAKIM_API',
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  manual_adjustments JSONB, -- JSON object with prayer names as keys and minute offsets as values
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(masjid_id, prayer_date)
);

-- ============================================================================
-- Prayer Time Configuration table
-- ============================================================================

CREATE TABLE prayer_time_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  masjid_id UUID NOT NULL REFERENCES masjids(id) ON DELETE CASCADE,
  
  -- Location for JAKIM API
  zone_code VARCHAR(10) NOT NULL, -- e.g., "WLY01" for Kuala Lumpur
  location_name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- Display preferences
  show_seconds BOOLEAN NOT NULL DEFAULT FALSE,
  highlight_current_prayer BOOLEAN NOT NULL DEFAULT TRUE,
  next_prayer_countdown BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Manual adjustments (in minutes)
  adjustments JSONB NOT NULL DEFAULT '{"fajr": 0, "sunrise": 0, "dhuhr": 0, "asr": 0, "maghrib": 0, "isha": 0}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(masjid_id)
);

-- ============================================================================
-- Sponsorships table
-- ============================================================================

CREATE TABLE sponsorships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES display_content(id) ON DELETE CASCADE,
  masjid_id UUID NOT NULL REFERENCES masjids(id) ON DELETE CASCADE,
  
  sponsor_name VARCHAR(255) NOT NULL,
  sponsor_email VARCHAR(255),
  sponsor_phone VARCHAR(50),
  
  -- Financial details
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'MYR',
  tier sponsorship_tier NOT NULL,
  
  -- Payment information
  payment_method payment_method NOT NULL,
  payment_reference VARCHAR(255) NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_date TIMESTAMP WITH TIME ZONE,
  
  -- Display preferences
  show_sponsor_name BOOLEAN NOT NULL DEFAULT TRUE,
  sponsor_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_amount CHECK (amount > 0)
);

-- ============================================================================
-- Display Status table (for monitoring and analytics)
-- ============================================================================

CREATE TABLE display_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  display_id UUID NOT NULL REFERENCES tv_displays(id) ON DELETE CASCADE,
  
  -- Status information
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_content_id UUID REFERENCES display_content(id),
  
  -- Performance metrics
  content_load_time INTEGER NOT NULL DEFAULT 0, -- milliseconds
  api_response_time INTEGER NOT NULL DEFAULT 0, -- milliseconds
  error_count_24h INTEGER NOT NULL DEFAULT 0,
  uptime_percentage DECIMAL(5,2) NOT NULL DEFAULT 100.00, -- last 24 hours
  
  -- System information
  browser_info TEXT,
  screen_resolution VARCHAR(50),
  device_info TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(display_id)
);

-- ============================================================================
-- Display Analytics table (daily aggregated data)
-- ============================================================================

CREATE TABLE display_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  display_id UUID NOT NULL REFERENCES tv_displays(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Content metrics
  content_views INTEGER NOT NULL DEFAULT 0,
  unique_content_shown INTEGER NOT NULL DEFAULT 0,
  average_content_duration DECIMAL(6,2) NOT NULL DEFAULT 0.00, -- seconds
  
  -- Performance metrics
  uptime_minutes INTEGER NOT NULL DEFAULT 0,
  downtime_minutes INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  
  -- Sponsorship metrics
  total_sponsorship_revenue DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  active_sponsors INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(display_id, date)
);

-- ============================================================================
-- Indexes for performance optimization
-- ============================================================================

-- Display content indexes
CREATE INDEX idx_display_content_masjid_id ON display_content(masjid_id);
CREATE INDEX idx_display_content_display_id ON display_content(display_id);
CREATE INDEX idx_display_content_status ON display_content(status);
CREATE INDEX idx_display_content_dates ON display_content(start_date, end_date);
CREATE INDEX idx_display_content_sponsorship ON display_content(sponsorship_amount DESC);
CREATE INDEX idx_display_content_submitted_by ON display_content(submitted_by);

-- Prayer times indexes
CREATE INDEX idx_prayer_times_masjid_date ON prayer_times(masjid_id, prayer_date);
CREATE INDEX idx_prayer_times_date ON prayer_times(prayer_date DESC);

-- TV displays indexes
CREATE INDEX idx_tv_displays_masjid_id ON tv_displays(masjid_id);
CREATE INDEX idx_tv_displays_active ON tv_displays(is_active);

-- Sponsorships indexes
CREATE INDEX idx_sponsorships_content_id ON sponsorships(content_id);
CREATE INDEX idx_sponsorships_masjid_id ON sponsorships(masjid_id);
CREATE INDEX idx_sponsorships_payment_status ON sponsorships(payment_status);

-- Display status indexes
CREATE INDEX idx_display_status_display_id ON display_status(display_id);
CREATE INDEX idx_display_status_last_seen ON display_status(last_seen DESC);

-- Analytics indexes
CREATE INDEX idx_display_analytics_display_date ON display_analytics(display_id, date DESC);

-- ============================================================================
-- RLS (Row Level Security) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE tv_displays ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_time_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_analytics ENABLE ROW LEVEL SECURITY;

-- TV Displays policies
CREATE POLICY "Users can view displays for their masjids" ON tv_displays
  FOR SELECT USING (
    masjid_id = ANY(get_user_admin_masjids())
  );

CREATE POLICY "Masjid admins can manage their displays" ON tv_displays
  FOR ALL USING (
    masjid_id = ANY(get_user_admin_masjids())
  );

-- Display Content policies
CREATE POLICY "Users can view content for their masjids" ON display_content
  FOR SELECT USING (
    masjid_id = ANY(get_user_admin_masjids())
    OR status = 'active' -- Public displays can see active content
  );

CREATE POLICY "Users can submit content to their masjids" ON display_content
  FOR INSERT WITH CHECK (
    masjid_id = ANY(get_user_admin_masjids())
    AND submitted_by = auth.uid()
  );

CREATE POLICY "Masjid admins can manage content" ON display_content
  FOR ALL USING (
    masjid_id = ANY(get_user_admin_masjids())
  );

-- Prayer Times policies
CREATE POLICY "Users can view prayer times for their masjids" ON prayer_times
  FOR SELECT USING (
    masjid_id = ANY(get_user_admin_masjids())
    OR TRUE -- Prayer times are generally public
  );

CREATE POLICY "Masjid admins can manage prayer times" ON prayer_time_config
  FOR ALL USING (
    masjid_id = ANY(get_user_admin_masjids())
  );

-- Sponsorships policies
CREATE POLICY "Users can view sponsorships for their masjids" ON sponsorships
  FOR SELECT USING (
    masjid_id = ANY(get_user_admin_masjids())
  );

CREATE POLICY "Masjid admins can manage sponsorships" ON sponsorships
  FOR ALL USING (
    masjid_id = ANY(get_user_admin_masjids())
  );

-- Display Status policies (for monitoring)
CREATE POLICY "Masjid admins can view display status" ON display_status
  FOR SELECT USING (
    display_id IN (
      SELECT id FROM tv_displays 
      WHERE masjid_id = ANY(get_user_admin_masjids())
    )
  );

-- Analytics policies
CREATE POLICY "Masjid admins can view analytics" ON display_analytics
  FOR SELECT USING (
    display_id IN (
      SELECT id FROM tv_displays 
      WHERE masjid_id = ANY(get_user_admin_masjids())
    )
  );

-- ============================================================================
-- Functions and triggers
-- ============================================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_tv_displays_updated_at
  BEFORE UPDATE ON tv_displays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_display_content_updated_at
  BEFORE UPDATE ON display_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prayer_times_updated_at
  BEFORE UPDATE ON prayer_times
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prayer_time_config_updated_at
  BEFORE UPDATE ON prayer_time_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsorships_updated_at
  BEFORE UPDATE ON sponsorships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_display_status_updated_at
  BEFORE UPDATE ON display_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set sponsorship tier based on amount
CREATE OR REPLACE FUNCTION set_sponsorship_tier()
RETURNS TRIGGER AS $$
BEGIN
  CASE
    WHEN NEW.sponsorship_amount >= 200 THEN NEW.sponsorship_tier = 'platinum';
    WHEN NEW.sponsorship_amount >= 100 THEN NEW.sponsorship_tier = 'gold';
    WHEN NEW.sponsorship_amount >= 50 THEN NEW.sponsorship_tier = 'silver';
    ELSE NEW.sponsorship_tier = 'bronze';
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_content_sponsorship_tier
  BEFORE INSERT OR UPDATE ON display_content
  FOR EACH ROW EXECUTE FUNCTION set_sponsorship_tier();

-- Function to clean up expired content
CREATE OR REPLACE FUNCTION cleanup_expired_content()
RETURNS void AS $$
BEGIN
  UPDATE display_content 
  SET status = 'expired'
  WHERE status = 'active' 
    AND end_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to get active content for a display ordered by sponsorship
CREATE OR REPLACE FUNCTION get_display_content(
  p_display_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  type content_type,
  url TEXT,
  thumbnail_url TEXT,
  sponsorship_amount DECIMAL,
  sponsorship_tier sponsorship_tier,
  duration INTEGER,
  sponsor_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.title,
    dc.type,
    dc.url,
    dc.thumbnail_url,
    dc.sponsorship_amount,
    dc.sponsorship_tier,
    dc.duration,
    s.sponsor_name
  FROM display_content dc
  LEFT JOIN sponsorships s ON dc.id = s.content_id
  LEFT JOIN tv_displays td ON dc.display_id = td.id OR dc.display_id IS NULL
  WHERE (dc.display_id = p_display_id OR (dc.display_id IS NULL AND td.id = p_display_id))
    AND dc.status = 'active'
    AND dc.start_date <= CURRENT_DATE
    AND dc.end_date >= CURRENT_DATE
  ORDER BY 
    dc.sponsorship_amount DESC,
    dc.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;