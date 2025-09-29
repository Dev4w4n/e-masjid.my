/**
 * Sponsorship Record Model
 *
 * This module defines types and utilities for managing sponsorship records
 * in the Masjid Digital Display system. Sponsorships provide funding for
 * content display and influence content priority and visibility.
 */
// ============================================================================
// Constants and Validation
// ============================================================================
/**
 * Available sponsorship types
 */
export const SPONSORSHIP_TYPES = [
    "content",
    "time-slot",
    "daily",
    "weekly",
    "monthly",
    "event",
    "general",
];
/**
 * Available sponsorship statuses
 */
export const SPONSORSHIP_STATUSES = [
    "pending",
    "active",
    "expired",
    "cancelled",
    "completed",
    "refunded",
];
/**
 * Available payment methods
 */
export const PAYMENT_METHODS = [
    "bank-transfer",
    "online-banking",
    "e-wallet",
    "cash",
    "cheque",
    "card",
    "qr-code",
];
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
};
/**
 * Default sponsorship visibility settings
 */
export const DEFAULT_SPONSORSHIP_VISIBILITY = {
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
export const DEFAULT_SPONSORSHIP_BENEFITS = {
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
};
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
};
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
};
// ============================================================================
// Utility Functions
// ============================================================================
/**
 * Check if a value is a valid sponsorship type
 */
export function isValidSponsorshipType(value) {
    return (typeof value === "string" &&
        SPONSORSHIP_TYPES.includes(value));
}
/**
 * Check if a value is a valid sponsorship status
 */
export function isValidSponsorshipStatus(value) {
    return (typeof value === "string" &&
        SPONSORSHIP_STATUSES.includes(value));
}
/**
 * Check if a value is a valid payment method
 */
export function isValidPaymentMethod(value) {
    return (typeof value === "string" &&
        PAYMENT_METHODS.includes(value));
}
/**
 * Check if a value is a valid sponsorship amount
 */
export function isValidSponsorshipAmount(amount, type) {
    if (typeof amount !== "number")
        return false;
    const minAmount = MIN_SPONSORSHIP_AMOUNTS[type] || SPONSORSHIP_VALIDATION.AMOUNT.MIN;
    return amount >= minAmount && amount <= SPONSORSHIP_VALIDATION.AMOUNT.MAX;
}
/**
 * Type guard for SponsorshipRecord
 */
export function isSponsorshipRecord(value) {
    if (!value || typeof value !== "object")
        return false;
    const record = value;
    return (typeof record.id === "string" &&
        typeof record.masjidId === "string" &&
        isValidSponsorshipType(record.type) &&
        typeof record.title === "string" &&
        isValidSponsorshipStatus(record.status) &&
        typeof record.sponsor === "object" &&
        typeof record.payment === "object" &&
        record.startDate instanceof Date &&
        record.endDate instanceof Date);
}
/**
 * Type guard for CreateSponsorshipRequest
 */
export function isCreateSponsorshipRequest(value) {
    if (!value || typeof value !== "object")
        return false;
    const request = value;
    return (typeof request.masjidId === "string" &&
        isValidSponsorshipType(request.type) &&
        typeof request.title === "string" &&
        request.title.length >= SPONSORSHIP_VALIDATION.TITLE.MIN_LENGTH &&
        request.title.length <= SPONSORSHIP_VALIDATION.TITLE.MAX_LENGTH &&
        typeof request.sponsor === "object" &&
        typeof request.amount === "number" &&
        isValidSponsorshipAmount(request.amount, request.type) &&
        request.startDate instanceof Date &&
        request.endDate instanceof Date);
}
/**
 * Get sponsorship type display name
 */
