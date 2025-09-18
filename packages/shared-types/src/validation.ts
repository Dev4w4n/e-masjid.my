// Malaysian-specific validation schemas and functions

import type { MalaysianState } from './types.js';

// Phone number validation for Malaysian format
export const MALAYSIAN_PHONE_REGEX = /^(\+60|0)[1-9][0-9]{7,9}$/;

// Postal code validation for Malaysia
export const MALAYSIAN_POSTCODE_REGEX = /^[0-9]{5}$/;

// Email validation
export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Validation functions
export function isValidMalaysianPhone(phone: string): boolean {
  return MALAYSIAN_PHONE_REGEX.test(phone);
}

export function isValidMalaysianPostcode(postcode: string): boolean {
  if (!MALAYSIAN_POSTCODE_REGEX.test(postcode)) {
    return false;
  }
  
  const code = parseInt(postcode, 10);
  return code >= 10000 && code <= 98000;
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isValidMalaysianState(state: string): state is MalaysianState {
  const validStates: MalaysianState[] = [
    'Johor',
    'Kedah', 
    'Kelantan',
    'Malacca',
    'Negeri Sembilan',
    'Pahang',
    'Penang',
    'Perak',
    'Perlis',
    'Sabah',
    'Sarawak',
    'Selangor',
    'Terengganu',
    'Kuala Lumpur',
    'Labuan',
    'Putrajaya'
  ];
  
  return validStates.includes(state as MalaysianState);
}

// Format functions
export function formatMalaysianPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 60, add +
  if (digits.startsWith('60')) {
    return `+${digits}`;
  }
  
  // If starts with 0, keep as is
  if (digits.startsWith('0')) {
    return digits;
  }
  
  // Otherwise, assume missing country code
  return `+60${digits}`;
}

export function formatPostcode(postcode: string): string {
  // Remove all non-digits and pad with leading zeros if needed
  const digits = postcode.replace(/\D/g, '');
  return digits.padStart(5, '0').slice(0, 5);
}

// Validation error messages
export const VALIDATION_MESSAGES = {
  phone: {
    required: 'Phone number is required',
    invalid: 'Please enter a valid Malaysian phone number (e.g., +60123456789 or 0123456789)',
    format: 'Phone number must be in Malaysian format'
  },
  postcode: {
    required: 'Postal code is required',
    invalid: 'Please enter a valid Malaysian postal code (5 digits)',
    range: 'Postal code must be between 10000 and 98000'
  },
  email: {
    required: 'Email address is required',
    invalid: 'Please enter a valid email address',
    format: 'Email must be in valid format (e.g., user@example.com)'
  },
  fullName: {
    required: 'Full name is required',
    minLength: 'Full name must be at least 2 characters',
    maxLength: 'Full name must not exceed 255 characters'
  },
  address: {
    addressLine1Required: 'Address line 1 is required',
    cityRequired: 'City is required',
    stateRequired: 'State is required',
    stateInvalid: 'Please select a valid Malaysian state',
    postcodeRequired: 'Postal code is required'
  },
  masjid: {
    nameRequired: 'Masjid name is required',
    nameMinLength: 'Masjid name must be at least 2 characters',
    addressRequired: 'Masjid address is required',
    emailInvalid: 'Please enter a valid email address',
    phoneInvalid: 'Please enter a valid Malaysian phone number',
    registrationNumberInvalid: 'Registration number format is invalid'
  },
  application: {
    masjidRequired: 'Please select a masjid',
    messageMinLength: 'Application message must be at least 10 characters if provided'
  }
} as const;

// Validation schema type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Profile validation
export function validateProfile(data: {
  full_name: string;
  phone_number?: string;
  email?: string;
}): ValidationResult {
  const errors: string[] = [];
  
  // Full name validation
  if (!data.full_name || data.full_name.trim().length === 0) {
    errors.push(VALIDATION_MESSAGES.fullName.required);
  } else if (data.full_name.trim().length < 2) {
    errors.push(VALIDATION_MESSAGES.fullName.minLength);
  } else if (data.full_name.length > 255) {
    errors.push(VALIDATION_MESSAGES.fullName.maxLength);
  }
  
  // Phone number validation (if provided)
  if (data.phone_number && !isValidMalaysianPhone(data.phone_number)) {
    errors.push(VALIDATION_MESSAGES.phone.invalid);
  }
  
  // Email validation (if provided)
  if (data.email && !isValidEmail(data.email)) {
    errors.push(VALIDATION_MESSAGES.email.invalid);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Address validation
export function validateAddress(data: {
  address_line_1: string;
  city: string;
  state: string;
  postcode: string;
}): ValidationResult {
  const errors: string[] = [];
  
  // Address line 1
  if (!data.address_line_1 || data.address_line_1.trim().length === 0) {
    errors.push(VALIDATION_MESSAGES.address.addressLine1Required);
  }
  
  // City
  if (!data.city || data.city.trim().length === 0) {
    errors.push(VALIDATION_MESSAGES.address.cityRequired);
  }
  
  // State
  if (!data.state) {
    errors.push(VALIDATION_MESSAGES.address.stateRequired);
  } else if (!isValidMalaysianState(data.state)) {
    errors.push(VALIDATION_MESSAGES.address.stateInvalid);
  }
  
  // Postcode
  if (!data.postcode) {
    errors.push(VALIDATION_MESSAGES.address.postcodeRequired);
  } else if (!isValidMalaysianPostcode(data.postcode)) {
    errors.push(VALIDATION_MESSAGES.postcode.invalid);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Masjid validation
export function validateMasjid(data: {
  name: string;
  email?: string;
  phone_number?: string;
  address: {
    address_line_1: string;
    city: string;
    state: string;
    postcode: string;
  };
}): ValidationResult {
  const errors: string[] = [];
  
  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.push(VALIDATION_MESSAGES.masjid.nameRequired);
  } else if (data.name.trim().length < 2) {
    errors.push(VALIDATION_MESSAGES.masjid.nameMinLength);
  }
  
  // Email validation (optional)
  if (data.email && !isValidEmail(data.email)) {
    errors.push(VALIDATION_MESSAGES.masjid.emailInvalid);
  }
  
  // Phone validation (optional)
  if (data.phone_number && !isValidMalaysianPhone(data.phone_number)) {
    errors.push(VALIDATION_MESSAGES.masjid.phoneInvalid);
  }
  
  // Address validation
  const addressValidation = validateAddress(data.address);
  if (!addressValidation.isValid) {
    errors.push(...addressValidation.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Admin application validation
export function validateAdminApplication(data: {
  masjid_id: string;
  application_message?: string;
}): ValidationResult {
  const errors: string[] = [];
  
  // Masjid selection
  if (!data.masjid_id || data.masjid_id.trim().length === 0) {
    errors.push(VALIDATION_MESSAGES.application.masjidRequired);
  }
  
  // Application message (optional, but if provided must be at least 10 chars)
  if (data.application_message && data.application_message.trim().length > 0) {
    if (data.application_message.trim().length < 10) {
      errors.push(VALIDATION_MESSAGES.application.messageMinLength);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
