import type { MalaysianState } from './types.js';
export declare const MALAYSIAN_PHONE_REGEX: RegExp;
export declare const MALAYSIAN_POSTCODE_REGEX: RegExp;
export declare const EMAIL_REGEX: RegExp;
export declare function isValidMalaysianPhone(phone: string): boolean;
export declare function isValidMalaysianPostcode(postcode: string): boolean;
export declare function isValidEmail(email: string): boolean;
export declare function isValidMalaysianState(state: string): state is MalaysianState;
export declare function formatMalaysianPhone(phone: string): string;
export declare function formatPostcode(postcode: string): string;
export declare const VALIDATION_MESSAGES: {
    readonly phone: {
        readonly required: "Phone number is required";
        readonly invalid: "Please enter a valid Malaysian phone number (e.g., +60123456789 or 0123456789)";
        readonly format: "Phone number must be in Malaysian format";
    };
    readonly postcode: {
        readonly required: "Postal code is required";
        readonly invalid: "Please enter a valid Malaysian postal code (5 digits)";
        readonly range: "Postal code must be between 10000 and 98000";
    };
    readonly email: {
        readonly required: "Email address is required";
        readonly invalid: "Please enter a valid email address";
        readonly format: "Email must be in valid format (e.g., user@example.com)";
    };
    readonly fullName: {
        readonly required: "Full name is required";
        readonly minLength: "Full name must be at least 2 characters";
        readonly maxLength: "Full name must not exceed 255 characters";
    };
    readonly address: {
        readonly addressLine1Required: "Address line 1 is required";
        readonly cityRequired: "City is required";
        readonly stateRequired: "State is required";
        readonly stateInvalid: "Please select a valid Malaysian state";
        readonly postcodeRequired: "Postal code is required";
    };
    readonly masjid: {
        readonly nameRequired: "Masjid name is required";
        readonly nameMinLength: "Masjid name must be at least 2 characters";
        readonly addressRequired: "Masjid address is required";
        readonly emailInvalid: "Please enter a valid email address";
        readonly phoneInvalid: "Please enter a valid Malaysian phone number";
        readonly registrationNumberInvalid: "Registration number format is invalid";
    };
    readonly application: {
        readonly masjidRequired: "Please select a masjid";
        readonly messageMinLength: "Application message must be at least 10 characters if provided";
    };
};
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare function validateProfile(data: {
    full_name: string;
    phone_number?: string;
    email?: string;
}): ValidationResult;
export declare function validateAddress(data: {
    address_line_1: string;
    city: string;
    state: string;
    postcode: string;
}): ValidationResult;
export declare function validateMasjid(data: {
    name: string;
    email?: string;
    phone_number?: string;
    address: {
        address_line_1: string;
        city: string;
        state: string;
        postcode: string;
    };
}): ValidationResult;
export declare function validateAdminApplication(data: {
    masjid_id: string;
    application_message?: string;
}): ValidationResult;
//# sourceMappingURL=validation.d.ts.map