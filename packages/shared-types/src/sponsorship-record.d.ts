/**
 * Sponsorship Record Model
 *
 * This module defines types and utilities for managing sponsorship records
 * in the Masjid Digital Display system. Sponsorships provide funding for
 * content display and influence content priority and visibility.
 */
/**
 * Sponsorship types available
 */
export type SponsorshipType = "content" | "time-slot" | "daily" | "weekly" | "monthly" | "event" | "general";
/**
 * Sponsorship status
 */
export type SponsorshipStatus = "pending" | "active" | "expired" | "cancelled" | "completed" | "refunded";
/**
 * Payment status
 */
export type PaymentStatus = "pending" | "partial" | "paid" | "overdue" | "refunded" | "failed";
/**
 * Payment method
 */
export type PaymentMethod = "bank-transfer" | "online-banking" | "e-wallet" | "cash" | "cheque" | "card" | "qr-code";
/**
 * Sponsorship visibility settings
 */
export interface SponsorshipVisibility {
    showSponsorName: boolean;
    showSponsorLogo: boolean;
    showAmount: boolean;
    showMessage: boolean;
    displayDuration: number;
    position: "top" | "bottom" | "overlay" | "fullscreen";
    opacity: number;
}
/**
 * Sponsor contact information
 */
export interface SponsorContact {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
    };
}
/**
 * Payment information
 */
export interface PaymentInfo {
    amount: number;
    currency: "MYR";
    method: PaymentMethod;
    status: PaymentStatus;
    reference?: string;
    receiptNumber?: string;
    transactionId?: string;
    paidAt?: Date;
    dueDate?: Date;
    notes?: string;
}
/**
 * Sponsorship benefits and perks
 */
export interface SponsorshipBenefits {
    contentPriorityBoost: number;
    displayFrequency: number;
    exclusiveTimeSlots: string[];
    featuredDisplay: boolean;
    socialMediaMention: boolean;
    certificateOfAppreciation: boolean;
    newsletterMention: boolean;
    websiteListing: boolean;
}
/**
 * Main sponsorship record interface
 */
export interface SponsorshipRecord {
    id: string;
    masjidId: string;
    type: SponsorshipType;
    title: string;
    description?: string;
    status: SponsorshipStatus;
    sponsor: SponsorContact;
    payment: PaymentInfo;
    visibility: SponsorshipVisibility;
    benefits: SponsorshipBenefits;
    contentIds?: string[];
    displayIds?: string[];
    tags?: string[];
    startDate: Date;
    endDate: Date;
    timezone: string;
    logoUrl?: string;
    bannerUrl?: string;
    videoUrl?: string;
    customMessage?: string;
    impressions: number;
    clicks: number;
    reach: number;
    version: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
    approvedAt?: Date;
    approvedBy?: string;
    rejectedAt?: Date;
    rejectedBy?: string;
    rejectionReason?: string;
}
/**
 * Request for creating a sponsorship record
 */
export interface CreateSponsorshipRequest {
    masjidId: string;
    type: SponsorshipType;
    title: string;
    description?: string;
    sponsor: SponsorContact;
    amount: number;
    paymentMethod: PaymentMethod;
    dueDate?: Date;
    startDate: Date;
    endDate: Date;
    visibility?: Partial<SponsorshipVisibility>;
    benefits?: Partial<SponsorshipBenefits>;
    contentIds?: string[];
    displayIds?: string[];
    tags?: string[];
    logoUrl?: string;
    bannerUrl?: string;
    videoUrl?: string;
    customMessage?: string;
}
/**
 * Request for updating sponsorship record
 */
export interface UpdateSponsorshipRequest {
    title?: string;
    description?: string;
    status?: SponsorshipStatus;
    sponsor?: Partial<SponsorContact>;
    payment?: Partial<PaymentInfo>;
    visibility?: Partial<SponsorshipVisibility>;
    benefits?: Partial<SponsorshipBenefits>;
    contentIds?: string[];
    displayIds?: string[];
    tags?: string[];
    startDate?: Date;
    endDate?: Date;
    logoUrl?: string;
    bannerUrl?: string;
    videoUrl?: string;
    customMessage?: string;
    isActive?: boolean;
}
/**
 * Sponsorship approval request
 */
export interface ApproveSponsorshipRequest {
    approve: boolean;
    rejectionReason?: string;
    notes?: string;
}
/**
 * Sponsorship record with relations
 */
