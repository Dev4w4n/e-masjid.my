/**
 * Display Heartbeat API Route
 * POST /api/displays/[id]/heartbeat - Record display status and health metrics
 * 
 * Handles display status monitoring, health checks, performance metrics collection,
 * configuration push notifications, and system status reporting for TV displays
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  Database,
  DisplayStatus,
<<<<<<< HEAD
} from '@masjid-suite/shared-types';
import {
  ApiError,
  createApiError 
} from '../../../../../lib/api-utils';
=======
  ApiError,
  createApiError 
} from '@masjid-suite/shared-types';
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface HeartbeatRequest {
  // System status
  is_online: boolean;
  current_content_id?: string;
  
  // Performance metrics
  content_load_time: number; // milliseconds
  api_response_time: number; // milliseconds
  error_count_24h: number;
  memory_usage?: number; // MB
  cpu_usage?: number; // percentage
  
  // System information
  browser_info?: string;
  screen_resolution?: string;
  device_info?: string;
  network_status?: 'online' | 'offline' | 'limited';
  
  // Optional error information
  last_error?: string;
  error_stack?: string;
}

interface HeartbeatResponse {
  acknowledged: boolean;
  next_heartbeat_in: number; // seconds
  config_updated: boolean;
  force_refresh: boolean;
  server_time: string;
  display_status: 'active' | 'maintenance' | 'disabled';
  messages?: string[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ data: HeartbeatResponse } | ApiError>> {
  try {
    const { id: displayId } = await params;
    const body: HeartbeatRequest = await request.json();

    // Verify display exists and get current configuration
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
      .single();

    if (displayError || !display || !display.masjids) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Display not found'),
        { status: 404 }
      );
    }

    const masjid = display.masjids as any;

    // Validate heartbeat data
    if (typeof body.is_online !== 'boolean' || 
        typeof body.content_load_time !== 'number' || 
        typeof body.api_response_time !== 'number' || 
        typeof body.error_count_24h !== 'number') {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Invalid heartbeat data: is_online, content_load_time, api_response_time, and error_count_24h are required'),
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const lastHeartbeat = display.last_heartbeat ? new Date(display.last_heartbeat) : null;
    const timeSinceLastHeartbeat = lastHeartbeat ? Date.now() - lastHeartbeat.getTime() : null;

    // Calculate uptime percentage (approximate based on heartbeat intervals)
    let uptimePercentage = 100;
    if (timeSinceLastHeartbeat && timeSinceLastHeartbeat > display.heartbeat_interval * 1000 * 2) {
      // If heartbeat was missed by more than 2x the interval, calculate downtime
      const expectedHeartbeats = 24 * 60 * 60 / display.heartbeat_interval; // 24 hours
      const missedTime = Math.min(timeSinceLastHeartbeat / 1000, 24 * 60 * 60); // Cap at 24 hours
      uptimePercentage = Math.max(0, 100 - (missedTime / (24 * 60 * 60)) * 100);
    }

    // Update display last heartbeat
    const { error: updateDisplayError } = await supabase
      .from('tv_displays')
      .update({
        last_heartbeat: now,
        updated_at: now
      })
      .eq('id', displayId);

    if (updateDisplayError) {
      console.error('Failed to update display heartbeat:', updateDisplayError);
    }

    // Create or update display status record
    const statusData = {
      display_id: displayId,
      is_online: body.is_online,
      last_seen: now,
      current_content_id: body.current_content_id || null,
      
      // Performance metrics
      content_load_time: body.content_load_time,
      api_response_time: body.api_response_time,
      error_count_24h: body.error_count_24h,
      uptime_percentage: Math.round(uptimePercentage * 100) / 100,
      
      // System information
      browser_info: body.browser_info || null,
      screen_resolution: body.screen_resolution || null,
      device_info: body.device_info || null,
      
      created_at: now,
      updated_at: now
    };

    // Check if status record exists
    const { data: existingStatus } = await supabase
      .from('display_status')
      .select('id')
      .eq('display_id', displayId)
      .single();

    if (existingStatus) {
<<<<<<< HEAD
      // Update existing status (exclude created_at since we don't want to update it)
      const { created_at, ...updateData } = statusData;
      const { error: statusUpdateError } = await supabase
        .from('display_status')
        .update(updateData)
=======
      // Update existing status
      const { error: statusUpdateError } = await supabase
        .from('display_status')
        .update({
          ...statusData,
          created_at: undefined // Don't update created_at
        })
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
        .eq('display_id', displayId);

      if (statusUpdateError) {
        console.error('Failed to update display status:', statusUpdateError);
      }
    } else {
      // Create new status record
      const { error: statusCreateError } = await supabase
        .from('display_status')
        .insert(statusData);

      if (statusCreateError) {
        console.error('Failed to create display status:', statusCreateError);
      }
    }

    // Record analytics data for daily aggregation (simplified)
<<<<<<< HEAD
    const today: string = new Date().toISOString().split('T')[0] || ''; // YYYY-MM-DD format
=======
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
    
    // Check if analytics record exists for today
    const { data: existingAnalytics } = await supabase
      .from('display_analytics')
      .select('id, uptime_minutes, error_count')
      .eq('display_id', displayId)
      .eq('date', today)
      .single();

    const uptimeMinutesIncrement = body.is_online ? Math.round(display.heartbeat_interval / 60) : 0;
    const errorCountIncrement = body.error_count_24h > 0 ? 1 : 0;

    if (existingAnalytics) {
      // Update existing analytics record
      const { error: analyticsError } = await supabase
        .from('display_analytics')
        .update({
          uptime_minutes: existingAnalytics.uptime_minutes + uptimeMinutesIncrement,
          error_count: existingAnalytics.error_count + errorCountIncrement
        })
        .eq('id', existingAnalytics.id);

      if (analyticsError) {
        console.error('Failed to update analytics:', analyticsError);
      }
    } else {
      // Create new analytics record for today
      const { error: analyticsError } = await supabase
        .from('display_analytics')
        .insert({
          display_id: displayId,
          date: today,
          uptime_minutes: uptimeMinutesIncrement,
          downtime_minutes: body.is_online ? 0 : Math.round(display.heartbeat_interval / 60),
          error_count: errorCountIncrement,
          content_views: 0, // Will be updated by content viewing events
          unique_content_shown: 0,
          average_content_duration: 0,
          total_sponsorship_revenue: 0,
          active_sponsors: 0,
          created_at: now
        });

      if (analyticsError) {
        console.error('Failed to create analytics record:', analyticsError);
      }
    }

    // Log error if provided
    if (body.last_error) {
      console.error(`Display ${displayId} reported error:`, {
        error: body.last_error,
        stack: body.error_stack,
        timestamp: now
      });
    }

    // Check if configuration has been updated since last heartbeat
    const configUpdated = (display.updated_at || '1970-01-01') > (display.last_heartbeat || '1970-01-01');
    
    // Check if force refresh is needed (e.g., if display has been offline for too long)
    const forceRefresh = timeSinceLastHeartbeat ? timeSinceLastHeartbeat > (display.heartbeat_interval * 1000 * 5) : false;

    // Determine display status
    let displayStatus: 'active' | 'maintenance' | 'disabled' = 'active';
    if (!display.is_active) {
      displayStatus = 'disabled';
    } else if (masjid.status === 'maintenance') {
      displayStatus = 'maintenance';
    }

    // Generate any system messages
    const messages: string[] = [];
    if (body.error_count_24h > 50) {
      messages.push('High error rate detected. Please check system logs.');
    }
    if (body.content_load_time > 5000) {
      messages.push('Slow content loading detected. Check network connection.');
    }
    if (uptimePercentage < 95) {
      messages.push('Uptime below 95%. Please investigate connectivity issues.');
    }

    const response: HeartbeatResponse = {
      acknowledged: true,
      next_heartbeat_in: display.heartbeat_interval,
      config_updated: configUpdated,
      force_refresh: forceRefresh,
      server_time: now,
      display_status: displayStatus,
<<<<<<< HEAD
      ...(messages.length > 0 && { messages })
=======
      messages: messages.length > 0 ? messages : undefined
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
    };

    return NextResponse.json({
      data: response,
      error: null
    }, {
      status: 200,
      headers: {
        'X-Next-Heartbeat': (Date.now() + display.heartbeat_interval * 1000).toString(),
        'X-Config-Updated': configUpdated.toString(),
        'X-Force-Refresh': forceRefresh.toString(),
        'X-Display-Status': displayStatus,
        'X-Uptime-Percentage': uptimePercentage.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Heartbeat processing error:', error);
    return NextResponse.json(
      createApiError(
        'INTERNAL_SERVER_ERROR',
        'Failed to process heartbeat',
        error instanceof Error ? error.message : undefined
      ),
      { status: 500 }
    );
  }
}

// GET endpoint to check display health status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ data: DisplayStatus } | ApiError>> {
  try {
    const { id: displayId } = await params;

    // Get display status
    const { data: status, error: statusError } = await supabase
      .from('display_status')
      .select('*')
      .eq('display_id', displayId)
      .single();

    if (statusError || !status) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Display status not found'),
        { status: 404 }
      );
    }

    // Transform to DisplayStatus interface
    const displayStatus: DisplayStatus = {
      id: status.id,
      display_id: status.display_id,
      is_online: status.is_online,
      last_seen: status.last_seen || new Date().toISOString(),
<<<<<<< HEAD
      ...(status.current_content_id && { current_content_id: status.current_content_id }),
=======
      current_content_id: status.current_content_id || undefined,
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
      content_load_time: status.content_load_time,
      api_response_time: status.api_response_time,
      error_count_24h: status.error_count_24h,
      uptime_percentage: status.uptime_percentage,
<<<<<<< HEAD
      ...(status.browser_info && { browser_info: status.browser_info }),
      ...(status.screen_resolution && { screen_resolution: status.screen_resolution }),
      ...(status.device_info && { device_info: status.device_info }),
=======
      browser_info: status.browser_info || undefined,
      screen_resolution: status.screen_resolution || undefined,
      device_info: status.device_info || undefined,
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
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
        'X-Online-Status': status.is_online.toString()
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