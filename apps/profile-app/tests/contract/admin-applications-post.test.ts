/**
 * Contract Test: POST /admin-applications
 * 
 * This test validates the admin application submission endpoint according to the API specification.
 * It ensures that authenticated users with complete profiles can apply to become masjid admins
 * with proper validation and workflow management.
 * 
 * @see /specs/001-build-a-monorepo/contracts/api-spec.yaml
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Types based on API specification
interface CreateAdminApplicationRequest {
  masjid_id: string;
  application_message?: string;
}

interface MasjidSummary {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
}

interface UserSummary {
  id: string;
  email: string;
  role: string;
  full_name: string;
  home_masjid?: MasjidSummary;
  profile_complete: boolean;
  created_at: string;
}

interface AdminApplicationResponse {
  id: string;
  user_id: string;
  user: UserSummary;
  masjid_id: string;
  masjid: MasjidSummary;
  application_message?: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

interface ErrorResponse {
  error: string;
  message: string;
  details?: object;
  timestamp: string;
}

const API_BASE_URL = 'http://localhost:54321';

describe('POST /admin-applications - Admin Application Submission Contract', () => {
  let userToken: string;
  let userId: string;
  let incompleteUserToken: string;
  let superAdminToken: string;
  let testMasjidId: string;

  const userCredentials = {
    email: 'applicant.user@example.com',
    password: 'applicantpass123'
  };

  const incompleteUserCredentials = {
    email: 'incomplete.user@example.com',
    password: 'incompletepass123'
  };

  const superAdminCredentials = {
    email: 'superadmin.applications@example.com',
    password: 'superadminpass123'
  };

  const userProfileData = {
    full_name: 'Ahmad Applicant',
    phone_number: '+60123456789',
    preferred_language: 'en',
    address: {
      address_line_1: '123 Jalan Applicant',
      city: 'Kuala Lumpur',
      state: 'Kuala Lumpur',
      postcode: '50100',
      country: 'MYS'
    }
  };

  const testMasjidData = {
    name: 'Masjid Test Application',
    registration_number: 'MSJ-2024-APP-001',
    email: 'admin@testapplication.org',
    phone_number: '+60312345678',
    description: 'Test mosque for admin applications',
    address: {
      address_line_1: '456 Jalan Test Masjid',
      city: 'Kuala Lumpur',
      state: 'Kuala Lumpur',
      postcode: '50100',
      country: 'MYS'
    }
  };

  beforeAll(async () => {
    console.log('Setting up admin-applications-post contract tests...');
    
    // Create and setup complete user profile
    const userSignUp = await fetch(`${API_BASE_URL}/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userCredentials)
    });

    const userData = await userSignUp.json();
    userId = userData.user.id;
    userToken = userData.session.access_token;

    // Create user profile
    await fetch(`${API_BASE_URL}/profiles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userProfileData)
    });

    // Create incomplete user (no profile)
    const incompleteUserSignUp = await fetch(`${API_BASE_URL}/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(incompleteUserCredentials)
    });

    const incompleteUserData = await incompleteUserSignUp.json();
    incompleteUserToken = incompleteUserData.session.access_token;

    // Create super admin for test masjid creation
    const superAdminSignUp = await fetch(`${API_BASE_URL}/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(superAdminCredentials)
    });

    const superAdminData = await superAdminSignUp.json();
    superAdminToken = superAdminData.session.access_token;

    // Create test masjid
    const masjidResponse = await fetch(`${API_BASE_URL}/masjids`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMasjidData)
    });

    if (masjidResponse.ok) {
      const masjidData = await masjidResponse.json();
      testMasjidId = masjidData.id;
    } else {
      // If masjid creation fails, create a mock ID for testing
      testMasjidId = '550e8400-e29b-41d4-a716-446655440000';
    }
  });

  afterAll(async () => {
    console.log('Cleaning up admin-applications-post contract tests...');
  });

  describe('Successful Application Submission (201)', () => {
    it('should submit admin application with complete profile', async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: 'I would like to volunteer as an admin for this masjid. I have experience in community management and am passionate about serving the Muslim community.'
      };

      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      expect(response.status).toBe(201);
      expect(response.headers.get('content-type')).toContain('application/json');

      const application: AdminApplicationResponse = await response.json();

      // Validate application structure
      expect(application.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(application.user_id).toBe(userId);
      expect(application.masjid_id).toBe(applicationData.masjid_id);
      expect(application.application_message).toBe(applicationData.application_message);
      expect(application.status).toBe('pending'); // Default status
      expect(application.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(application.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      // Validate user summary
      expect(application.user).toBeDefined();
      expect(application.user.id).toBe(userId);
      expect(application.user.email).toBe(userCredentials.email);
      expect(application.user.full_name).toBe(userProfileData.full_name);
      expect(application.user.profile_complete).toBe(true);

      // Validate masjid summary
      expect(application.masjid).toBeDefined();
      expect(application.masjid.id).toBe(testMasjidId);
      expect(application.masjid.name).toBe(testMasjidData.name);

      // Should not have review data initially
      expect(application.review_notes).toBeUndefined();
      expect(application.reviewed_by).toBeUndefined();
      expect(application.reviewed_at).toBeUndefined();
    });

    it('should submit admin application with minimal data', async () => {
      const minimalApplicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId
        // application_message is optional
      };

      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(minimalApplicationData)
      });

      expect(response.status).toBe(201);
      const application: AdminApplicationResponse = await response.json();

      expect(application.masjid_id).toBe(testMasjidId);
      expect(application.user_id).toBe(userId);
      expect(application.status).toBe('pending');
      expect(application.application_message).toBeUndefined();
    });

    it('should generate unique application IDs', async () => {
      // Create second user for duplicate test
      const secondUserCreds = {
        email: 'second.applicant@example.com',
        password: 'secondpass123'
      };

      const secondUserSignUp = await fetch(`${API_BASE_URL}/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(secondUserCreds)
      });

      const secondUserData = await secondUserSignUp.json();
      const secondUserToken = secondUserData.session.access_token;

      // Create profile for second user
      await fetch(`${API_BASE_URL}/profiles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secondUserToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...userProfileData,
          full_name: 'Second Applicant'
        })
      });

      const applicationData1: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: 'First application'
      };

      const applicationData2: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: 'Second application'
      };

      const response1 = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData1)
      });

      const response2 = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secondUserToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData2)
      });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);

      const application1: AdminApplicationResponse = await response1.json();
      const application2: AdminApplicationResponse = await response2.json();

      expect(application1.id).not.toBe(application2.id);
      expect(application1.application_message).toBe(applicationData1.application_message);
      expect(application2.application_message).toBe(applicationData2.application_message);
    });
  });

  describe('Authentication Requirements (401)', () => {
    it('should reject application without authentication', async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: 'Test application without auth'
      };

      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      expect(response.status).toBe(401);
      expect(response.headers.get('content-type')).toContain('application/json');

      const error: ErrorResponse = await response.json();
      expect(error.error).toBe('unauthorized');
      expect(error.message).toBeDefined();
      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should reject application with invalid token', async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: 'Test application with invalid token'
      };

      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      expect(response.status).toBe(401);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe('unauthorized');
    });
  });

  describe('Profile Completeness Requirements', () => {
    it('should reject application from user with incomplete profile', async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: 'Application from incomplete profile user'
      };

      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${incompleteUserToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      expect(response.status).toBe(400);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe('validation_error');
      expect(error.message).toContain('profile');
      expect(error.message.toLowerCase()).toContain('complete');
    });
  });

  describe('Validation Errors (400)', () => {
    it('should reject application with missing masjid_id', async () => {
      const invalidApplicationData = {
        application_message: 'Application without masjid ID'
        // masjid_id is missing
      };

      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidApplicationData)
      });

      expect(response.status).toBe(400);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe('validation_error');
      expect(error.message).toContain('masjid_id');
    });

    it('should reject application with invalid masjid_id format', async () => {
      const invalidMasjidIds = [
        'invalid-uuid',
        '123',
        'not-a-uuid-at-all',
        '550e8400-e29b-41d4-a716',  // Incomplete UUID
        ''  // Empty string
      ];

      for (const invalidId of invalidMasjidIds) {
        const applicationData = {
          masjid_id: invalidId,
          application_message: 'Test with invalid masjid ID'
        };

        const response = await fetch(`${API_BASE_URL}/admin-applications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(applicationData)
        });

        expect(response.status).toBe(400);
        const error: ErrorResponse = await response.json();
        expect(error.error).toBe('validation_error');
        expect(error.message).toContain('masjid_id');
      }
    });

    it('should reject application with non-existent masjid_id', async () => {
      const nonExistentMasjidId = '550e8400-e29b-41d4-a716-446655440999';
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: nonExistentMasjidId,
        application_message: 'Application for non-existent masjid'
      };

      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      expect(response.status).toBe(400);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe('validation_error');
      expect(error.message).toContain('masjid');
      expect(error.message.toLowerCase()).toContain('exist');
    });

    it('should reject application with excessively long message', async () => {
      const longMessage = 'A'.repeat(1001); // Over 1000 character limit
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: longMessage
      };

      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      expect(response.status).toBe(400);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe('validation_error');
      expect(error.message).toContain('message');
      expect(error.message).toContain('length');
    });

    it('should reject malformed JSON', async () => {
      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: 'invalid json content{{'
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Conflict Errors (409)', () => {
    it('should reject duplicate application for same masjid by same user', async () => {
      // Create new user for this test to avoid conflicts with other tests
      const duplicateTestUserCreds = {
        email: 'duplicate.test@example.com',
        password: 'duplicatepass123'
      };

      const userSignUp = await fetch(`${API_BASE_URL}/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(duplicateTestUserCreds)
      });

      const userData = await userSignUp.json();
      const duplicateUserToken = userData.session.access_token;

      // Create profile for user
      await fetch(`${API_BASE_URL}/profiles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${duplicateUserToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...userProfileData,
          full_name: 'Duplicate Test User'
        })
      });

      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: 'First application for duplicate test'
      };

      // First application should succeed
      const firstResponse = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${duplicateUserToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      expect(firstResponse.status).toBe(201);

      // Second application for same masjid should fail
      const secondApplicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: 'Second application for duplicate test'
      };

      const secondResponse = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${duplicateUserToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(secondApplicationData)
      });

      expect(secondResponse.status).toBe(409);
      const error: ErrorResponse = await secondResponse.json();
      expect(error.error).toBe('conflict');
      expect(error.message).toContain('application');
      expect(error.message.toLowerCase()).toContain('exist');
    });
  });

  describe('Content Type Validation', () => {
    it('should require application/json content type', async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: 'Test with wrong content type'
      };

      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(applicationData)
      });

      expect(response.status).toBe(400);
    });

    it('should handle missing content-type header', async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: 'Test without content type'
      };

      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(applicationData)
      });

      expect([400, 415]).toContain(response.status);
    });
  });

  describe('Unicode and Internationalization', () => {
    it('should handle Unicode characters in application message', async () => {
      const unicodeMessages = [
        'أرغب في أن أكون مشرفاً على هذا المسجد',  // Arabic
        '我想成为这个清真寺的管理员',                      // Chinese
        'நான் இந்த மசூதியின் நிர்வாகியாக இருக்க விரும்புகிறேன்', // Tamil
        'Saya ingin menjadi pentadbir masjid ini',     // Malay
        'Je voudrais être administrateur de cette mosquée' // French
      ];

      for (const message of unicodeMessages) {
        const applicationData: CreateAdminApplicationRequest = {
          masjid_id: testMasjidId,
          application_message: message
        };

        const response = await fetch(`${API_BASE_URL}/admin-applications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(applicationData)
        });

        expect(response.status).toBe(201);
        const application: AdminApplicationResponse = await response.json();
        expect(application.application_message).toBe(message);
      }
    });
  });

  describe('Application Status Management', () => {
    it('should set initial status to pending', async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: 'Test for initial status'
      };

      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      expect(response.status).toBe(201);
      const application: AdminApplicationResponse = await response.json();
      expect(application.status).toBe('pending');
    });

    it('should not allow status field in creation request', async () => {
      const applicationDataWithStatus = {
        masjid_id: testMasjidId,
        application_message: 'Test with status field',
        status: 'approved' // Should be ignored or cause error
      };

      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationDataWithStatus)
      });

      // Should either ignore the status field or return validation error
      if (response.status === 201) {
        const application: AdminApplicationResponse = await response.json();
        expect(application.status).toBe('pending'); // Should default to pending
      } else {
        expect(response.status).toBe(400);
      }
    });
  });

  describe('Data Integrity and Security', () => {
    it('should not expose sensitive user information', async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: 'Test for data privacy'
      };

      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      expect(response.status).toBe(201);
      const application: AdminApplicationResponse = await response.json();

      // Should not expose sensitive data
      expect(application.user).not.toHaveProperty('password');
      expect(application.user).not.toHaveProperty('phone_number');
      expect(application.user).not.toHaveProperty('address');
      expect(application.masjid).not.toHaveProperty('email');
      expect(application.masjid).not.toHaveProperty('phone_number');
      expect(application.masjid).not.toHaveProperty('description');
    });

    it('should handle SQL injection attempts safely', async () => {
      const maliciousData = {
        masjid_id: testMasjidId,
        application_message: "'; DROP TABLE admin_applications; --"
      };

      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(maliciousData)
      });

      // Should safely handle malicious input
      expect([201, 400]).toContain(response.status);
      
      if (response.status === 201) {
        const application: AdminApplicationResponse = await response.json();
        // Should store the message as text, not execute it
        expect(application.application_message).toBe(maliciousData.application_message);
      }
    });
  });

  describe('Performance and Reliability', () => {
    it('should return response within reasonable time', async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: 'Performance test application'
      };

      const startTime = Date.now();
      
      const response = await fetch(`${API_BASE_URL}/admin-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(201);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });
  });
});