export function getSponsorshipTypeDisplayName(type, language = "ms") {
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
export function getSponsorshipStatusDisplayName(status, language = "ms") {
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
export function getPaymentMethodDisplayName(method, language = "ms") {
    return PAYMENT_METHOD_NAMES[method][language] || method;
}
/**
 * Calculate sponsorship duration in days
 */
export function calculateSponsorshipDuration(startDate, endDate) {
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
/**
 * Calculate sponsorship cost per day
 */
export function calculateCostPerDay(amount, startDate, endDate) {
    const duration = calculateSponsorshipDuration(startDate, endDate);
    return duration > 0 ? amount / duration : 0;
}
/**
 * Check if sponsorship is currently active
 */
export function isSponsorshipActive(sponsorship, currentDate = new Date()) {
    return (sponsorship.status === "active" &&
        sponsorship.isActive &&
        currentDate >= sponsorship.startDate &&
        currentDate <= sponsorship.endDate);
}
/**
 * Check if sponsorship can be edited
 */
export function isSponsorshipEditable(sponsorship) {
    return (["pending", "active"].includes(sponsorship.status) && sponsorship.isActive);
}
/**
 * Check if sponsorship can be cancelled
 */
export function isSponsorshipCancellable(sponsorship) {
    return (["pending", "active"].includes(sponsorship.status) && sponsorship.isActive);
}
/**
 * Calculate recommended sponsorship amount based on type and duration
 */
export function calculateRecommendedAmount(type, startDate, endDate) {
    const duration = calculateSponsorshipDuration(startDate, endDate);
    const baseAmount = MIN_SPONSORSHIP_AMOUNTS[type];
    // Simple calculation: base amount * duration factor
    const durationFactor = Math.max(1, Math.sqrt(duration));
    return Math.round(baseAmount * durationFactor);
}
/**
 * Format sponsorship amount
 */
export function formatSponsorshipAmount(amount) {
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
export function createSponsorshipRecord(request, createdBy) {
    const now = new Date();
    const sponsorshipId = `sponsorship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payment = {
        amount: request.amount,
        currency: "MYR",
        method: request.paymentMethod,
        status: "pending",
        ...(request.dueDate && { dueDate: request.dueDate }),
    };
    const visibility = {
        ...DEFAULT_SPONSORSHIP_VISIBILITY,
        ...request.visibility,
    };
    const typeBenefits = SPONSORSHIP_TYPE_BENEFITS[request.type];
    const benefits = {
        ...DEFAULT_SPONSORSHIP_BENEFITS,
        ...typeBenefits,
        ...request.benefits,
    };
    const baseRecord = {
        id: sponsorshipId,
        masjidId: request.masjidId,
        type: request.type,
        title: request.title,
        status: "pending",
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
    const optionalFields = {};
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
    return { ...baseRecord, ...optionalFields };
}
/**
 * Validate sponsorship dates
 */
export function validateSponsorshipDates(startDate, endDate) {
    const errors = [];
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
export function validateSponsorshipRecord(record) {
    const errors = [];
    if (record.title &&
        (record.title.length < SPONSORSHIP_VALIDATION.TITLE.MIN_LENGTH ||
            record.title.length > SPONSORSHIP_VALIDATION.TITLE.MAX_LENGTH)) {
        errors.push(`Title must be between ${SPONSORSHIP_VALIDATION.TITLE.MIN_LENGTH} and ${SPONSORSHIP_VALIDATION.TITLE.MAX_LENGTH} characters`);
    }
    if (record.description &&
        record.description.length > SPONSORSHIP_VALIDATION.DESCRIPTION.MAX_LENGTH) {
        errors.push(`Description must not exceed ${SPONSORSHIP_VALIDATION.DESCRIPTION.MAX_LENGTH} characters`);
    }
    if (record.payment?.amount !== undefined && record.type) {
        if (!isValidSponsorshipAmount(record.payment.amount, record.type)) {
            const minAmount = MIN_SPONSORSHIP_AMOUNTS[record.type];
            errors.push(`Amount must be between RM${minAmount} and RM${SPONSORSHIP_VALIDATION.AMOUNT.MAX.toLocaleString()}`);
        }
    }
    if (record.startDate && record.endDate) {
        errors.push(...validateSponsorshipDates(record.startDate, record.endDate));
    }
    if (record.customMessage &&
        record.customMessage.length > SPONSORSHIP_VALIDATION.MESSAGE.MAX_LENGTH) {
        errors.push(`Custom message must not exceed ${SPONSORSHIP_VALIDATION.MESSAGE.MAX_LENGTH} characters`);
    }
    return errors;
}
//# sourceMappingURL=sponsorship-record.js.map