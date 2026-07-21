/**
 * API Route: GET /api/zones/[zone_code]
 * Feature: 007-tv-landing-tiers
 * Task: T032 - Fetch mosques for specific JAKIM zone
 */

import { NextResponse } from 'next/server';
import { ZoneSelectionService, supabase } from '@masjid-suite/supabase-client';
import { ServiceError } from '@masjid-suite/shared-types';

export const runtime = 'edge';

const zoneService = new ZoneSelectionService(supabase);

function isValidZoneCode(zone_code: string): boolean {
  return /^[A-Z]{3}\d{2}$/.test(zone_code);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ zone_code: string }> }
) {
  try {
    const { zone_code } = await params;

    console.log(`[/api/zones/${zone_code}] Fetching mosques...`);

    // Validate zone code format
    if (!isValidZoneCode(zone_code)) {
      console.warn(`[/api/zones/${zone_code}] Invalid zone code format`);

      return NextResponse.json(
        {
          error: 'Invalid zone code format',
          details: `Zone code must be in format: JHR01 (3 letters + 2 digits), received: ${zone_code}`,
        },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const selection = await zoneService.selectZone(zone_code);
    const mosques = await zoneService.fetchMasjidsByZone(zone_code);

    const response = {
      zone_code,
      zone: selection.zone,
      mosques,
      primary_display_id: selection.display_id,
    };

    console.log(`[/api/zones/${zone_code}] Found ${mosques.length} mosques`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // 1 hour
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[/api/zones/[zone_code]] Error:', error);

    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    const status = error instanceof ServiceError ? error.statusCode : 500;

    return NextResponse.json(
      { error: 'Failed to fetch zone data', details: errorMsg },
      {
        status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
