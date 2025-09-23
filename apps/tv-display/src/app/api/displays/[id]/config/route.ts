/**
 * Display Configuration API Route
 * GET /api/displays/[id]/config - Get display configuration
 * PUT /api/displays/[id]/config - Update display configuration
 * 
 * Manages display settings like carousel intervals, prayer time positioning,
 * offline behavior, and other display-specific configurations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  Database,
  DisplayConfig,
  DisplayConfigResponse,
} from '@masjid-suite/shared-types';
import {
  ApiError,
  createApiError 
} from '../../../../../lib/api-utils';

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<DisplayConfigResponse | ApiError>> {
  try {
    const { id: displayId } = await params;

    // Get display with masjid information
    const { data: display, error: displayError } = await supabase
      .from('tv_displays')
      .select(`
        *,
        masjids (
          id,
          name,
          status
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

    const masjid = display.masjids;

    // Transform database row to DisplayConfig interface
    const config: DisplayConfig = {
      id: display.id,
      masjid_id: display.masjid_id,
      display_name: display.display_name,
      ...(display.location_description && { location_description: display.location_description }),
      
      // Layout and display settings
      orientation: display.orientation,
      resolution: display.resolution,
      
      // Content settings
      carousel_interval: display.carousel_interval,
      content_transition_type: (display.content_transition_type as any) || 'fade',
      max_content_items: display.max_content_items,
      show_sponsorship_amounts: display.show_sponsorship_amounts,
      sponsorship_tier_colors: display.sponsorship_tier_colors as any || {},
      
      // Prayer time settings
      prayer_time_position: display.prayer_time_position,
      prayer_time_color: display.prayer_time_color || '#FFFFFF',
      prayer_time_font_size: (display.prayer_time_font_size as any) || 'large',
      prayer_time_background_opacity: display.prayer_time_background_opacity || 0.8,
      
      // System settings
      auto_refresh_interval: display.auto_refresh_interval,
      heartbeat_interval: display.heartbeat_interval,
      offline_cache_duration: display.offline_cache_duration,
      max_retry_attempts: display.max_retry_attempts,
      retry_backoff_multiplier: display.retry_backoff_multiplier,
      
      // Hardware settings
      is_touch_enabled: display.is_touch_enabled,
      
      // Status
      is_active: display.is_active,
      ...(display.last_heartbeat && { last_heartbeat: display.last_heartbeat }),
      
      // Metadata
      created_at: display.created_at || '',
      updated_at: display.updated_at || ''
    };

    // Get total active displays for this masjid
    const { count: totalDisplays } = await supabase
      .from('tv_displays')
      .select('*', { count: 'exact', head: true })
      .eq('masjid_id', display.masjid_id)
      .eq('is_active', true);

    const response: DisplayConfigResponse = {
      data: config,
      meta: {
        masjid_name: masjid.name,
        total_displays: totalDisplays || 0,
        config_version: '1.0',
        ...(display.last_heartbeat && { last_heartbeat: display.last_heartbeat }),
        status: display.is_active ? 'online' : 'offline'
      },
      links: {
        self: new URL(request.url).toString()
      },
      error: null
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=300', // 5 minutes cache
        'X-Display-Status': display.is_active ? 'active' : 'inactive',
        'X-Last-Heartbeat': display.last_heartbeat || 'never',
      }
    });

  } catch (error) {
    console.error('Error fetching display config:', error);
    return NextResponse.json(
      createApiError(
        'INTERNAL_SERVER_ERROR',
        'Failed to fetch display configuration',
        error instanceof Error ? error.message : undefined
      ),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<DisplayConfigResponse | ApiError>> {
  try {
    const { id: displayId } = await params;
    const body = await request.json();

    // Validate that display exists and is accessible
    const { data: existingDisplay, error: displayError } = await supabase
      .from('tv_displays')
      .select(`
        *,
        masjids (
          id,
          name,
          status
        )
      `)
      .eq('id', displayId)
      .single();

    if (displayError || !existingDisplay || !existingDisplay.masjids) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Display not found'),
        { status: 404 }
      );
    }

    // Validate and sanitize update data
    const allowedFields = [
      'display_name',
      'location_description',
      'orientation',
      'resolution',
      'carousel_interval',
      'content_transition_type',
      'max_content_items',
      'show_sponsorship_amounts',
      'sponsorship_tier_colors',
      'prayer_time_position',
      'prayer_time_color',
      'prayer_time_font_size',
      'prayer_time_background_opacity',
      'auto_refresh_interval',
      'heartbeat_interval',
      'offline_cache_duration',
      'max_retry_attempts',
      'retry_backoff_multiplier',
      'is_touch_enabled'
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Add timestamp
    updateData.updated_at = new Date().toISOString();

    // Validate specific field constraints
    if (updateData.carousel_interval !== undefined) {
      if (updateData.carousel_interval < 3 || updateData.carousel_interval > 300) {
        return NextResponse.json(
          createApiError('VALIDATION_ERROR', 'Carousel interval must be between 3 and 300 seconds'),
          { status: 400 }
        );
      }
    }

    if (updateData.max_content_items !== undefined) {
      if (updateData.max_content_items < 1 || updateData.max_content_items > 100) {
        return NextResponse.json(
          createApiError('VALIDATION_ERROR', 'Max content items must be between 1 and 100'),
          { status: 400 }
        );
      }
    }

    if (updateData.heartbeat_interval !== undefined) {
      if (updateData.heartbeat_interval < 30 || updateData.heartbeat_interval > 3600) {
        return NextResponse.json(
          createApiError('VALIDATION_ERROR', 'Heartbeat interval must be between 30 and 3600 seconds'),
          { status: 400 }
        );
      }
    }

    // Update the display configuration
    const { data: updatedDisplay, error: updateError } = await supabase
      .from('tv_displays')
      .update(updateData)
      .eq('id', displayId)
      .select(`
        *,
        masjids (
          id,
          name,
          status
        )
      `)
      .single();

    if (updateError || !updatedDisplay) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        createApiError('INTERNAL_SERVER_ERROR', 'Failed to update display configuration', updateError?.message),
        { status: 500 }
      );
    }

    const masjid = updatedDisplay.masjids as any;

    // Transform updated data to DisplayConfig interface
    const config: DisplayConfig = {
      id: updatedDisplay.id,
      masjid_id: updatedDisplay.masjid_id,
      display_name: updatedDisplay.display_name,
      ...(updatedDisplay.location_description && { location_description: updatedDisplay.location_description }),
      
      orientation: updatedDisplay.orientation,
      resolution: updatedDisplay.resolution,
      
      carousel_interval: updatedDisplay.carousel_interval,
      content_transition_type: (updatedDisplay.content_transition_type as any) || 'fade',
      max_content_items: updatedDisplay.max_content_items,
      show_sponsorship_amounts: updatedDisplay.show_sponsorship_amounts,
      sponsorship_tier_colors: updatedDisplay.sponsorship_tier_colors as any || {},
      
      prayer_time_position: updatedDisplay.prayer_time_position,
      prayer_time_color: updatedDisplay.prayer_time_color || '#FFFFFF',
      prayer_time_font_size: (updatedDisplay.prayer_time_font_size as any) || 'large',
      prayer_time_background_opacity: updatedDisplay.prayer_time_background_opacity || 0.8,
      
      auto_refresh_interval: updatedDisplay.auto_refresh_interval,
      heartbeat_interval: updatedDisplay.heartbeat_interval,
      offline_cache_duration: updatedDisplay.offline_cache_duration,
      max_retry_attempts: updatedDisplay.max_retry_attempts,
      retry_backoff_multiplier: updatedDisplay.retry_backoff_multiplier,
      
      is_touch_enabled: updatedDisplay.is_touch_enabled,
      
      // Status
      is_active: updatedDisplay.is_active,
      ...(updatedDisplay.last_heartbeat && { last_heartbeat: updatedDisplay.last_heartbeat }),
      
      created_at: updatedDisplay.created_at || '',
      updated_at: updatedDisplay.updated_at || ''
    };

    // Get total active displays for this masjid
    const { count: totalDisplays } = await supabase
      .from('tv_displays')
      .select('*', { count: 'exact', head: true })
      .eq('masjid_id', updatedDisplay.masjid_id)
      .eq('is_active', true);

    const response: DisplayConfigResponse = {
      data: config,
      meta: {
        masjid_name: masjid.name,
        total_displays: totalDisplays || 0,
        config_version: '1.0',
        ...(updatedDisplay.last_heartbeat && { last_heartbeat: updatedDisplay.last_heartbeat }),
        status: updatedDisplay.is_active ? 'online' : 'offline'
      },
      links: {
        self: new URL(request.url).toString()
      },
      error: null
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache', // Don't cache after updates
        'X-Display-Status': updatedDisplay.is_active ? 'active' : 'inactive',
        'X-Config-Version': '1.0',
        'X-Last-Updated': updatedDisplay.updated_at || '',
      }
    });

  } catch (error) {
    console.error('Error updating display config:', error);
    return NextResponse.json(
      createApiError(
        'INTERNAL_SERVER_ERROR',
        'Failed to update display configuration',
        error instanceof Error ? error.message : undefined
      ),
      { status: 500 }
    );
  }
}

// Health check for config endpoint
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: displayId } = await params;
    
    const { data: display, error } = await supabase
      .from('tv_displays')
      .select('id, is_active, updated_at')
      .eq('id', displayId)
      .single();

    if (error || !display) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(null, { 
      status: 200,
      headers: {
        'X-Display-Status': display.is_active ? 'active' : 'inactive',
        'X-Config-Last-Modified': display.updated_at || '',
        'X-Health-Check': new Date().toISOString()
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}