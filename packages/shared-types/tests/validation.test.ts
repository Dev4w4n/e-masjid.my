// Contract test for Malaysian phone validation
// This test MUST FAIL until implementation is complete

import { describe, it, expect } from 'vitest';

describe('Malaysian Phone Validation Contract', () => {
  describe('Phone Number Validation', () => {
    it('should validate Malaysian phone number formats', async () => {
      const { isValidMalaysianPhone } = await import('../src/validation.js');
      
      expect(isValidMalaysianPhone).toBeDefined();
      expect(typeof isValidMalaysianPhone).toBe('function');
      
      // Valid formats should pass
      expect(isValidMalaysianPhone('+60123456789')).toBe(true);
      expect(isValidMalaysianPhone('0123456789')).toBe(true);
      expect(isValidMalaysianPhone('+601234567890')).toBe(true);
      expect(isValidMalaysianPhone('01234567890')).toBe(true);
      
      // Invalid formats should fail
      expect(isValidMalaysianPhone('123456789')).toBe(false);
      expect(isValidMalaysianPhone('+1234567890')).toBe(false);
      expect(isValidMalaysianPhone('invalid')).toBe(false);
      expect(isValidMalaysianPhone('')).toBe(false);
    });

    it('should handle phone number formatting', async () => {
      const { formatMalaysianPhone } = await import('../src/validation.js');
      
      expect(formatMalaysianPhone).toBeDefined();
      expect(typeof formatMalaysianPhone).toBe('function');
      
      // Should format various input formats to consistent output
      expect(formatMalaysianPhone('0123456789')).toBe('0123456789');
      expect(formatMalaysianPhone('+60123456789')).toBe('+60123456789');
      expect(formatMalaysianPhone('60123456789')).toBe('+60123456789');
      expect(formatMalaysianPhone('123456789')).toBe('+60123456789');
    });

    it('should provide phone validation regex', async () => {
      const { MALAYSIAN_PHONE_REGEX } = await import('../src/validation.js');
      
      expect(MALAYSIAN_PHONE_REGEX).toBeDefined();
      expect(MALAYSIAN_PHONE_REGEX instanceof RegExp).toBe(true);
      
      // Should match valid Malaysian phone numbers
      expect(MALAYSIAN_PHONE_REGEX.test('+60123456789')).toBe(true);
      expect(MALAYSIAN_PHONE_REGEX.test('0123456789')).toBe(true);
      
      // Should not match invalid formats
      expect(MALAYSIAN_PHONE_REGEX.test('123456789')).toBe(false);
      expect(MALAYSIAN_PHONE_REGEX.test('+1234567890')).toBe(false);
    });
  });

  describe('Postal Code Validation', () => {
    it('should validate Malaysian postal codes', async () => {
      const { isValidMalaysianPostcode } = await import('../src/validation.js');
      
      expect(isValidMalaysianPostcode).toBeDefined();
      expect(typeof isValidMalaysianPostcode).toBe('function');
      
      // Valid postal codes should pass
      expect(isValidMalaysianPostcode('10000')).toBe(true);
      expect(isValidMalaysianPostcode('50100')).toBe(true);
      expect(isValidMalaysianPostcode('80000')).toBe(true);
      expect(isValidMalaysianPostcode('98000')).toBe(true);
      
      // Invalid postal codes should fail
      expect(isValidMalaysianPostcode('09999')).toBe(false);
      expect(isValidMalaysianPostcode('98001')).toBe(false);
      expect(isValidMalaysianPostcode('1234')).toBe(false);
      expect(isValidMalaysianPostcode('123456')).toBe(false);
      expect(isValidMalaysianPostcode('invalid')).toBe(false);
    });

    it('should format postal codes', async () => {
      const { formatPostcode } = await import('../src/validation.js');
      
      expect(formatPostcode).toBeDefined();
      expect(typeof formatPostcode).toBe('function');
      
      // Should format to 5 digits with leading zeros
      expect(formatPostcode('10000')).toBe('10000');
      expect(formatPostcode('1000')).toBe('01000');
      expect(formatPostcode('100')).toBe('00100');
      expect(formatPostcode('123456')).toBe('12345'); // Truncate if too long
    });

    it('should provide postal code regex', async () => {
      const { MALAYSIAN_POSTCODE_REGEX } = await import('../src/validation.js');
      
      expect(MALAYSIAN_POSTCODE_REGEX).toBeDefined();
      expect(MALAYSIAN_POSTCODE_REGEX instanceof RegExp).toBe(true);
      
      // Should match 5-digit postal codes
      expect(MALAYSIAN_POSTCODE_REGEX.test('10000')).toBe(true);
      expect(MALAYSIAN_POSTCODE_REGEX.test('50100')).toBe(true);
      
      // Should not match invalid formats
      expect(MALAYSIAN_POSTCODE_REGEX.test('1234')).toBe(false);
      expect(MALAYSIAN_POSTCODE_REGEX.test('123456')).toBe(false);
      expect(MALAYSIAN_POSTCODE_REGEX.test('abcde')).toBe(false);
    });
  });

  describe('Email Validation', () => {
    it('should validate email addresses', async () => {
      const { isValidEmail } = await import('../src/validation.js');
      
      expect(isValidEmail).toBeDefined();
      expect(typeof isValidEmail).toBe('function');
      
      // Valid emails should pass
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.email@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
      
      // Invalid emails should fail
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should provide email regex', async () => {
      const { EMAIL_REGEX } = await import('../src/validation.js');
      
      expect(EMAIL_REGEX).toBeDefined();
      expect(EMAIL_REGEX instanceof RegExp).toBe(true);
      
      // Should match valid email formats
      expect(EMAIL_REGEX.test('user@example.com')).toBe(true);
      expect(EMAIL_REGEX.test('test@domain.org')).toBe(true);
    });
  });

  describe('Malaysian State Validation', () => {
    it('should validate Malaysian states', async () => {
      const { isValidMalaysianState } = await import('../src/validation.js');
      
      expect(isValidMalaysianState).toBeDefined();
      expect(typeof isValidMalaysianState).toBe('function');
      
      // Valid states should pass
      expect(isValidMalaysianState('Johor')).toBe(true);
      expect(isValidMalaysianState('Kuala Lumpur')).toBe(true);
      expect(isValidMalaysianState('Selangor')).toBe(true);
      expect(isValidMalaysianState('Penang')).toBe(true);
      
      // Invalid states should fail
      expect(isValidMalaysianState('InvalidState')).toBe(false);
      expect(isValidMalaysianState('California')).toBe(false);
      expect(isValidMalaysianState('')).toBe(false);
    });
  });

  describe('Validation Messages', () => {
    it('should provide validation error messages', async () => {
      const { VALIDATION_MESSAGES } = await import('../src/validation.js');
      
      expect(VALIDATION_MESSAGES).toBeDefined();
      expect(typeof VALIDATION_MESSAGES).toBe('object');
      
      // Should have messages for all validation types
      expect(VALIDATION_MESSAGES.phone).toBeDefined();
      expect(VALIDATION_MESSAGES.postcode).toBeDefined();
      expect(VALIDATION_MESSAGES.email).toBeDefined();
      expect(VALIDATION_MESSAGES.fullName).toBeDefined();
      expect(VALIDATION_MESSAGES.address).toBeDefined();
      expect(VALIDATION_MESSAGES.masjid).toBeDefined();
      expect(VALIDATION_MESSAGES.application).toBeDefined();
      
      // Each category should have appropriate messages
      expect(VALIDATION_MESSAGES.phone.required).toBeDefined();
      expect(VALIDATION_MESSAGES.phone.invalid).toBeDefined();
      expect(VALIDATION_MESSAGES.postcode.required).toBeDefined();
      expect(VALIDATION_MESSAGES.postcode.invalid).toBeDefined();
    });
  });

  describe('Form Validation Functions', () => {
    it('should validate profile data', async () => {
      const { validateProfile } = await import('../src/validation.js');
      
      expect(validateProfile).toBeDefined();
      expect(typeof validateProfile).toBe('function');
      
      // Should return validation result object
      const validData = {
        full_name: 'Ahmad Rahman',
        phone_number: '+60123456789',
        email: 'ahmad@example.com'
      };
      
      const result = validateProfile(validData);
      expect(result).toBeDefined();
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should validate address data', async () => {
      const { validateAddress } = await import('../src/validation.js');
      
      expect(validateAddress).toBeDefined();
      expect(typeof validateAddress).toBe('function');
      
      // Should validate Malaysian address format
      const validAddress = {
        address_line_1: 'Jalan Test',
        city: 'Kuala Lumpur',
        state: 'Kuala Lumpur',
        postcode: '50100'
      };
      
      const result = validateAddress(validAddress);
      expect(result).toBeDefined();
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should validate masjid data', async () => {
      const { validateMasjid } = await import('../src/validation.js');
      
      expect(validateMasjid).toBeDefined();
      expect(typeof validateMasjid).toBe('function');
      
      // Should validate masjid information including address
      const validMasjid = {
        name: 'Masjid Test',
        email: 'test@masjid.com',
        phone_number: '+60123456789',
        address: {
          address_line_1: 'Jalan Masjid',
          city: 'Shah Alam',
          state: 'Selangor',
          postcode: '40000'
        }
      };
      
      const result = validateMasjid(validMasjid);
      expect(result).toBeDefined();
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should validate admin application data', async () => {
      const { validateAdminApplication } = await import('../src/validation.js');
      
      expect(validateAdminApplication).toBeDefined();
      expect(typeof validateAdminApplication).toBe('function');
      
      // Should validate admin application form
      const validApplication = {
        masjid_id: 'test-masjid-id',
        application_message: 'I would like to help manage this masjid'
      };
      
      const result = validateAdminApplication(validApplication);
      expect(result).toBeDefined();
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });
});
