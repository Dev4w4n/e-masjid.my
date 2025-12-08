/**
 * Display Status API Route
 * GET /api/displays/[id]/status - Get current display status and health metrics
 * 
 * Returns the current status, performance metrics, and health information for a specific TV display
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Required for Cloudflare Pages deployment
export const runtime = 'edge';
import { 
  Database,
  DisplayStatus,
} from '@masjid-suite/shared-types';
import {
  ApiError,
  createApiError 
} from '../../../../../lib/api-utils';

// Create Supabase client for API routes
function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ data: DisplayStatus } | ApiError>> {
  try {
    // Create Supabase client
    const supabase = createSupabaseClient();
    
    const { id: displayId } = await params;

    // Verify display exists
    const { data: display, error: displayError } = await supabase
      .from('tv_displays')
      .select('id, is_active, last_heartbeat')
      .eq('id', displayId)
      .single();

    if (displayError || !display) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Display not found'),
        { status: 404 }
      );
    }

    // Get display status - create a default one if it doesn't exist
    let { data: status, error: statusError } = await supabase
      .from('display_status')
      .select('*')
      .eq('display_id', displayId)
      .single();

    if (statusError || !status) {
      // Create default status record if it doesn't exist
      const defaultStatus = {
        display_id: displayId,
        is_online: false,
        last_seen: new Date().toISOString(),
        current_content_id: null,
        content_load_time: 0,
        api_response_time: 0,
        error_count_24h: 0,
        uptime_percentage: 0,
        browser_info: null,
        screen_resolution: null,
        device_info: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newStatus, error: createError } = await supabase
        .from('display_status')
        .insert(defaultStatus)
        .select()
        .single();

      if (createError) {
        console.error('Failed to create default status:', createError);
        return NextResponse.json(
          createApiError('INTERNAL_SERVER_ERROR', 'Failed to create display status'),
          { status: 500 }
        );
      }

      status = newStatus;
    }

    // Check if display is considered online based on last heartbeat
    const lastHeartbeat = display.last_heartbeat ? new Date(display.last_heartbeat) : null;
    const now = new Date();
    const timeSinceLastHeartbeat = lastHeartbeat ? now.getTime() - lastHeartbeat.getTime() : null;
    const isOnline = timeSinceLastHeartbeat ? timeSinceLastHeartbeat < 60000 : false; // Consider online if heartbeat within 1 minute

    // Transform to DisplayStatus interface
    const displayStatus: DisplayStatus = {
      id: status.id,
      display_id: status.display_id,
      is_online: isOnline,
      last_seen: status.last_seen || new Date().toISOString(),
      ...(status.current_content_id && { current_content_id: status.current_content_id }),
      content_load_time: status.content_load_time,
      api_response_time: status.api_response_time,
      error_count_24h: status.error_count_24h,
      uptime_percentage: status.uptime_percentage,
      ...(status.browser_info && { browser_info: status.browser_info }),
      ...(status.screen_resolution && { screen_resolution: status.screen_resolution }),
      ...(status.device_info && { device_info: status.device_info }),
      created_at: status.created_at || new Date().toISOString(),
      updated_at: status.updated_at || new Date().toISOString()
    };

    return NextResponse.json({
      data: displayStatus,
      error: null
    }, {
      headers: {
        'Cache-Control': 'private, max-age=30', // 30 seconds cache
        'X-Last-Seen': status.last_seen || new Date().toISOString(),
        'X-Uptime': status.uptime_percentage.toString(),
        'X-Online-Status': isOnline.toString(),
        'X-Last-Heartbeat': display.last_heartbeat || 'never'
      }
    });

  } catch (error) {
    console.error('Status retrieval error:', error);
    return NextResponse.json(
      createApiError(
        'INTERNAL_SERVER_ERROR',
        'Failed to retrieve display status',
        error instanceof Error ? error.message : undefined
      ),
      { status: 500 }
    );
  }
}