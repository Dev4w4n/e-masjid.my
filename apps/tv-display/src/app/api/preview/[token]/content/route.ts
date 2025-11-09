/**
 * Preview Content API Route
 * 
 * Fetches preview content by session token
 * Allows viewing temporary content without permanent database records
 * 
 * GET /api/preview/[token]/content
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { DisplayContent } from '@masjid-suite/shared-types';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PreviewContentResponse {
  data: DisplayContent;
  meta: {
    is_preview: true;
    expires_at: string;
    masjid_name: string;
  };
}

interface ApiError {
  error: {
    message: string;
    code: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse<PreviewContentResponse | ApiError>> {
  try {
    const { token } = await params;

    console.log('[Preview API] Fetching preview for token:', token);

    // Fetch preview session by token (without join first to debug)
    const { data: session, error: sessionError } = await supabase
      .from('content_preview_sessions' as any)
      .select('*')
      .eq('token', token)
      .single();

    console.log('[Preview API] Query result:', { session, sessionError });

    if (sessionError || !session) {
      console.error('[Preview API] Session not found:', sessionError);
      return NextResponse.json(
        {
          error: {
            message: 'Preview session not found',
            code: 'NOT_FOUND'
          }
        },
        { status: 404 }
      );
    }

    // Fetch masjid separately
    const { data: masjid } = await supabase
      .from('masjids')
      .select('id, name, city, state')
      .eq('id', session.masjid_id)
      .single();

    console.log('[Preview API] Masjid data:', masjid);

    // Check if session has expired
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    if (now > expiresAt) {
      // Clean up expired session
      await supabase
        .from('content_preview_sessions' as any)
        .delete()
        .eq('token', token);

      return NextResponse.json(
        {
          error: {
            message: 'Preview session has expired. Please create a new preview.',
            code: 'EXPIRED'
          }
        },
        { status: 410 } // 410 Gone
      );
    }

    // Update access tracking (fire and forget - don't block response)
    const updatePromise = supabase
      .from('content_preview_sessions' as any)
      .update({
        accessed_at: new Date().toISOString(),
        access_count: session.access_count + 1
      })
      .eq('token', token);
    
    // Handle promise asynchronously without blocking
    updatePromise.then(() => {
      // Success - tracking updated
    }, (err: unknown) => {
      console.warn('Failed to update access tracking:', err);
    });

    // Transform preview snapshot to DisplayContent format
    const snapshot = session.content_snapshot;
    const previewContent: DisplayContent = {
      id: `preview-${session.id}`,
      masjid_id: session.masjid_id,
      title: snapshot.title,
      description: snapshot.description || null,
      type: snapshot.type,
      url: snapshot.url,
      thumbnail_url: null,
      
      // Preview defaults
      sponsorship_amount: 0,
      sponsorship_tier: null,
      payment_status: 'pending',
      payment_reference: null,
      
      // Display settings from snapshot
      duration: snapshot.duration,
      start_date: new Date().toISOString().split('T')[0]!, // Today
      end_date: expiresAt.toISOString().split('T')[0]!, // Expiry date
      image_display_mode: 'contain', // Default display mode (same as live TV)
      
      // Preview status
      status: 'pending',
      submitted_by: session.user_id,
      submitted_at: session.created_at,
      approved_by: null,
      approved_at: null,
      rejection_reason: null,
      
      // QR Code settings
      qr_code_enabled: snapshot.qr_code_enabled || false,
      qr_code_url: snapshot.qr_code_url || null,
      qr_code_position: snapshot.qr_code_position || 'bottom-right',
      
      // Metadata
      file_size: null,
      file_type: null,
      created_at: session.created_at,
      updated_at: session.created_at
    };

    const response: PreviewContentResponse = {
      data: previewContent,
      meta: {
        is_preview: true,
        expires_at: session.expires_at,
        masjid_name: masjid?.name || 'Unknown Masjid'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Preview content API error:', error);
    
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    );
  }
}
