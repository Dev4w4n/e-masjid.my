/**
 * Display Content API Route
 * GET /api/displays/[id]/content
 * 
 * Returns paginated, filtered content for a specific display
 * Content is ordered by sponsorship amount (highest first)
 * Supports filtering by type, status, date range, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Required for Cloudflare Pages deployment
export const runtime = 'edge';
import { 
  Database,
  DisplayContent,
  DisplayContentResponse,
  ContentType,
} from '@masjid-suite/shared-types';
import {
  ApiError,
  createApiResponse,
  createApiError 
} from '../../../../../lib/api-utils';

// Create Supabase client for API routes
// Uses anon key for security - RLS policies control access
function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

interface ContentFilters {
  status?: Array<'active' | 'pending' | 'rejected' | 'expired'>;
  type?: Array<'image' | 'youtube_video' | 'text_announcement' | 'event_poster'>;
  min_amount?: number;
  max_amount?: number;
  date_from?: string;
  date_to?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<DisplayContentResponse | ApiError>> {
  try {
    // Create Supabase client
    const supabase = createSupabaseClient();
    
    // Await params in Next.js 15
    const { id: displayId } = await params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Parse filters with proper type casting
    const minAmount = searchParams.get('min_amount');
    const maxAmount = searchParams.get('max_amount');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    
    const filters: ContentFilters = {
      status: searchParams.get('status')?.split(',').filter(s => 
        ['active', 'pending', 'rejected', 'expired'].includes(s)
      ) as Array<'active' | 'pending' | 'rejected' | 'expired'> || ['active'],
      type: searchParams.get('type')?.split(',').filter(t =>
        ['image', 'youtube_video', 'text_announcement', 'event_poster'].includes(t)
      ) as Array<'image' | 'youtube_video' | 'text_announcement' | 'event_poster'> || undefined,
      ...(minAmount && { min_amount: parseFloat(minAmount) }),
      ...(maxAmount && { max_amount: parseFloat(maxAmount) }),
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo })
    };

    // Verify display exists and get display configuration
    const { data: display, error: displayError } = await supabase
      .from('tv_displays')
      .select('id, masjid_id, carousel_interval, display_name, is_active')
      .eq('id', displayId)
      .eq('is_active', true)
      .single();

    if (displayError || !display) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Display not found or inactive'),
        { status: 404 }
      );
    }

    // Build content query with filters
    // Use the new display_content_assignments join table to get content for this display
    // Include per-content settings: carousel_duration, transition_type, image_display_mode, sort_order
    let query = supabase
      .from('display_content')
      .select(`
        *,
        display_content_assignments!inner (
          display_id,
          carousel_duration,
          transition_type,
          image_display_mode,
          display_order
        )
      `)
      .eq('display_content_assignments.display_id', displayId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters.type?.length) {
      query = query.in('type', filters.type);
    }
    // Note: sponsorship_amount filters removed (schema simplified in migration 100)
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('display_content')
      .select('*, display_content_assignments!inner(display_id)', { count: 'exact', head: true })
      .eq('display_content_assignments.display_id', displayId);

    // Get paginated content
    const { data: content, error: contentError } = await query
      .range(offset, offset + limit - 1);

    if (contentError) {
      console.error('Content query error:', contentError);
      return NextResponse.json(
        createApiError('INTERNAL_SERVER_ERROR', 'Failed to fetch content', contentError.message),
        { status: 500 }
      );
    }

    // Transform content to match DisplayContent interface
    // Include per-content settings from display_content_assignments
    const transformedContent: DisplayContent[] = (content?.map((item: any) => {
      // Extract assignment settings (array with single element from join)
      const assignment = Array.isArray(item.display_content_assignments) 
        ? item.display_content_assignments[0] 
        : item.display_content_assignments;
      
      return {
        id: item.id,
        masjid_id: display.masjid_id,
        display_id: displayId, // Use the displayId from params since content is assigned to this display
        title: item.title,
        ...(item.description && { description: item.description }),
        type: item.type,
        url: item.url,
        ...(item.thumbnail_url && { thumbnail_url: item.thumbnail_url }),
        // Sponsorship fields removed in migration 100_simplification_cleanup.sql
        sponsorship_amount: 0,
        payment_status: 'paid', // Default to paid for simplified schema
        duration: item.duration,
        start_date: item.start_date,
        end_date: item.end_date,
        status: item.status,
        submitted_by: item.submitted_by,
        submitted_at: item.submitted_at || item.created_at || '',
        // Approval fields removed in simplification
        ...(item.file_size && { file_size: item.file_size }),
        ...(item.file_type && { file_type: item.file_type }),
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
        // Add per-content carousel settings from assignments
        ...(assignment && {
          carousel_duration: assignment.carousel_duration,
          transition_type: assignment.transition_type,
          image_display_mode: assignment.image_display_mode,
          display_order: assignment.display_order
        }),
        // QR Code fields
        qr_code_enabled: item.qr_code_enabled || false,
        ...(item.qr_code_url && { qr_code_url: item.qr_code_url }),
        ...(item.qr_code_position && { qr_code_position: item.qr_code_position })
      };
    }) || [])
    // Sort by display_order (ascending), then by created_at (descending)
    .sort((a, b) => {
      // Primary sort: display_order (lower numbers first)
      if (a.display_order !== undefined && b.display_order !== undefined) {
        if (a.display_order !== b.display_order) {
          return a.display_order - b.display_order;
        }
      }
      // Secondary sort: created_at (newer first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Get content statistics
    const { data: stats } = await supabase
      .from('display_content')
      .select('status, display_content_assignments!inner(display_id)')
      .eq('display_content_assignments.display_id', displayId);

    const activeCount = stats?.filter((s: any) => s.status === 'active').length || 0;
    const pendingCount = stats?.filter((s: any) => s.status === 'pending').length || 0;

    // Calculate pagination
    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;
    const nextPage = hasMore ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    // Create response matching DisplayContentResponse interface
    const response: DisplayContentResponse = {
      data: transformedContent,
      meta: {
        total: count || 0,
        page,
        limit,
        offset,
        has_more: hasMore,
        next_page: nextPage,
        prev_page: prevPage,
        last_updated: new Date().toISOString(),
        carousel_interval: display.carousel_interval,
        next_refresh: new Date(Date.now() + display.carousel_interval * 1000).toISOString(),
        total_active: activeCount,
        total_pending: pendingCount
      },
      links: {
        self: new URL(request.url).toString(),
        ...(nextPage && { next: `${new URL(request.url).origin}${new URL(request.url).pathname}?page=${nextPage}&limit=${limit}` }),
        ...(prevPage && { prev: `${new URL(request.url).origin}${new URL(request.url).pathname}?page=${prevPage}&limit=${limit}` })
      },
      error: null
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': filters.status?.includes('pending') ? 
          'no-cache' : `public, max-age=${Math.min(display.carousel_interval, 300)}`,
        'X-Total-Count': (count || 0).toString(),
        'X-Current-Page': page.toString(),
        'X-Total-Pages': totalPages.toString(),
      }
    });

  } catch (error) {
    console.error('Unexpected error in content API:', error);
    return NextResponse.json(
      createApiError(
        'INTERNAL_SERVER_ERROR', 
        'An unexpected error occurred',
        error instanceof Error ? error.message : undefined
      ),
      { status: 500 }
    );
  }
}

// Constants for validation (POST)
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

function validateContentType(type: string, url: string, mimeType?: string): boolean {
  switch (type as ContentType) {
    case 'image':
      return mimeType ? ALLOWED_IMAGE_TYPES.includes(mimeType) : false;
    
    case 'youtube_video':
      return YOUTUBE_URL_REGEX.test(url);
    
    case 'text_announcement':
      return true; // Text announcements don't require file validation
    
    case 'event_poster':
      return mimeType ? ALLOWED_IMAGE_TYPES.includes(mimeType) : false;
    
    default:
      return false;
  }
}

async function uploadFileToStorage(file: File, contentId: string, masjidId: string): Promise<string> {
  const supabase = createSupabaseClient();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${contentId}.${fileExtension}`;
  const filePath = `masjids/${masjidId}/content/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('tv-display-content')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('tv-display-content')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ data: DisplayContent } | ApiError>> {
  try {
    // Create Supabase client
    const supabase = createSupabaseClient();
    
    const { id: displayId } = await params;
    
    // Verify display exists and get masjid information
    const { data: display, error: displayError } = await supabase
      .from('tv_displays')
      .select(`
        id,
        masjid_id,
        is_active,
        max_content_items,
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

    const masjid = display.masjids as any;
    if (masjid.status !== 'active') {
      return NextResponse.json(
        createApiError('FORBIDDEN', 'Masjid is not active'),
        { status: 403 }
      );
    }

    // Check current content count against limit
    const { count: currentContentCount } = await supabase
      .from('display_content')
      .select('*', { count: 'exact', head: true })
      .eq('display_id', displayId)
      .in('status', ['pending', 'active']);

    if (currentContentCount && currentContentCount >= display.max_content_items) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', `Maximum content limit reached (${display.max_content_items} items)`),
        { status: 400 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    
    // Extract required fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const type = formData.get('type') as ContentType;
    const duration = parseInt(formData.get('duration') as string);
    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('end_date') as string;
    const submittedBy = formData.get('submitted_by') as string;
    
    // Optional fields
    const url = formData.get('url') as string | null;
    const file = formData.get('file') as File | null;

    // Validation
    if (!title || !type || !duration || !startDate || !endDate || !submittedBy) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Missing required fields: title, type, duration, start_date, end_date, submitted_by'),
        { status: 400 }
      );
    }

    if (duration < 5 || duration > 300) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Duration must be between 5 and 300 seconds'),
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Start date cannot be in the past'),
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'End date must be after start date'),
        { status: 400 }
      );
    }

    // Validate content based on type
    let contentUrl = url || '';
    let thumbnailUrl: string | undefined;
    let fileSize: number | undefined;
    let fileType: string | undefined;

    if (type === 'youtube_video') {
      if (!url || !validateContentType(type, url)) {
        return NextResponse.json(
          createApiError('VALIDATION_ERROR', 'Valid YouTube URL is required for video content'),
          { status: 400 }
        );
      }
      contentUrl = url;
    } else if (type === 'text_announcement') {
      if (!description) {
        return NextResponse.json(
          createApiError('VALIDATION_ERROR', 'Description is required for text announcements'),
          { status: 400 }
        );
      }
      contentUrl = 'text:announcement'; // Placeholder URL for text content
    } else if ((type === 'image' || type === 'event_poster') && file) {
      // Validate file
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          createApiError('VALIDATION_ERROR', 'File size exceeds 100MB limit'),
          { status: 400 }
        );
      }

      if (!validateContentType(type, '', file.type)) {
        return NextResponse.json(
          createApiError('VALIDATION_ERROR', `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`),
          { status: 400 }
        );
      }

      fileSize = file.size;
      fileType = file.type;
    } else {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'File or URL is required based on content type'),
        { status: 400 }
      );
    }

    // Generate content ID
    const contentId = crypto.randomUUID();

    // Upload file if provided
    if (file && (type === 'image' || type === 'event_poster')) {
      try {
        contentUrl = await uploadFileToStorage(file, contentId, display.masjid_id);
        // For images, use the same URL as thumbnail
        thumbnailUrl = contentUrl;
      } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json(
          createApiError('INTERNAL_SERVER_ERROR', 'Failed to upload file', error instanceof Error ? error.message : undefined),
          { status: 500 }
        );
      }
    }

    // Create content record
    const newContent = {
      id: contentId,
      masjid_id: display.masjid_id,
      display_id: displayId,
      title,
      description: description || null,
      type,
      url: contentUrl,
      thumbnail_url: thumbnailUrl || null,
      
      // Display settings
      duration,
      start_date: startDate,
      end_date: endDate,
      
      // Content management
      status: 'active' as const,
      submitted_by: submittedBy,
      submitted_at: new Date().toISOString(),
      
      // File metadata
      file_size: fileSize || null,
      file_type: fileType || null,
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: createdContent, error: contentError } = await supabase
      .from('display_content')
      .insert(newContent)
      .select()
      .single();

    if (contentError) {
      console.error('Content creation error:', contentError);
      return NextResponse.json(
        createApiError('INTERNAL_SERVER_ERROR', 'Failed to create content record', contentError.message),
        { status: 500 }
      );
    }

    // Transform database record to DisplayContent interface
    const responseContent: DisplayContent = {
      id: createdContent.id,
      masjid_id: createdContent.masjid_id,
      title: createdContent.title,
      ...(createdContent.description && { description: createdContent.description }),
      type: createdContent.type as ContentType,
      url: createdContent.url,
      ...(createdContent.thumbnail_url && { thumbnail_url: createdContent.thumbnail_url }),
      
      duration: createdContent.duration,
      start_date: createdContent.start_date,
      end_date: createdContent.end_date,
      
      status: createdContent.status as any,
      submitted_by: createdContent.submitted_by,
      submitted_at: createdContent.submitted_at || new Date().toISOString(),
      
      ...(createdContent.file_size && { file_size: createdContent.file_size }),
      ...(createdContent.file_type && { file_type: createdContent.file_type }),
      created_at: createdContent.created_at || new Date().toISOString(),
      updated_at: createdContent.updated_at || new Date().toISOString(),

      // QR Code fields
      qr_code_enabled: createdContent.qr_code_enabled || false,
      ...(createdContent.qr_code_url && { qr_code_url: createdContent.qr_code_url }),
      ...(createdContent.qr_code_position && { qr_code_position: createdContent.qr_code_position as "top-left" | "top-right" | "bottom-left" | "bottom-right" })
    };

    return NextResponse.json({
      data: responseContent,
      error: null
    }, {
      status: 201,
      headers: {
        'X-Content-ID': contentId
      }
    });

  } catch (error) {
    console.error('Content upload error:', error);
    return NextResponse.json(
      createApiError(
        'INTERNAL_SERVER_ERROR',
        'Failed to upload content',
        error instanceof Error ? error.message : undefined
      ),
      { status: 500 }
    );
  }
}

// Health check endpoint for monitoring
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Create Supabase client
    const supabase = createSupabaseClient();
    
    const { id: displayId } = await params;
    
    // Quick check if display exists and is active
    const { data: display, error } = await supabase
      .from('tv_displays')
      .select('id, status')
      .eq('id', displayId)
      .eq('status', 'active')
      .single();

    if (error || !display) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(null, { 
      status: 200,
      headers: {
        'X-Display-Status': 'active',
        'X-Last-Check': new Date().toISOString()
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}