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
import { 
  Database,
  DisplayContent,
  DisplayContentResponse,
  ContentType,
  SponsorshipTier,
} from '@masjid-suite/shared-types';
import {
  ApiError,
  createApiResponse,
  createApiError 
} from '../../../../../lib/api-utils';

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    // Include content for this specific display OR content for all displays (display_id IS NULL)
    let query = supabase
      .from('display_content')
      .select(`
        *,
        sponsorships (
          sponsor_name,
          sponsor_message,
          tier,
          amount
        )
      `)
      .or(`display_id.eq.${displayId},display_id.is.null`)
      .order('sponsorship_amount', { ascending: false })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters.type?.length) {
      query = query.in('type', filters.type);
    }
    if (filters.min_amount !== undefined) {
      query = query.gte('sponsorship_amount', filters.min_amount);
    }
    if (filters.max_amount !== undefined) {
      query = query.lte('sponsorship_amount', filters.max_amount);
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('display_content')
      .select('*', { count: 'exact', head: true })
      .or(`display_id.eq.${displayId},display_id.is.null`);

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
    const transformedContent: DisplayContent[] = content?.map(item => ({
      id: item.id,
      masjid_id: display.masjid_id,
      display_id: item.display_id || '',
      title: item.title,
      ...(item.description && { description: item.description }),
      type: item.type,
      url: item.url,
      ...(item.thumbnail_url && { thumbnail_url: item.thumbnail_url }),
      sponsorship_amount: item.sponsorship_amount,
      ...(item.sponsorship_tier && { sponsorship_tier: item.sponsorship_tier }),
      payment_status: item.payment_status,
      ...(item.payment_reference && { payment_reference: item.payment_reference }),
      duration: item.duration,
      start_date: item.start_date,
      end_date: item.end_date,
      status: item.status,
      submitted_by: item.submitted_by,
      submitted_at: item.submitted_at || item.created_at || '',
      ...(item.approved_by && { approved_by: item.approved_by }),
      ...(item.approved_at && { approved_at: item.approved_at }),
      ...(item.rejection_reason && { rejection_reason: item.rejection_reason }),
      ...(item.file_size && { file_size: item.file_size }),
      ...(item.file_type && { file_type: item.file_type }),
      created_at: item.created_at || '',
      updated_at: item.updated_at || ''
    })) || [];

    // Get content statistics
    const { data: stats } = await supabase
      .from('display_content')
      .select('status')
      .or(`display_id.eq.${displayId},display_id.is.null`);

    const activeCount = stats?.filter(s => s.status === 'active').length || 0;
    const pendingCount = stats?.filter(s => s.status === 'pending').length || 0;

    // Get total sponsorship revenue
    const { data: revenueData } = await supabase
      .from('sponsorships')
      .select('amount')
      .eq('masjid_id', display.masjid_id)
      .eq('payment_status', 'paid');

    const totalRevenue = revenueData?.reduce((sum, item) => sum + item.amount, 0) || 0;

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
        total_pending: pendingCount,
        sponsorship_revenue: totalRevenue
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

// Sponsorship tier thresholds (in MYR)
const SPONSORSHIP_TIERS = {
  bronze: { min: 50, max: 199 },
  silver: { min: 200, max: 499 },
  gold: { min: 500, max: 999 },
  platinum: { min: 1000, max: Infinity }
};

function calculateSponsorshipTier(amount: number): SponsorshipTier {
  if (amount >= SPONSORSHIP_TIERS.platinum.min) return 'platinum';
  if (amount >= SPONSORSHIP_TIERS.gold.min) return 'gold';
  if (amount >= SPONSORSHIP_TIERS.silver.min) return 'silver';
  return 'bronze';
}

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
    const sponsorshipAmount = parseFloat(formData.get('sponsorship_amount') as string);
    const submittedBy = formData.get('submitted_by') as string;
    
    // Optional fields
    const url = formData.get('url') as string | null;
    const file = formData.get('file') as File | null;
    const sponsorName = formData.get('sponsor_name') as string | null;
    const sponsorEmail = formData.get('sponsor_email') as string | null;
    const sponsorPhone = formData.get('sponsor_phone') as string | null;
    const sponsorMessage = formData.get('sponsor_message') as string | null;
    const showSponsorName = formData.get('show_sponsor_name') === 'true';

    // Validation
    if (!title || !type || !duration || !startDate || !endDate || !sponsorshipAmount || !submittedBy) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Missing required fields: title, type, duration, start_date, end_date, sponsorship_amount, submitted_by'),
        { status: 400 }
      );
    }

    if (sponsorshipAmount < SPONSORSHIP_TIERS.bronze.min) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', `Minimum sponsorship amount is RM${SPONSORSHIP_TIERS.bronze.min}`),
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

    // Calculate sponsorship tier
    const sponsorshipTier = calculateSponsorshipTier(sponsorshipAmount);

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
      
      // Sponsorship details
      sponsorship_amount: sponsorshipAmount,
      sponsorship_tier: sponsorshipTier,
      payment_status: 'pending' as const,
      payment_reference: null,
      
      // Display settings
      duration,
      start_date: startDate,
      end_date: endDate,
      
      // Content management
      status: 'pending' as const,
      submitted_by: submittedBy,
      submitted_at: new Date().toISOString(),
      approved_by: null,
      approved_at: null,
      rejection_reason: null,
      
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

    // Create sponsorship record if sponsor details provided
    if (sponsorName) {
      const sponsorshipData = {
        id: crypto.randomUUID(),
        content_id: contentId,
        masjid_id: display.masjid_id,
        sponsor_name: sponsorName,
        sponsor_email: sponsorEmail || null,
        sponsor_phone: sponsorPhone || null,
        
        amount: sponsorshipAmount,
        currency: 'MYR' as const,
        tier: sponsorshipTier,
        
        payment_method: 'fpx' as const, // Default payment method
        payment_reference: `pending-${contentId}`,
        payment_status: 'pending' as const,
        payment_date: null,
        
        show_sponsor_name: showSponsorName,
        sponsor_message: sponsorMessage || null,
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: sponsorshipError } = await supabase
        .from('sponsorships')
        .insert(sponsorshipData);

      if (sponsorshipError) {
        console.error('Sponsorship creation error:', sponsorshipError);
        // Log error but don't fail the content creation
      }
    }

    // Transform database record to DisplayContent interface
    const responseContent: DisplayContent = {
      id: createdContent.id,
      masjid_id: createdContent.masjid_id,
      display_id: createdContent.display_id || displayId,
      title: createdContent.title,
      ...(createdContent.description && { description: createdContent.description }),
      type: createdContent.type as ContentType,
      url: createdContent.url,
      ...(createdContent.thumbnail_url && { thumbnail_url: createdContent.thumbnail_url }),
      
      sponsorship_amount: createdContent.sponsorship_amount,
      ...(createdContent.sponsorship_tier && { sponsorship_tier: createdContent.sponsorship_tier as SponsorshipTier }),
      payment_status: createdContent.payment_status as any,
      ...(createdContent.payment_reference && { payment_reference: createdContent.payment_reference }),
      
      duration: createdContent.duration,
      start_date: createdContent.start_date,
      end_date: createdContent.end_date,
      
      status: createdContent.status as any,
      submitted_by: createdContent.submitted_by,
      submitted_at: createdContent.submitted_at || new Date().toISOString(),
      ...(createdContent.approved_by && { approved_by: createdContent.approved_by }),
      ...(createdContent.approved_at && { approved_at: createdContent.approved_at }),
      ...(createdContent.rejection_reason && { rejection_reason: createdContent.rejection_reason }),
      
      ...(createdContent.file_size && { file_size: createdContent.file_size }),
      ...(createdContent.file_type && { file_type: createdContent.file_type }),
      created_at: createdContent.created_at || new Date().toISOString(),
      updated_at: createdContent.updated_at || new Date().toISOString()
    };

    return NextResponse.json({
      data: responseContent,
      error: null
    }, {
      status: 201,
      headers: {
        'X-Content-ID': contentId,
        'X-Sponsorship-Tier': sponsorshipTier,
        'X-Payment-Status': 'pending',
        'X-Approval-Status': 'pending'
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