export interface SponsorshipRecordWithRelations extends SponsorshipRecord {
    masjid: {
        id: string;
        name: string;
        timezone: string;
    };
    contentItems?: Array<{
        id: string;
        title: string;
        type: string;
        status: string;
    }>;
    displays?: Array<{
        id: string;
        name: string;
        location: string;
    }>;
    createdByUser: {
        id: string;
        name: string;
        email: string;
    };
    approvedByUser?: {
        id: string;
        name: string;
        email: string;
    };
}
/**
 * Sponsorship analytics data
 */
export interface SponsorshipAnalytics {
    sponsorshipId: string;
    period: {
        start: Date;
        end: Date;
    };
    metrics: {
        totalImpressions: number;
        uniqueViewers: number;
        averageViewDuration: number;
        clickThroughRate: number;
        peakViewingHours: string[];
        topDisplays: Array<{
            displayId: string;
            displayName: string;
            impressions: number;
        }>;
        topContent: Array<{
            contentId: string;
            contentTitle: string;
            impressions: number;
        }>;
    };
    roi: {
        costPerImpression: number;
        effectivenessScore: number;
        recommendedBudget: number;
    };
}
/**
 * Sponsorship error codes
 */
export type SponsorshipErrorCode = "SPONSORSHIP_NOT_FOUND" | "SPONSORSHIP_ALREADY_EXISTS" | "INVALID_MASJID_ID" | "INVALID_SPONSOR_INFO" | "INVALID_AMOUNT" | "INVALID_DATE_RANGE" | "INVALID_PAYMENT_METHOD" | "PAYMENT_FAILED" | "INSUFFICIENT_BALANCE" | "SPONSORSHIP_EXPIRED" | "SPONSORSHIP_CANCELLED" | "UNAUTHORIZED_ACCESS" | "APPROVAL_REQUIRED" | "ALREADY_APPROVED" | "ALREADY_REJECTED" | "INVALID_STATUS_TRANSITION" | "VALIDATION_ERROR";
/**
 * Available sponsorship types
 */
export declare const SPONSORSHIP_TYPES: readonly SponsorshipType[];
/**
 * Available sponsorship statuses
 */
export declare const SPONSORSHIP_STATUSES: readonly SponsorshipStatus[];
/**
 * Available payment methods
 */
export declare const PAYMENT_METHODS: readonly PaymentMethod[];
/**
 * Payment method display names
 */
export declare const PAYMENT_METHOD_NAMES: {
    readonly "bank-transfer": {
        readonly ms: "Pindahan Bank";
        readonly en: "Bank Transfer";
    };
    readonly "online-banking": {
        readonly ms: "Perbankan Dalam Talian";
        readonly en: "Online Banking";
    };
    readonly "e-wallet": {
        readonly ms: "Dompet Elektronik";
        readonly en: "E-Wallet";
    };
    readonly cash: {
        readonly ms: "Tunai";
        readonly en: "Cash";
    };
    readonly cheque: {
        readonly ms: "Cek";
        readonly en: "Cheque";
    };
    readonly card: {
        readonly ms: "Kad Kredit/Debit";
        readonly en: "Credit/Debit Card";
    };
    readonly "qr-code": {
        readonly ms: "Kod QR";
        readonly en: "QR Code";
    };
};
/**
 * Default sponsorship visibility settings
 */
export declare const DEFAULT_SPONSORSHIP_VISIBILITY: SponsorshipVisibility;
/**
 * Default sponsorship benefits
 */
export declare const DEFAULT_SPONSORSHIP_BENEFITS: SponsorshipBenefits;
/**
 * Sponsorship type benefits mapping
 */
export declare const SPONSORSHIP_TYPE_BENEFITS: {
    readonly content: {
        readonly contentPriorityBoost: 2;
        readonly displayFrequency: 3;
        readonly featuredDisplay: false;
    };
    readonly "time-slot": {
        readonly contentPriorityBoost: 1.8;
        readonly displayFrequency: 1;
        readonly featuredDisplay: true;
    };
    readonly daily: {
        readonly contentPriorityBoost: 1.5;
        readonly displayFrequency: 4;
        readonly featuredDisplay: false;
    };
    readonly weekly: {
        readonly contentPriorityBoost: 1.3;
        readonly displayFrequency: 2;
        readonly featuredDisplay: false;
    };
    readonly monthly: {
        readonly contentPriorityBoost: 1.2;
        readonly displayFrequency: 1;
        readonly featuredDisplay: false;
    };
    readonly event: {
        readonly contentPriorityBoost: 3;
        readonly displayFrequency: 5;
        readonly featuredDisplay: true;
    };
    readonly general: {
        readonly contentPriorityBoost: 1.1;
        readonly displayFrequency: 1;
        readonly featuredDisplay: false;
    };
};
/**
 * Validation constraints
 */
