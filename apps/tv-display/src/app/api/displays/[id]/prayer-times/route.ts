/**
 * Prayer Times API Route
 * GET /api/displays/[id]/prayer-times - Get prayer times for a display's masjid
 * 
 * Returns mock prayer times data for now. Can be enhanced later with real JAKIM API integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  Database,
  PrayerTimes,
  PrayerTimeConfig,
  PrayerTimesResponse,
  ApiError,
  createApiError 
} from '@masjid-suite/shared-types';

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PrayerTimesResponse | ApiError>> {
  try {
    const { id: displayId } = await params;
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Get display and its masjid information
    const { data: display, error: displayError } = await supabase
      .from('tv_displays')
      .select(`
        *,
        masjids (
          id,
          name,
          location,
          state,
          latitude,
          longitude
        )
      `)
      .eq('id', displayId)
      .eq('is_active', true)
      .single();

    if (displayError || !display || !display.masjids) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Display not found or inactive'),
        { status: 404 }
      );
    }

    const masjid = display.masjids as any;

    // For now, return mock prayer times
    // This can be enhanced later with real JAKIM API integration
    const prayerTimes: PrayerTimes = {
      id: `${masjid.id}-${dateParam}`,
      masjid_id: masjid.id,
      prayer_date: dateParam,
      fajr_time: '05:45',
      sunrise_time: '07:05',
      dhuhr_time: '13:15',
      asr_time: '16:30',
      maghrib_time: '19:20',
      isha_time: '20:35',
      source: 'CACHED_FALLBACK',
      fetched_at: new Date().toISOString(),
      manual_adjustments: {
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const config: PrayerTimeConfig = {
      masjid_id: masjid.id,
      zone_code: determineZoneCode(masjid.state, masjid.location),
      location_name: masjid.location || masjid.name,
      latitude: masjid.latitude,
      longitude: masjid.longitude,
      show_seconds: false,
      highlight_current_prayer: true,
      next_prayer_countdown: true,
      adjustments: {
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const response: PrayerTimesResponse = {
      data: prayerTimes,
      meta: config as any, // Type assertion for now
      links: {
        self: new URL(request.url).toString()
      },
      error: null
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=1800', // 30 minutes cache
        'X-Prayer-Source': 'MOCK_DATA',
        'X-Last-Fetched': new Date().toISOString(),
        'X-Zone-Code': config.zone_code,
      }
    });

  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return NextResponse.json(
      createApiError(
        'INTERNAL_SERVER_ERROR',
        'Failed to fetch prayer times',
        error instanceof Error ? error.message : undefined
      ),
      { status: 500 }
    );
  }
}

// Helper functions

function determineZoneCode(state?: string, location?: string): string {
  if (!state) return 'WLY01'; // Default to Kuala Lumpur
  
  const PRAYER_ZONES: Record<string, string> = {
    'kuala-lumpur': 'WLY01',
    'selangor': 'SGR01',
    'johor': 'JHR01',
    'penang': 'PNG01',
    'perak': 'PRK01',
    'negeri-sembilan': 'NGS01',
    'melaka': 'MLK01',
    'kedah': 'KDH01',
    'kelantan': 'KTN01',
    'terengganu': 'TRG01',
    'pahang': 'PHG01',
    'sabah': 'SBH01',
    'sarawak': 'SWK01',
    'federal-territory': 'WLY01',
    'putrajaya': 'WLY01',
    'labuan': 'SBH01'
  };
  
  const normalizedState = state.toLowerCase().replace(/\s+/g, '-');
  return PRAYER_ZONES[normalizedState] || 'WLY01';
}