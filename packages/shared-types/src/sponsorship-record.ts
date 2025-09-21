/**
 * Sponsorship Record Model
 *
 * This module defines types and utilities for managing sponsorship records
 * in the Masjid Digital Display system. Sponsorships provide funding for
 * content display and influence content priority and visibility.
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Sponsorship types available
 */
export type SponsorshipType =
  | "content" // Sponsor specific content items
  | "time-slot" // Sponsor specific time slots
  | "daily" // Daily sponsorship
  | "weekly" // Weekly sponsorship
  | "monthly" // Monthly sponsorship
  | "event" // Event-based sponsorship
  | "general"; // General masjid sponsorship

/**
 * Sponsorship status
 */
export type SponsorshipStatus =
  | "pending" // Awaiting approval/payment
  | "active" // Currently active
  | "expired" // Past end date
  | "cancelled" // Cancelled by sponsor or admin
  | "completed" // Successfully completed
  | "refunded"; // Payment refunded

/**
 * Payment status
 */
export type PaymentStatus =
  | "pending" // Payment not received
  | "partial" // Partial payment received
  | "paid" // Fully paid
  | "overdue" // Payment overdue
  | "refunded" // Payment refunded
  | "failed"; // Payment failed

/**
 * Payment method
 */
export type PaymentMethod =
  | "bank-transfer" // Bank transfer/FPX
  | "online-banking" // Online banking
  | "e-wallet" // TNG, GrabPay, etc.
  | "cash" // Cash payment
  | "cheque" // Cheque payment
  | "card" // Credit/Debit card
  | "qr-code"; // QR code payment

/**
 * Sponsorship visibility settings
 */
export interface SponsorshipVisibility {
  showSponsorName: boolean;
  showSponsorLogo: boolean;
  showAmount: boolean;
  showMessage: boolean;
  displayDuration: number; // seconds
  position: "top" | "bottom" | "overlay" | "fullscreen";
  opacity: number; // 0-100
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
  amount: number; // Amount in MYR
  currency: "MYR";
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string; // Payment reference number
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
  contentPriorityBoost: number; // Priority multiplier (1.0 = normal)
  displayFrequency: number; // How often to show per hour
  exclusiveTimeSlots: string[]; // Time slots in HH:mm format
  featuredDisplay: boolean; // Show in featured/premium position
  socialMediaMention: boolean; // Mention on social media
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

  // Sponsorship Details
  type: SponsorshipType;
  title: string;
  description?: string;
  status: SponsorshipStatus;

  // Sponsor Information
  sponsor: SponsorContact;

  // Financial Information
  payment: PaymentInfo;

  // Display Settings
  visibility: SponsorshipVisibility;
  benefits: SponsorshipBenefits;

  // Targeting
  contentIds?: string[]; // Specific content items (for content sponsorship)
  displayIds?: string[]; // Specific displays (optional)
  tags?: string[]; // Tags for content matching

  // Schedule
  startDate: Date;
  endDate: Date;
  timezone: string;

  // Assets
  logoUrl?: string;
  bannerUrl?: string;
  videoUrl?: string;
  customMessage?: string;

  // Analytics
  impressions: number; // How many times displayed
  clicks: number; // Click/interaction count
  reach: number; // Unique viewers reached

  // Metadata
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin user ID
  lastModifiedBy: string;

  // Approval Workflow
  approvedAt?: Date;
  approvedBy?: string; // Admin user ID
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

  // Sponsor Information
  sponsor: SponsorContact;

  // Financial Information
  amount: number;
  paymentMethod: PaymentMethod;
  dueDate?: Date;

  // Schedule
  startDate: Date;
  endDate: Date;

  // Display Settings (optional - will use defaults)
  visibility?: Partial<SponsorshipVisibility>;
  benefits?: Partial<SponsorshipBenefits>;

  // Targeting (optional)
  contentIds?: string[];
  displayIds?: string[];
  tags?: string[];

