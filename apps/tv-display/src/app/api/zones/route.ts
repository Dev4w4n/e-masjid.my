/**
 * API Route: GET /api/zones
 * Feature: 007-tv-landing-tiers
 * Task: T031 - Fetch all 68 official JAKIM zones
 */

import { NextResponse } from 'next/server';
import { ZoneSelectionService, supabase } from '@masjid-suite/supabase-client';
import { ServiceError } from '@masjid-suite/shared-types';

export const runtime = 'edge';

const zoneService = new ZoneSelectionService(supabase);

export async function GET() {
  try {
    const zones = await zoneService.fetchAllZones();

    return NextResponse.json(
      { zones, cached_at: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600', // 1 hour
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[/api/zones] Error:', error);

    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    const status = error instanceof ServiceError ? error.statusCode : 500;

    return NextResponse.json(
      { error: 'Failed to fetch zones', details: errorMsg },
      {
        status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
