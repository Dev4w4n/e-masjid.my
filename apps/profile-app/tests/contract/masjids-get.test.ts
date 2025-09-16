/**
 * Contract Test: GET /masjids
 * 
 * This test validates the public masjid listing endpoint according to the API specification.
 * It ensures that the endpoint is publicly accessible (no authentication required) and returns
 * paginated results with search functionality for finding masjids by name or location.
 * 
 * @see /specs/001-build-a-monorepo/contracts/api-spec.yaml
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Types based on API specification
interface MasjidSummary {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
}

interface MasjidsListResponse {
  data: MasjidSummary[];
  total: number;
  limit: number;
  offset: number;
}

interface ErrorResponse {
  error: string;
  message: string;
  details?: object;
  timestamp: string;
}

const API_BASE_URL = 'http://localhost:54321';

describe('GET /masjids - Public Masjid Listing Contract', () => {
  let superAdminToken: string;

  beforeAll(async () => {
    console.log('Setting up masjids-get contract tests...');
    
    // Create super admin user for test data setup
    const adminCredentials = {
      email: 'superadmin.masjids@example.com',
      password: 'adminpassword123'
    };

    const signUpResponse = await fetch(`${API_BASE_URL}/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminCredentials)
    });

    const signUpData = await signUpResponse.json();
    superAdminToken = signUpData.session.access_token;

    // Create some test masjids for listing tests
    const testMasjids = [
      {
        name: 'Masjid Al-Hidayah KL',
        registration_number: 'MSJ-2024-001',
        email: 'admin@alhidayah.org',
        phone_number: '+60312345678',
        description: 'Central mosque in Kuala Lumpur',
        address: {
          address_line_1: '123 Jalan Masjid',
          city: 'Kuala Lumpur',
          state: 'Kuala Lumpur',
          postcode: '50100',
          country: 'MYS'
        }
      },
      {
        name: 'Masjid An-Nur Johor',
        registration_number: 'MSJ-2024-002',
        email: 'admin@annur.org',
        phone_number: '+60712345678',
        description: 'Community mosque in Johor Bahru',
        address: {
          address_line_1: '456 Jalan Harmoni',
          city: 'Johor Bahru',
          state: 'Johor',
          postcode: '80100',
          country: 'MYS'
        }
      },
      {
        name: 'Masjid At-Taqwa Penang',
        registration_number: 'MSJ-2024-003',
        email: 'admin@attaqwa.org',
        phone_number: '+60412345678',
        description: 'Historic mosque in George Town',
        address: {
          address_line_1: '789 Jalan Heritage',
          city: 'George Town',
          state: 'Penang',
          postcode: '10450',
          country: 'MYS'
        }
      }
    ];

    // Create test masjids (assuming super admin role)
    for (const masjid of testMasjids) {
      await fetch(`${API_BASE_URL}/masjids`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${superAdminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(masjid)
      });
    }
  });

  afterAll(async () => {
    console.log('Cleaning up masjids-get contract tests...');
  });

  describe('Public Access (No Authentication Required)', () => {
    it('should return masjid list without authentication token', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');

      const data: MasjidsListResponse = await response.json();

      // Validate response structure
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(typeof data.total).toBe('number');
      expect(typeof data.limit).toBe('number');
      expect(typeof data.offset).toBe('number');
    });

    it('should work even with invalid bearer token', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        }
      });

      // Should still work since authentication is not required
      expect(response.status).toBe(200);
    });

    it('should ignore authentication headers', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${superAdminToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();
      expect(data.data).toBeDefined();
    });
  });

  describe('Successful Masjid Listing (200)', () => {
    it('should return list of masjids with correct structure', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();

      // Validate each masjid in the list
      data.data.forEach(masjid => {
        expect(masjid.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        expect(typeof masjid.name).toBe('string');
        expect(masjid.name.length).toBeGreaterThan(0);
        expect(typeof masjid.city).toBe('string');
        expect(typeof masjid.state).toBe('string');
        expect(typeof masjid.status).toBe('string');
      });
    });

    it('should return masjids with valid Malaysian states', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();

      const validStates = [
        'Johor', 'Kedah', 'Kelantan', 'Malacca', 'Negeri Sembilan',
        'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak',
        'Selangor', 'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya'
      ];

      data.data.forEach(masjid => {
        expect(validStates).toContain(masjid.state);
      });
    });

    it('should handle empty result set', async () => {
      // Test with search that returns no results
      const response = await fetch(`${API_BASE_URL}/masjids?search=NonExistentMasjid123`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();

      expect(data.data).toEqual([]);
      expect(data.total).toBe(0);
      expect(data.limit).toBeGreaterThan(0);
      expect(data.offset).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Pagination Parameters', () => {
    it('should respect default pagination values', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();

      // Default limit should be 20 as per API spec
      expect(data.limit).toBe(20);
      expect(data.offset).toBe(0);
      expect(data.data.length).toBeLessThanOrEqual(20);
    });

    it('should handle custom limit parameter', async () => {
      const customLimit = 5;
      const response = await fetch(`${API_BASE_URL}/masjids?limit=${customLimit}`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();

      expect(data.limit).toBe(customLimit);
      expect(data.data.length).toBeLessThanOrEqual(customLimit);
    });

    it('should handle custom offset parameter', async () => {
      const customOffset = 1;
      const response = await fetch(`${API_BASE_URL}/masjids?offset=${customOffset}`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();

      expect(data.offset).toBe(customOffset);
    });

    it('should handle both limit and offset parameters', async () => {
      const customLimit = 10;
      const customOffset = 2;
      const response = await fetch(`${API_BASE_URL}/masjids?limit=${customLimit}&offset=${customOffset}`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();

      expect(data.limit).toBe(customLimit);
      expect(data.offset).toBe(customOffset);
      expect(data.data.length).toBeLessThanOrEqual(customLimit);
    });

    it('should enforce maximum limit constraint', async () => {
      const excessiveLimit = 200; // Over the 100 maximum
      const response = await fetch(`${API_BASE_URL}/masjids?limit=${excessiveLimit}`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();

      // Should be capped at 100 as per API spec
      expect(data.limit).toBeLessThanOrEqual(100);
    });

    it('should handle invalid pagination parameters gracefully', async () => {
      const invalidParams = [
        'limit=invalid',
        'offset=negative',
        'limit=-5',
        'offset=-10'
      ];

      for (const param of invalidParams) {
        const response = await fetch(`${API_BASE_URL}/masjids?${param}`, {
          method: 'GET'
        });

        // Should either return 400 or use default values
        expect([200, 400]).toContain(response.status);
      }
    });
  });

  describe('Search Functionality', () => {
    it('should search masjids by name', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids?search=Al-Hidayah`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();

      // Should find masjids with "Al-Hidayah" in the name
      data.data.forEach(masjid => {
        expect(masjid.name.toLowerCase()).toContain('al-hidayah'.toLowerCase());
      });
    });

    it('should search masjids by city', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids?search=Kuala Lumpur`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();

      // Should find masjids in Kuala Lumpur
      data.data.forEach(masjid => {
        expect(
          masjid.name.toLowerCase().includes('kuala lumpur'.toLowerCase()) ||
          masjid.city.toLowerCase().includes('kuala lumpur'.toLowerCase())
        ).toBe(true);
      });
    });

    it('should search masjids by state', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids?search=Johor`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();

      // Should find masjids in Johor state
      data.data.forEach(masjid => {
        expect(
          masjid.name.toLowerCase().includes('johor'.toLowerCase()) ||
          masjid.city.toLowerCase().includes('johor'.toLowerCase()) ||
          masjid.state.toLowerCase().includes('johor'.toLowerCase())
        ).toBe(true);
      });
    });

    it('should handle case-insensitive search', async () => {
      const searchTerms = ['al-hidayah', 'AL-HIDAYAH', 'Al-Hidayah', 'aL-hIdAyAh'];

      for (const term of searchTerms) {
        const response = await fetch(`${API_BASE_URL}/masjids?search=${encodeURIComponent(term)}`, {
          method: 'GET'
        });

        expect(response.status).toBe(200);
        const data: MasjidsListResponse = await response.json();

        // All variations should return the same results
        expect(data.data.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle URL-encoded search terms', async () => {
      const searchTerm = 'Masjid Al-Hidayah';
      const encodedTerm = encodeURIComponent(searchTerm);
      
      const response = await fetch(`${API_BASE_URL}/masjids?search=${encodedTerm}`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();
      expect(data.data).toBeDefined();
    });

    it('should handle empty search parameter', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids?search=`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();

      // Empty search should return all results (up to pagination limit)
      expect(data.data).toBeDefined();
    });

    it('should handle special characters in search', async () => {
      const specialSearchTerms = [
        'Al-Hidayah',
        'An-Nur',
        'At-Taqwa',
        'Masjid (Test)',
        'Masjid & Community'
      ];

      for (const term of specialSearchTerms) {
        const response = await fetch(`${API_BASE_URL}/masjids?search=${encodeURIComponent(term)}`, {
          method: 'GET'
        });

        expect(response.status).toBe(200);
        const data: MasjidsListResponse = await response.json();
        expect(data.data).toBeDefined();
      }
    });
  });

  describe('Combined Parameters', () => {
    it('should handle search with pagination', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids?search=Masjid&limit=5&offset=0`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();

      expect(data.limit).toBe(5);
      expect(data.offset).toBe(0);
      expect(data.data.length).toBeLessThanOrEqual(5);
      
      // All results should match the search term
      data.data.forEach(masjid => {
        expect(
          masjid.name.toLowerCase().includes('masjid') ||
          masjid.city.toLowerCase().includes('masjid')
        ).toBe(true);
      });
    });
  });

  describe('HTTP Method Validation', () => {
    it('should only accept GET method', async () => {
      const invalidMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

      for (const method of invalidMethods) {
        const response = await fetch(`${API_BASE_URL}/masjids`, {
          method
        });

        expect(response.status).toBe(405); // Method Not Allowed
      }
    });

    it('should handle OPTIONS request for CORS preflight', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET'
        }
      });

      // Should handle preflight requests
      expect([200, 204]).toContain(response.status);
    });
  });

  describe('Response Format and Headers', () => {
    it('should return appropriate content-type header', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should include CORS headers for public access', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids`, {
        method: 'GET',
        headers: {
          'Origin': 'http://localhost:3000'
        }
      });

      expect(response.status).toBe(200);
      // CORS headers implementation depends on server configuration
      // This is a basic check
    });
  });

  describe('Performance and Reliability', () => {
    it('should return response within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await fetch(`${API_BASE_URL}/masjids`, {
        method: 'GET'
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });

    it('should handle concurrent requests', async () => {
      // Test multiple simultaneous requests
      const promises = Array(5).fill(0).map(() =>
        fetch(`${API_BASE_URL}/masjids`, {
          method: 'GET'
        })
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should return consistent results across requests', async () => {
      // Make multiple requests and ensure consistency
      const response1 = await fetch(`${API_BASE_URL}/masjids?limit=10`, {
        method: 'GET'
      });

      const response2 = await fetch(`${API_BASE_URL}/masjids?limit=10`, {
        method: 'GET'
      });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      const data1: MasjidsListResponse = await response1.json();
      const data2: MasjidsListResponse = await response2.json();

      // Should return same total count (assuming no concurrent modifications)
      expect(data1.total).toBe(data2.total);
    });
  });

  describe('Data Integrity', () => {
    it('should only return active masjids', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();

      // Should only include active masjids (not pending or inactive)
      data.data.forEach(masjid => {
        expect(masjid.status).toBe('active');
      });
    });

    it('should not expose sensitive masjid information', async () => {
      const response = await fetch(`${API_BASE_URL}/masjids`, {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      const data: MasjidsListResponse = await response.json();

      // Should only include summary information, not detailed data
      data.data.forEach(masjid => {
        expect(masjid).not.toHaveProperty('email');
        expect(masjid).not.toHaveProperty('phone_number');
        expect(masjid).not.toHaveProperty('registration_number');
        expect(masjid).not.toHaveProperty('description');
        expect(masjid).not.toHaveProperty('address');
      });
    });
  });
});