  // Assets (optional)
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
    averageViewDuration: number; // seconds
    clickThroughRate: number; // percentage
    peakViewingHours: string[]; // Hours with most views
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
    costPerImpression: number; // MYR per impression
    effectivenessScore: number; // 0-100 score
    recommendedBudget: number; // Suggested future budget
  };
}

/**
 * Sponsorship error codes
 */
export type SponsorshipErrorCode =
  | "SPONSORSHIP_NOT_FOUND"
  | "SPONSORSHIP_ALREADY_EXISTS"
  | "INVALID_MASJID_ID"
  | "INVALID_SPONSOR_INFO"
  | "INVALID_AMOUNT"
  | "INVALID_DATE_RANGE"
  | "INVALID_PAYMENT_METHOD"
  | "PAYMENT_FAILED"
  | "INSUFFICIENT_BALANCE"
  | "SPONSORSHIP_EXPIRED"
  | "SPONSORSHIP_CANCELLED"
  | "UNAUTHORIZED_ACCESS"
  | "APPROVAL_REQUIRED"
  | "ALREADY_APPROVED"
  | "ALREADY_REJECTED"
  | "INVALID_STATUS_TRANSITION"
  | "VALIDATION_ERROR";

// ============================================================================
// Constants and Validation
// ============================================================================

/**
 * Available sponsorship types
 */
export const SPONSORSHIP_TYPES: readonly SponsorshipType[] = [
  "content",
  "time-slot",
  "daily",
  "weekly",
  "monthly",
  "event",
  "general",
] as const;

/**
 * Available sponsorship statuses
 */
export const SPONSORSHIP_STATUSES: readonly SponsorshipStatus[] = [
  "pending",
  "active",
  "expired",
  "cancelled",
  "completed",
  "refunded",
] as const;

/**
 * Available payment methods
 */
export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  "bank-transfer",
  "online-banking",
  "e-wallet",
  "cash",
  "cheque",
  "card",
  "qr-code",
] as const;

/**
 * Payment method display names
 */
export const PAYMENT_METHOD_NAMES = {
  "bank-transfer": {
    ms: "Pindahan Bank",
    en: "Bank Transfer",
  },
  "online-banking": {
    ms: "Perbankan Dalam Talian",
    en: "Online Banking",
  },
  "e-wallet": {
    ms: "Dompet Elektronik",
    en: "E-Wallet",
  },
  cash: {
    ms: "Tunai",
    en: "Cash",
  },
  cheque: {
    ms: "Cek",
    en: "Cheque",
  },
  card: {
    ms: "Kad Kredit/Debit",
    en: "Credit/Debit Card",
  },
  "qr-code": {
    ms: "Kod QR",
    en: "QR Code",
  },
} as const;

/**
 * Default sponsorship visibility settings
 */
export const DEFAULT_SPONSORSHIP_VISIBILITY: SponsorshipVisibility = {
  showSponsorName: true,
  showSponsorLogo: true,
  showAmount: false,
  showMessage: true,
  displayDuration: 5,
  position: "bottom",
  opacity: 80,
};

/**
 * Default sponsorship benefits
 */
export const DEFAULT_SPONSORSHIP_BENEFITS: SponsorshipBenefits = {
  contentPriorityBoost: 1.5,
  displayFrequency: 2,
  exclusiveTimeSlots: [],
  featuredDisplay: false,
  socialMediaMention: false,
  certificateOfAppreciation: true,
  newsletterMention: false,
  websiteListing: true,
};

/**
 * Sponsorship type benefits mapping
 */
export const SPONSORSHIP_TYPE_BENEFITS = {
  content: {
    contentPriorityBoost: 2.0,
    displayFrequency: 3,
    featuredDisplay: false,
  },
  "time-slot": {
    contentPriorityBoost: 1.8,
    displayFrequency: 1,
    featuredDisplay: true,
  },
  daily: {
    contentPriorityBoost: 1.5,
    displayFrequency: 4,
    featuredDisplay: false,
  },
  weekly: {
    contentPriorityBoost: 1.3,
    displayFrequency: 2,
    featuredDisplay: false,
  },
  monthly: {
    contentPriorityBoost: 1.2,
    displayFrequency: 1,
    featuredDisplay: false,
  },
  event: {
    contentPriorityBoost: 3.0,
    displayFrequency: 5,
    featuredDisplay: true,
  },
  general: {
    contentPriorityBoost: 1.1,
    displayFrequency: 1,
    featuredDisplay: false,
  },
} as const;

