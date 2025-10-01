/**
 * Prayer Times API Route
 * GET /api/displays/[id]/prayer-times - Get prayer times for a display's masjid
 * 
 * Integrates with JAKIM API to fetch real Malaysian prayer times data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  Database,
  PrayerTimeConfig,
  PrayerTimesResponse,
} from '@masjid-suite/shared-types';
import {
  ApiError,
  createApiError 
} from '../../../../../lib/api-utils';
import { jakimApi, MalaysianZone, determineZoneCode, PrayerTimes } from '@masjid-suite/prayer-times/server';

// Create Supabase client for API routes
function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PrayerTimesResponse | ApiError>> {
  try {
    // Create Supabase client
    const supabase = createSupabaseClient();
    const { id: displayId } = await params;
    const url = new URL(request.url);
    const dateParam: string = url.searchParams.get('date') || new Date().toISOString().split('T')[0] || '';

    // Get display and its masjid information
    const { data: display, error: displayError } = await supabase
      .from('tv_displays')
      .select(`
        *,
        masjids (
          id,
          name,
          address,
          jakim_zone_code
        )
      `)
      .eq('id', displayId)
      .single();

    if (displayError || !display || !display.masjids) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Display not found or inactive'),
        { status: 404 }
      );
    }

    const masjid = display.masjids as any;

    // Extract address information from JSON
    const address = masjid.address || {};
    const state = address.state || '';
    const city = address.city || '';
    const location = `${city}, ${state}`.trim().replace(/^,\s*|,\s*$/g, '') || masjid.name;

    // Determine JAKIM zone code
    const zoneCode = masjid.jakim_zone_code || determineZoneCode(state, city);
    
    try {
      // Fetch real prayer times from JAKIM API
      const prayerTimes = await jakimApi.fetchPrayerTimes(
        masjid.id,
        dateParam,
        zoneCode as MalaysianZone
      );

      const config: PrayerTimeConfig = {
        masjid_id: masjid.id,
        zone_code: zoneCode,
        location_name: location,
        latitude: 3.1390, // Default to Kuala Lumpur coordinates
        longitude: 101.6869, // Default to Kuala Lumpur coordinates
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
        meta: {
          ...config as any, // Type assertion for now
          position: display.prayer_time_position
        },
        links: {
          self: new URL(request.url).toString()
        },
        error: null
      };

      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'private, max-age=1800', // 30 minutes cache
          'X-Prayer-Source': prayerTimes.source,
          'X-Last-Fetched': prayerTimes.fetched_at,
          'X-Zone-Code': zoneCode,
        }
      });

    } catch (jakimError) {
      console.error('JAKIM API error:', jakimError);
      
      // Fallback to mock data if JAKIM API fails
      const fallbackPrayerTimes: PrayerTimes = {
        id: `${masjid.id}-${dateParam}-fallback`,
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

      const fallbackConfig: PrayerTimeConfig = {
        masjid_id: masjid.id,
        zone_code: zoneCode,
        location_name: location,
        latitude: 3.1390, // Default to Kuala Lumpur coordinates
        longitude: 101.6869, // Default to Kuala Lumpur coordinates
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

      const fallbackResponse: PrayerTimesResponse = {
        data: fallbackPrayerTimes,
        meta: {
          ...fallbackConfig as any,
          position: display.prayer_time_position
        },
        links: {
          self: new URL(request.url).toString()
        },
        error: null
      };

      return NextResponse.json(fallbackResponse, {
        headers: {
          'Cache-Control': 'private, max-age=300', // 5 minutes cache for fallback
          'X-Prayer-Source': 'FALLBACK_DATA',
          'X-Last-Fetched': new Date().toISOString(),
          'X-Zone-Code': zoneCode,
          'X-Error': 'JAKIM_API_FAILED'
        }
      });
    }

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