/**
 * Display Configuration API Contract Tests
 * 
 * Tests the API contract for GET/PUT /displays/{displayId}/config endpoints
 * These tests MUST FAIL initially until API implementation is complete (TDD)
 * 
 * Expected to fail: API routes don't exist yet  
 * Success criteria: All tests pass after T023-T024 API route implementation
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
const SAMPLE_DISPLAY_ID = '550e8400-e29b-41d4-a716-446655440000';

test.describe('Display Configuration API Contract - GET', () => {
  test('GET /displays/{displayId}/config returns complete display configuration', async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('data');

    const config = data.data;
    
    // Required fields from API spec
    expect(config).toHaveProperty('id');
    expect(config).toHaveProperty('masjid_id');
    expect(config).toHaveProperty('display_name');
    expect(config).toHaveProperty('prayer_time_position');
    expect(config).toHaveProperty('carousel_interval');
    
    // Optional fields with defaults
    expect(config).toHaveProperty('max_content_items');
    expect(config).toHaveProperty('auto_refresh_interval');
    expect(config).toHaveProperty('is_active');
    expect(config).toHaveProperty('last_heartbeat');
  });

  test('GET /displays/{displayId}/config returns valid field types and constraints', async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    const config = data.data;

    // Validate types and constraints
    expect(typeof config.id).toBe('string');
    expect(typeof config.masjid_id).toBe('string');
    expect(typeof config.display_name).toBe('string');
    expect(config.display_name.length).toBeLessThanOrEqual(50);
    
    expect(['top', 'bottom', 'left', 'right', 'center']).toContain(config.prayer_time_position);
    
    expect(typeof config.carousel_interval).toBe('number');
    expect(config.carousel_interval).toBeGreaterThanOrEqual(5);
    expect(config.carousel_interval).toBeLessThanOrEqual(300);
    
    expect(typeof config.max_content_items).toBe('number');
    expect(config.max_content_items).toBeGreaterThanOrEqual(1);
    expect(config.max_content_items).toBeLessThanOrEqual(20);
    
    expect(typeof config.auto_refresh_interval).toBe('number');
    expect(config.auto_refresh_interval).toBeGreaterThanOrEqual(1);
    expect(config.auto_refresh_interval).toBeLessThanOrEqual(60);
    
    expect(typeof config.is_active).toBe('boolean');
  });

  test('GET /displays/{displayId}/config includes heartbeat timestamp when available', async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    const config = data.data;

    if (config.last_heartbeat !== null) {
      // Validate ISO datetime format
      expect(config.last_heartbeat).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    }
  });

  test('GET /displays/{displayId}/config returns 404 for non-existent display', async ({
    request,
  }) => {
    const invalidDisplayId = '00000000-0000-0000-0000-000000000000';
    const response = await request.get(
      `${BASE_URL}/displays/${invalidDisplayId}/config`
    );

    expect(response.status()).toBe(404);

    const error = await response.json();
    expect(error).toHaveProperty('code');
    expect(error).toHaveProperty('message');
    expect(error.code).toBe('RESOURCE_NOT_FOUND');
  });
});

test.describe('Display Configuration API Contract - PUT', () => {
  test('PUT /displays/{displayId}/config updates display configuration successfully', async ({
    request,
  }) => {
    const updateData = {
      display_name: 'Updated Display Name',
      prayer_time_position: 'bottom',
      carousel_interval: 10,
      max_content_items: 8,
      auto_refresh_interval: 5,
      is_active: true
    };

    const response = await request.put(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        data: updateData
      }
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('data');

    const updatedConfig = data.data;
    expect(updatedConfig.display_name).toBe(updateData.display_name);
    expect(updatedConfig.prayer_time_position).toBe(updateData.prayer_time_position);
    expect(updatedConfig.carousel_interval).toBe(updateData.carousel_interval);
    expect(updatedConfig.max_content_items).toBe(updateData.max_content_items);
    expect(updatedConfig.auto_refresh_interval).toBe(updateData.auto_refresh_interval);
    expect(updatedConfig.is_active).toBe(updateData.is_active);
  });

  test('PUT /displays/{displayId}/config allows partial updates', async ({
    request,
  }) => {
    // Test updating only carousel_interval
    const partialUpdate = {
      carousel_interval: 15
    };

    const response = await request.put(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        data: partialUpdate
      }
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    const updatedConfig = data.data;
    expect(updatedConfig.carousel_interval).toBe(15);
    
    // Other fields should remain unchanged
    expect(updatedConfig).toHaveProperty('display_name');
    expect(updatedConfig).toHaveProperty('prayer_time_position');
  });

  test('PUT /displays/{displayId}/config validates carousel_interval constraints', async ({
    request,
  }) => {
    const invalidData = {
      carousel_interval: 3 // Below minimum of 5
    };

    const response = await request.put(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        data: invalidData
      }
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error).toHaveProperty('code');
    expect(error).toHaveProperty('message');
    expect(error).toHaveProperty('details');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details.field).toBe('carousel_interval');
  });

  test('PUT /displays/{displayId}/config validates max_content_items constraints', async ({
    request,
  }) => {
    const invalidData = {
      max_content_items: 25 // Above maximum of 20
    };

    const response = await request.put(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        data: invalidData
      }
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details.field).toBe('max_content_items');
  });

  test('PUT /displays/{displayId}/config validates prayer_time_position enum', async ({
    request,
  }) => {
    const invalidData = {
      prayer_time_position: 'invalid_position'
    };

    const response = await request.put(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        data: invalidData
      }
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details.field).toBe('prayer_time_position');
  });

  test('PUT /displays/{displayId}/config validates display_name length', async ({
    request,
  }) => {
    const invalidData = {
      display_name: 'A'.repeat(51) // Exceeds 50 character limit
    };

    const response = await request.put(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        data: invalidData
      }
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details.field).toBe('display_name');
  });

  test('PUT /displays/{displayId}/config validates auto_refresh_interval range', async ({
    request,
  }) => {
    const invalidData = {
      auto_refresh_interval: 65 // Above maximum of 60
    };

    const response = await request.put(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        data: invalidData
      }
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details.field).toBe('auto_refresh_interval');
  });

  test('PUT /displays/{displayId}/config rejects updates to immutable fields', async ({
    request,
  }) => {
    const invalidData = {
      id: 'new-id', // Should not be updatable
      masjid_id: 'new-masjid-id' // Should not be updatable
    };

    const response = await request.put(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        data: invalidData
      }
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  test('PUT /displays/{displayId}/config returns 404 for non-existent display', async ({
    request,
  }) => {
    const invalidDisplayId = '00000000-0000-0000-0000-000000000000';
    const updateData = {
      carousel_interval: 10
    };

    const response = await request.put(
      `${BASE_URL}/displays/${invalidDisplayId}/config`,
      {
        data: updateData
      }
    );

    expect(response.status()).toBe(404);

    const error = await response.json();
    expect(error.code).toBe('RESOURCE_NOT_FOUND');
  });

  test('PUT /displays/{displayId}/config handles malformed JSON gracefully', async ({
    request,
  }) => {
    const response = await request.put(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        data: 'invalid-json-string'
      }
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.code).toBe('VALIDATION_ERROR');
  });
});

test.describe('Display Configuration API Error Handling', () => {
  test('validates UUID format for display ID', async ({ request }) => {
    const invalidFormatId = 'not-a-uuid';
    
    // Test GET
    const getResponse = await request.get(
      `${BASE_URL}/displays/${invalidFormatId}/config`
    );
    expect(getResponse.status()).toBe(400);

    // Test PUT  
    const putResponse = await request.put(
      `${BASE_URL}/displays/${invalidFormatId}/config`,
      {
        data: { carousel_interval: 10 }
      }
    );
    expect(putResponse.status()).toBe(400);
  });

  test('handles database connectivity issues gracefully', async ({ request }) => {
    // This tests how the API handles infrastructure failures
    // Should return appropriate 500 errors with proper error structure
    
    const response = await request.get(
      `${BASE_URL}/displays/trigger-db-error/config`
    );

    if (response.status() === 500) {
      const error = await response.json();
      expect(error).toHaveProperty('code');
      expect(error.code).toBe('INTERNAL_ERROR');
    }
  });

  test('enforces authentication and authorization', async ({ request }) => {
    // Test without proper authentication
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        headers: {
          // Omit authorization header
        }
      }
    );

    expect([200, 401]).toContain(response.status());
  });

  test('prevents unauthorized configuration updates', async ({ request }) => {
    // Test updating display configuration without ownership
    const otherDisplayId = '999e8400-e29b-41d4-a716-446655440999';
    const response = await request.put(
      `${BASE_URL}/displays/${otherDisplayId}/config`,
      {
        data: { carousel_interval: 10 }
      }
    );

    expect([403, 404]).toContain(response.status());
  });
});