/**
 * Validation constraints
 */
export const SPONSORSHIP_VALIDATION = {
  TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  AMOUNT: {
    MIN: 1,
    MAX: 100000, // RM 100,000
  },
  DISPLAY_DURATION: {
    MIN: 1,
    MAX: 30, // 30 seconds max
  },
  OPACITY: {
    MIN: 0,
    MAX: 100,
  },
  PRIORITY_BOOST: {
    MIN: 1.0,
    MAX: 5.0,
  },
  DISPLAY_FREQUENCY: {
    MIN: 1,
    MAX: 10, // Max 10 times per hour
  },
  MESSAGE: {
    MAX_LENGTH: 200,
  },
} as const;

/**
 * Minimum sponsorship amounts by type (MYR)
 */
export const MIN_SPONSORSHIP_AMOUNTS = {
  content: 50,
  "time-slot": 100,
  daily: 200,
  weekly: 500,
  monthly: 1500,
  event: 300,
  general: 100,
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a value is a valid sponsorship type
 */
export function isValidSponsorshipType(
  value: unknown
): value is SponsorshipType {
  return (
    typeof value === "string" &&
    SPONSORSHIP_TYPES.includes(value as SponsorshipType)
  );
}

/**
 * Check if a value is a valid sponsorship status
 */
export function isValidSponsorshipStatus(
  value: unknown
): value is SponsorshipStatus {
  return (
    typeof value === "string" &&
    SPONSORSHIP_STATUSES.includes(value as SponsorshipStatus)
  );
}

/**
 * Check if a value is a valid payment method
 */
export function isValidPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    PAYMENT_METHODS.includes(value as PaymentMethod)
  );
}

/**
 * Check if a value is a valid sponsorship amount
 */
export function isValidSponsorshipAmount(
  amount: unknown,
  type: SponsorshipType
): boolean {
  if (typeof amount !== "number") return false;

  const minAmount =
    MIN_SPONSORSHIP_AMOUNTS[type] || SPONSORSHIP_VALIDATION.AMOUNT.MIN;
  return amount >= minAmount && amount <= SPONSORSHIP_VALIDATION.AMOUNT.MAX;
}

/**
 * Type guard for SponsorshipRecord
 */
export function isSponsorshipRecord(
  value: unknown
): value is SponsorshipRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as any;
  return (
    typeof record.id === "string" &&
    typeof record.masjidId === "string" &&
    isValidSponsorshipType(record.type) &&
    typeof record.title === "string" &&
    isValidSponsorshipStatus(record.status) &&
    typeof record.sponsor === "object" &&
    typeof record.payment === "object" &&
    record.startDate instanceof Date &&
    record.endDate instanceof Date
  );
}

/**
 * Type guard for CreateSponsorshipRequest
 */
export function isCreateSponsorshipRequest(
  value: unknown
): value is CreateSponsorshipRequest {
  if (!value || typeof value !== "object") return false;

  const request = value as any;
  return (
    typeof request.masjidId === "string" &&
    isValidSponsorshipType(request.type) &&
    typeof request.title === "string" &&
    request.title.length >= SPONSORSHIP_VALIDATION.TITLE.MIN_LENGTH &&
    request.title.length <= SPONSORSHIP_VALIDATION.TITLE.MAX_LENGTH &&
    typeof request.sponsor === "object" &&
    typeof request.amount === "number" &&
    isValidSponsorshipAmount(request.amount, request.type) &&
    request.startDate instanceof Date &&
    request.endDate instanceof Date
  );
}

/**
 * Get sponsorship type display name
 */
