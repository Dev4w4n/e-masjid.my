/**
 * Sponsorship Management API Route
 * GET /api/displays/[id]/sponsorships - List sponsorships with filtering and pagination
 * POST /api/displays/[id]/sponsorships - Create standalone sponsorship
 * PUT /api/displays/[id]/sponsorships/[sponsorshipId] - Update sponsorship details
 * 
 * Handles sponsorship management, payment tracking, sponsor visibility control,
 * and payment method integration for TV display content
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  Database,
  Sponsorship,
  SponsorshipTier,
} from '@masjid-suite/shared-types';
import {
  ApiError,
  ApiResponse,
  createApiError 
} from '../../../../../lib/api-utils';

// Create Supabase client lazily to avoid build-time issues
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

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

interface SponsorshipFilters {
  status?: Array<'pending' | 'paid' | 'failed' | 'refunded'>;
  tier?: SponsorshipTier[];
  min_amount?: number;
  max_amount?: number;
  payment_method?: Array<'fpx' | 'credit_card' | 'bank_transfer' | 'cash'>;
  date_from?: string;
  date_to?: string;
  content_id?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Create Supabase client
    const supabase = createSupabaseClient();
    
    const { id: displayId } = await params;
    const { searchParams } = new URL(request.url);

    // Verify display exists and get masjid information
    const { data: display, error: displayError } = await supabase
      .from('tv_displays')
      .select(`
        id,
        masjid_id,
        is_active,
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

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Parse filters
    const filters: SponsorshipFilters = {
      ...(searchParams.get('status') && { status: searchParams.get('status')?.split(',') as any }),
      ...(searchParams.get('tier') && { tier: searchParams.get('tier')?.split(',') as SponsorshipTier[] }),
      ...(searchParams.get('min_amount') && { min_amount: parseFloat(searchParams.get('min_amount')!) }),
      ...(searchParams.get('max_amount') && { max_amount: parseFloat(searchParams.get('max_amount')!) }),
      ...(searchParams.get('payment_method') && { payment_method: searchParams.get('payment_method')?.split(',') as any }),
      ...(searchParams.get('date_from') && { date_from: searchParams.get('date_from')! }),
      ...(searchParams.get('date_to') && { date_to: searchParams.get('date_to')! }),
      ...(searchParams.get('content_id') && { content_id: searchParams.get('content_id')! })
    };

    // Build query with joins to get content information
    let query = supabase
      .from('sponsorships')
      .select(`
        *,
        display_content (
          id,
          title,
          type,
          status,
          start_date,
          end_date
        )
      `)
      .eq('masjid_id', display.masjid_id)
      .order('amount', { ascending: false });

    // Apply filters
    if (filters.status?.length) {
      query = query.in('payment_status', filters.status);
    }

    if (filters.tier?.length) {
      query = query.in('tier', filters.tier);
    }

    if (filters.min_amount !== undefined) {
      query = query.gte('amount', filters.min_amount);
    }

    if (filters.max_amount !== undefined) {
      query = query.lte('amount', filters.max_amount);
    }

    if (filters.payment_method?.length) {
      query = query.in('payment_method', filters.payment_method);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    if (filters.content_id) {
      query = query.eq('content_id', filters.content_id);
    }

    // Execute query with pagination
    const { data: sponsorships, error: sponsorshipsError, count } = await query
      .range(offset, offset + limit - 1);

    if (sponsorshipsError) {
      console.error('Sponsorships query error:', sponsorshipsError);
      return NextResponse.json(
        createApiError('INTERNAL_SERVER_ERROR', 'Failed to fetch sponsorships', sponsorshipsError.message),
        { status: 500 }
      );
    }

    // Transform database records to Sponsorship interfaces
    const transformedSponsorships: Sponsorship[] = (sponsorships || []).map(sponsorship => ({
      id: sponsorship.id,
      content_id: sponsorship.content_id,
      masjid_id: sponsorship.masjid_id,
      sponsor_name: sponsorship.sponsor_name,
      ...(sponsorship.sponsor_email && { sponsor_email: sponsorship.sponsor_email }),
      ...(sponsorship.sponsor_phone && { sponsor_phone: sponsorship.sponsor_phone }),
      
      amount: sponsorship.amount,
      currency: sponsorship.currency as 'MYR',
      tier: sponsorship.tier as SponsorshipTier,
      
      payment_method: sponsorship.payment_method as any,
      payment_reference: sponsorship.payment_reference,
      payment_status: sponsorship.payment_status as any,
      ...(sponsorship.payment_date && { payment_date: sponsorship.payment_date }),
      
      show_sponsor_name: sponsorship.show_sponsor_name,
      ...(sponsorship.sponsor_message && { sponsor_message: sponsorship.sponsor_message }),
      
      created_at: sponsorship.created_at || new Date().toISOString(),
      updated_at: sponsorship.updated_at || new Date().toISOString()
    }));

    // Calculate totals and statistics
    const totalSponsorships = count || 0;
    const totalPages = Math.ceil(totalSponsorships / limit);
    const totalAmount = sponsorships?.reduce((sum, s) => sum + s.amount, 0) || 0;
    const paidAmount = sponsorships?.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.amount, 0) || 0;

    const response = {
      data: transformedSponsorships,
      pagination: {
        page,
        limit,
        total: totalSponsorships,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
        next_page: page < totalPages ? page + 1 : null,
        prev_page: page > 1 ? page - 1 : null
      },
      summary: {
        total_amount: totalAmount,
        paid_amount: paidAmount,
        pending_amount: totalAmount - paidAmount
      },
      error: null
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=60', // 1 minute cache
        'X-Total-Count': totalSponsorships.toString(),
        'X-Total-Amount': totalAmount.toString(),
        'X-Paid-Amount': paidAmount.toString(),
      }
    });

  } catch (error) {
    console.error('Error fetching sponsorships:', error);
    return NextResponse.json(
      createApiError(
        'INTERNAL_SERVER_ERROR',
        'Failed to fetch sponsorships',
        error instanceof Error ? error.message : undefined
      ),
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ data: Sponsorship } | ApiError>> {
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

    const body = await request.json();

    // Validate required fields
    const {
      content_id,
      sponsor_name,
      sponsor_email,
      sponsor_phone,
      amount,
      payment_method,
      show_sponsor_name,
      sponsor_message
    } = body;

    if (!sponsor_name || !amount || !payment_method) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Missing required fields: sponsor_name, amount, payment_method'),
        { status: 400 }
      );
    }

    if (amount < SPONSORSHIP_TIERS.bronze.min) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', `Minimum sponsorship amount is RM${SPONSORSHIP_TIERS.bronze.min}`),
        { status: 400 }
      );
    }

    // Validate payment method
    const validPaymentMethods = ['fpx', 'credit_card', 'bank_transfer', 'cash'];
    if (!validPaymentMethods.includes(payment_method)) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', `Invalid payment method. Allowed: ${validPaymentMethods.join(', ')}`),
        { status: 400 }
      );
    }

    // If content_id provided, verify it exists and belongs to this display
    if (content_id) {
      const { data: content, error: contentError } = await supabase
        .from('display_content')
        .select('id, display_id')
        .eq('id', content_id)
        .eq('display_id', displayId)
        .single();

      if (contentError || !content) {
        return NextResponse.json(
          createApiError('NOT_FOUND', 'Content not found or does not belong to this display'),
          { status: 404 }
        );
      }
    }

    // Calculate sponsorship tier
    const tier = calculateSponsorshipTier(amount);

    // Generate sponsorship ID and payment reference
    const sponsorshipId = crypto.randomUUID();
    const paymentReference = `SP-${sponsorshipId.substring(0, 8).toUpperCase()}`;

    // Create sponsorship record
    const newSponsorship = {
      id: sponsorshipId,
      content_id: content_id || null,
      masjid_id: display.masjid_id,
      sponsor_name,
      sponsor_email: sponsor_email || null,
      sponsor_phone: sponsor_phone || null,
      
      amount,
      currency: 'MYR' as const,
      tier,
      
      payment_method,
      payment_reference: paymentReference,
      payment_status: 'pending' as const,
      payment_date: null,
      
      show_sponsor_name: show_sponsor_name || false,
      sponsor_message: sponsor_message || null,
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: createdSponsorship, error: sponsorshipError } = await supabase
      .from('sponsorships')
      .insert(newSponsorship)
      .select()
      .single();

    if (sponsorshipError) {
      console.error('Sponsorship creation error:', sponsorshipError);
      return NextResponse.json(
        createApiError('INTERNAL_SERVER_ERROR', 'Failed to create sponsorship record', sponsorshipError.message),
        { status: 500 }
      );
    }

    // Transform database record to Sponsorship interface
    const responseSponsorship: Sponsorship = {
      id: createdSponsorship.id,
      content_id: createdSponsorship.content_id,
      masjid_id: createdSponsorship.masjid_id,
      sponsor_name: createdSponsorship.sponsor_name,
      ...(createdSponsorship.sponsor_email && { sponsor_email: createdSponsorship.sponsor_email }),
      ...(createdSponsorship.sponsor_phone && { sponsor_phone: createdSponsorship.sponsor_phone }),
      
      amount: createdSponsorship.amount,
      currency: createdSponsorship.currency as 'MYR',
      tier: createdSponsorship.tier as SponsorshipTier,
      
      payment_method: createdSponsorship.payment_method as any,
      payment_reference: createdSponsorship.payment_reference,
      payment_status: createdSponsorship.payment_status as any,
      ...(createdSponsorship.payment_date && { payment_date: createdSponsorship.payment_date }),
      
      show_sponsor_name: createdSponsorship.show_sponsor_name,
      ...(createdSponsorship.sponsor_message && { sponsor_message: createdSponsorship.sponsor_message }),
      
      created_at: createdSponsorship.created_at || new Date().toISOString(),
      updated_at: createdSponsorship.updated_at || new Date().toISOString()
    };

    return NextResponse.json({
      data: responseSponsorship,
      error: null
    }, {
      status: 201,
      headers: {
        'X-Sponsorship-ID': sponsorshipId,
        'X-Payment-Reference': paymentReference,
        'X-Sponsorship-Tier': tier,
        'X-Payment-Status': 'pending'
      }
    });

  } catch (error) {
    console.error('Sponsorship creation error:', error);
    return NextResponse.json(
      createApiError(
        'INTERNAL_SERVER_ERROR',
        'Failed to create sponsorship',
        error instanceof Error ? error.message : undefined
      ),
      { status: 500 }
    );
  }
}