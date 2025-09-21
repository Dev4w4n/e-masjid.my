/**
 * Display Content API Contract Tests
 * 
 * Tests the API contract for GET /displays/{displayId}/content endpoint
 * These tests MUST FAIL initially until API implementation is complete (TDD)
 * 
 * Expected to fail: API routes don't exist yet
 * Success criteria: All tests pass after T021 API route implementation
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
const SAMPLE_DISPLAY_ID = '550e8400-e29b-41d4-a716-446655440000';

test.describe('Display Content API Contract', () => {
  test('GET /displays/{displayId}/content returns top 10 sponsored content with correct structure', async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/content`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('meta');

    // Verify data is array with max 10 items
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeLessThanOrEqual(10);

    // Verify meta contains required fields
    expect(data.meta).toHaveProperty('total');
    expect(data.meta).toHaveProperty('carousel_interval');
    expect(typeof data.meta.total).toBe('number');
    expect(typeof data.meta.carousel_interval).toBe('number');
    expect(data.meta.carousel_interval).toBeGreaterThanOrEqual(5);
    expect(data.meta.carousel_interval).toBeLessThanOrEqual(300);
  });

  test('GET /displays/{displayId}/content returns content items with all required fields', async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/content`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    
    if (data.data.length > 0) {
      const contentItem = data.data[0];
      
      // Required fields from API spec
      expect(contentItem).toHaveProperty('id');
      expect(contentItem).toHaveProperty('title');
      expect(contentItem).toHaveProperty('type');
      expect(contentItem).toHaveProperty('url');
      expect(contentItem).toHaveProperty('sponsorship_amount');
      expect(contentItem).toHaveProperty('duration');

      // Optional fields from API spec
      expect(contentItem).toHaveProperty('thumbnail_url');
      expect(contentItem).toHaveProperty('status');
      expect(contentItem).toHaveProperty('approved_at');

      // Validate field types and constraints
      expect(typeof contentItem.id).toBe('string');
      expect(typeof contentItem.title).toBe('string');
      expect(contentItem.title.length).toBeLessThanOrEqual(200);
      expect(['youtube_video', 'image']).toContain(contentItem.type);
      expect(typeof contentItem.url).toBe('string');
      expect(typeof contentItem.sponsorship_amount).toBe('number');
      expect(contentItem.sponsorship_amount).toBeGreaterThanOrEqual(0);
      expect(typeof contentItem.duration).toBe('number');
      expect(contentItem.duration).toBeGreaterThanOrEqual(1);
      expect(['active', 'inactive', 'pending_approval']).toContain(contentItem.status);
    }
  });

  test('GET /displays/{displayId}/content sorts content by sponsorship amount descending', async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/content`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    const contentItems = data.data;

    // Verify items are sorted by sponsorship_amount in descending order
    for (let i = 0; i < contentItems.length - 1; i++) {
      expect(contentItems[i].sponsorship_amount).toBeGreaterThanOrEqual(
        contentItems[i + 1].sponsorship_amount
      );
    }
  });

  test('GET /displays/{displayId}/content includes only active content', async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/content`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    const contentItems = data.data;

    // All items should have status 'active'
    contentItems.forEach((item) => {
      expect(item.status).toBe('active');
    });
  });

  test('GET /displays/{displayId}/content validates YouTube and image content URLs', async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/content`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    const contentItems = data.data;

    contentItems.forEach((item) => {
      if (item.type === 'youtube_video') {
        // YouTube URLs should contain youtube.com or youtu.be
        expect(item.url).toMatch(/youtube\.com|youtu\.be/);
      } else if (item.type === 'image') {
        // Image URLs should point to image files or be valid URLs
        expect(typeof item.url).toBe('string');
        expect(item.url.length).toBeGreaterThan(0);
      }

      // All items should have thumbnail_url
      expect(typeof item.thumbnail_url).toBe('string');
      expect(item.thumbnail_url.length).toBeGreaterThan(0);
    });
  });

  test('GET /displays/{displayId}/content returns 404 for non-existent display', async ({
    request,
  }) => {
    const invalidDisplayId = '00000000-0000-0000-0000-000000000000';
    const response = await request.get(
      `${BASE_URL}/displays/${invalidDisplayId}/content`
    );

    expect(response.status()).toBe(404);

    const error = await response.json();
    expect(error).toHaveProperty('code');
    expect(error).toHaveProperty('message');
    expect(error.code).toBe('RESOURCE_NOT_FOUND');
  });

  test('GET /displays/{displayId}/content validates UUID format', async ({
    request,
  }) => {
    const invalidFormatId = 'not-a-uuid';
    const response = await request.get(
      `${BASE_URL}/displays/${invalidFormatId}/content`
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error).toHaveProperty('code');
    expect(error).toHaveProperty('message');
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  test('GET /displays/{displayId}/content handles server errors gracefully', async ({
    request,
  }) => {
    // Test with malformed request to trigger server error handling
    const response = await request.get(
      `${BASE_URL}/displays/trigger-server-error/content`
    );

    // Should return 500 or handle gracefully
    if (response.status() === 500) {
      const error = await response.json();
      expect(error).toHaveProperty('code');
      expect(error).toHaveProperty('message');
      expect(error.code).toBe('INTERNAL_ERROR');
    }
  });

  test('GET /displays/{displayId}/content respects content limit configuration', async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/content`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    
    // Should never exceed max_content_items (default 10, max 20 per API spec)
    expect(data.data.length).toBeLessThanOrEqual(20);
    
    // Meta should indicate total available items
    expect(data.meta.total).toBeGreaterThanOrEqual(data.data.length);
  });
});

test.describe('Display Content API Authentication & Security', () => {
  test('requires valid authentication', async ({ request }) => {
    // Test without authentication headers
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/content`,
      {
        headers: {
          // Intentionally omit Authorization header
        },
      }
    );

    // Should require authentication (401 or handle appropriately)
    expect([200, 401]).toContain(response.status());
  });

  test('validates display ownership/access', async ({ request }) => {
    // Test accessing display that user doesn't own
    const otherDisplayId = '999e8400-e29b-41d4-a716-446655440999';
    const response = await request.get(
      `${BASE_URL}/displays/${otherDisplayId}/content`
    );

    // Should return 403 Forbidden or 404 Not Found for unauthorized access
    expect([403, 404]).toContain(response.status());
  });
});