export function getSponsorshipTypeDisplayName(
  type: SponsorshipType,
  language: "ms" | "en" = "ms"
): string {
  const translations = {
    ms: {
      content: "Kandungan",
      "time-slot": "Slot Masa",
      daily: "Harian",
      weekly: "Mingguan",
      monthly: "Bulanan",
      event: "Acara",
      general: "Am",
    },
    en: {
      content: "Content",
      "time-slot": "Time Slot",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      event: "Event",
      general: "General",
    },
  };

  return translations[language][type] || type;
}

/**
 * Get sponsorship status display name
 */
export function getSponsorshipStatusDisplayName(
  status: SponsorshipStatus,
  language: "ms" | "en" = "ms"
): string {
  const translations = {
    ms: {
      pending: "Menunggu",
      active: "Aktif",
      expired: "Tamat Tempoh",
      cancelled: "Dibatalkan",
      completed: "Selesai",
      refunded: "Dipulangkan",
    },
    en: {
      pending: "Pending",
      active: "Active",
      expired: "Expired",
      cancelled: "Cancelled",
      completed: "Completed",
      refunded: "Refunded",
    },
  };

  return translations[language][status] || status;
}

/**
 * Get payment method display name
 */
export function getPaymentMethodDisplayName(
  method: PaymentMethod,
  language: "ms" | "en" = "ms"
): string {
  return PAYMENT_METHOD_NAMES[method][language] || method;
}

/**
 * Calculate sponsorship duration in days
 */
export function calculateSponsorshipDuration(
  startDate: Date,
  endDate: Date
): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate sponsorship cost per day
 */
export function calculateCostPerDay(
  amount: number,
  startDate: Date,
  endDate: Date
): number {
  const duration = calculateSponsorshipDuration(startDate, endDate);
  return duration > 0 ? amount / duration : 0;
}

/**
 * Check if sponsorship is currently active
 */
export function isSponsorshipActive(
  sponsorship: SponsorshipRecord,
  currentDate: Date = new Date()
): boolean {
  return (
    sponsorship.status === "active" &&
    sponsorship.isActive &&
    currentDate >= sponsorship.startDate &&
    currentDate <= sponsorship.endDate
  );
}

/**
 * Check if sponsorship can be edited
 */
export function isSponsorshipEditable(sponsorship: SponsorshipRecord): boolean {
  return (
    ["pending", "active"].includes(sponsorship.status) && sponsorship.isActive
  );
}

/**
 * Check if sponsorship can be cancelled
 */
export function isSponsorshipCancellable(
  sponsorship: SponsorshipRecord
): boolean {
  return (
    ["pending", "active"].includes(sponsorship.status) && sponsorship.isActive
  );
}

/**
 * Calculate recommended sponsorship amount based on type and duration
 */
export function calculateRecommendedAmount(
  type: SponsorshipType,
  startDate: Date,
  endDate: Date
): number {
  const duration = calculateSponsorshipDuration(startDate, endDate);
  const baseAmount = MIN_SPONSORSHIP_AMOUNTS[type];

  // Simple calculation: base amount * duration factor
  const durationFactor = Math.max(1, Math.sqrt(duration));
  return Math.round(baseAmount * durationFactor);
}

/**
 * Format sponsorship amount
 */