export declare const SPONSORSHIP_VALIDATION: {
    readonly TITLE: {
        readonly MIN_LENGTH: 3;
        readonly MAX_LENGTH: 100;
    };
    readonly DESCRIPTION: {
        readonly MAX_LENGTH: 500;
    };
    readonly AMOUNT: {
        readonly MIN: 1;
        readonly MAX: 100000;
    };
    readonly DISPLAY_DURATION: {
        readonly MIN: 1;
        readonly MAX: 30;
    };
    readonly OPACITY: {
        readonly MIN: 0;
        readonly MAX: 100;
    };
    readonly PRIORITY_BOOST: {
        readonly MIN: 1;
        readonly MAX: 5;
    };
    readonly DISPLAY_FREQUENCY: {
        readonly MIN: 1;
        readonly MAX: 10;
    };
    readonly MESSAGE: {
        readonly MAX_LENGTH: 200;
    };
};
/**
 * Minimum sponsorship amounts by type (MYR)
 */
export declare const MIN_SPONSORSHIP_AMOUNTS: {
    readonly content: 50;
    readonly "time-slot": 100;
    readonly daily: 200;
    readonly weekly: 500;
    readonly monthly: 1500;
    readonly event: 300;
    readonly general: 100;
};
/**
 * Check if a value is a valid sponsorship type
 */
export declare function isValidSponsorshipType(value: unknown): value is SponsorshipType;
/**
 * Check if a value is a valid sponsorship status
 */
export declare function isValidSponsorshipStatus(value: unknown): value is SponsorshipStatus;
/**
 * Check if a value is a valid payment method
 */
export declare function isValidPaymentMethod(value: unknown): value is PaymentMethod;
/**
 * Check if a value is a valid sponsorship amount
 */
export declare function isValidSponsorshipAmount(amount: unknown, type: SponsorshipType): boolean;
/**
 * Type guard for SponsorshipRecord
 */
export declare function isSponsorshipRecord(value: unknown): value is SponsorshipRecord;
/**
 * Type guard for CreateSponsorshipRequest
 */
export declare function isCreateSponsorshipRequest(value: unknown): value is CreateSponsorshipRequest;
/**
 * Get sponsorship type display name
 */
export declare function getSponsorshipTypeDisplayName(type: SponsorshipType, language?: "ms" | "en"): string;
/**
 * Get sponsorship status display name
 */
export declare function getSponsorshipStatusDisplayName(status: SponsorshipStatus, language?: "ms" | "en"): string;
/**
 * Get payment method display name
 */
export declare function getPaymentMethodDisplayName(method: PaymentMethod, language?: "ms" | "en"): string;
/**
 * Calculate sponsorship duration in days
 */
export declare function calculateSponsorshipDuration(startDate: Date, endDate: Date): number;
/**
 * Calculate sponsorship cost per day
 */
export declare function calculateCostPerDay(amount: number, startDate: Date, endDate: Date): number;
/**
 * Check if sponsorship is currently active
 */
export declare function isSponsorshipActive(sponsorship: SponsorshipRecord, currentDate?: Date): boolean;
/**
 * Check if sponsorship can be edited
 */
export declare function isSponsorshipEditable(sponsorship: SponsorshipRecord): boolean;
/**
 * Check if sponsorship can be cancelled
 */
export declare function isSponsorshipCancellable(sponsorship: SponsorshipRecord): boolean;
/**
 * Calculate recommended sponsorship amount based on type and duration
 */
export declare function calculateRecommendedAmount(type: SponsorshipType, startDate: Date, endDate: Date): number;
/**
 * Format sponsorship amount
 */
export declare function formatSponsorshipAmount(amount: number): string;
/**
 * Create sponsorship record with defaults
 */
export declare function createSponsorshipRecord(request: CreateSponsorshipRequest, createdBy: string): SponsorshipRecord;
/**
 * Validate sponsorship dates
 */
export declare function validateSponsorshipDates(startDate: Date, endDate: Date): string[];
/**
 * Validate sponsorship record
 */
export declare function validateSponsorshipRecord(record: Partial<SponsorshipRecord>): string[];
//# sourceMappingURL=sponsorship-record.d.ts.map