export function formatSponsorshipAmount(amount: number): string {
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Create sponsorship record with defaults
 */
export function createSponsorshipRecord(
  request: CreateSponsorshipRequest,
  createdBy: string
): SponsorshipRecord {
  const now = new Date();
  const sponsorshipId = `sponsorship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const payment: PaymentInfo = {
    amount: request.amount,
    currency: "MYR",
    method: request.paymentMethod,
    status: "pending",
    ...(request.dueDate && { dueDate: request.dueDate }),
  };

  const visibility: SponsorshipVisibility = {
    ...DEFAULT_SPONSORSHIP_VISIBILITY,
    ...request.visibility,
  };

  const typeBenefits = SPONSORSHIP_TYPE_BENEFITS[request.type];
  const benefits: SponsorshipBenefits = {
    ...DEFAULT_SPONSORSHIP_BENEFITS,
    ...typeBenefits,
    ...request.benefits,
  };

  const baseRecord = {
    id: sponsorshipId,
    masjidId: request.masjidId,
    type: request.type,
    title: request.title,
    status: "pending" as SponsorshipStatus,
    sponsor: request.sponsor,
    payment,
    visibility,
    benefits,
    startDate: request.startDate,
    endDate: request.endDate,
    timezone: "Asia/Kuala_Lumpur",
    impressions: 0,
    clicks: 0,
    reach: 0,
    version: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    createdBy,
    lastModifiedBy: createdBy,
  };

  // Add optional properties only if provided
  const optionalFields: Partial<SponsorshipRecord> = {};

  if (request.description !== undefined) {
    optionalFields.description = request.description;
  }
  if (request.contentIds !== undefined) {
    optionalFields.contentIds = request.contentIds;
  }
  if (request.displayIds !== undefined) {
    optionalFields.displayIds = request.displayIds;
  }
  if (request.tags !== undefined) {
    optionalFields.tags = request.tags;
  }
  if (request.logoUrl !== undefined) {
    optionalFields.logoUrl = request.logoUrl;
  }
  if (request.bannerUrl !== undefined) {
    optionalFields.bannerUrl = request.bannerUrl;
  }
  if (request.videoUrl !== undefined) {
    optionalFields.videoUrl = request.videoUrl;
  }
  if (request.customMessage !== undefined) {
    optionalFields.customMessage = request.customMessage;
  }

  return { ...baseRecord, ...optionalFields } as SponsorshipRecord;
}

/**
 * Validate sponsorship dates
 */
export function validateSponsorshipDates(
  startDate: Date,
  endDate: Date
): string[] {
  const errors: string[] = [];
  const now = new Date();

  if (startDate >= endDate) {
    errors.push("Start date must be before end date");
  }

  if (endDate <= now) {
    errors.push("End date must be in the future");
  }

  const duration = calculateSponsorshipDuration(startDate, endDate);
  if (duration > 365) {
    errors.push("Sponsorship duration cannot exceed 365 days");
  }

  return errors;
}

/**
 * Validate sponsorship record
 */
export function validateSponsorshipRecord(
  record: Partial<SponsorshipRecord>
): string[] {
  const errors: string[] = [];

  if (
    record.title &&
    (record.title.length < SPONSORSHIP_VALIDATION.TITLE.MIN_LENGTH ||
      record.title.length > SPONSORSHIP_VALIDATION.TITLE.MAX_LENGTH)
  ) {
    errors.push(
      `Title must be between ${SPONSORSHIP_VALIDATION.TITLE.MIN_LENGTH} and ${SPONSORSHIP_VALIDATION.TITLE.MAX_LENGTH} characters`
    );
  }

  if (
    record.description &&
    record.description.length > SPONSORSHIP_VALIDATION.DESCRIPTION.MAX_LENGTH
  ) {
    errors.push(
      `Description must not exceed ${SPONSORSHIP_VALIDATION.DESCRIPTION.MAX_LENGTH} characters`
    );
  }

  if (record.payment?.amount !== undefined && record.type) {
    if (!isValidSponsorshipAmount(record.payment.amount, record.type)) {
      const minAmount = MIN_SPONSORSHIP_AMOUNTS[record.type];
      errors.push(
        `Amount must be between RM${minAmount} and RM${SPONSORSHIP_VALIDATION.AMOUNT.MAX.toLocaleString()}`
      );
    }
  }

  if (record.startDate && record.endDate) {
    errors.push(...validateSponsorshipDates(record.startDate, record.endDate));
  }

  if (
    record.customMessage &&
    record.customMessage.length > SPONSORSHIP_VALIDATION.MESSAGE.MAX_LENGTH
  ) {
    errors.push(
      `Custom message must not exceed ${SPONSORSHIP_VALIDATION.MESSAGE.MAX_LENGTH} characters`
    );
  }

  return errors;
}
