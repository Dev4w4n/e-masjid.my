/**
 * Display Content Assignment Model
 *
 * This module defines types and utilities for managing content assignments
 * to TV displays in the Masjid Digital Display system. It handles the
 * relationship between content, displays, and scheduling.
 */
// ============================================================================
// Constants and Validation
// ============================================================================
/**
 * Available assignment statuses
 */
export const ASSIGNMENT_STATUSES = [
    "active",
    "scheduled",
    "paused",
    "expired",
    "cancelled",
    "completed",
];
/**
 * Available priority levels
 */
export const ASSIGNMENT_PRIORITIES = [
    "low",
    "normal",
    "high",
    "urgent",
    "critical",
];
/**
 * Priority score mapping
 */
export const PRIORITY_SCORES = {
    low: 2,
    normal: 5,
    high: 7,
    urgent: 9,
    critical: 10,
};
/**
 * Available display modes
 */
export const DISPLAY_MODES = [
    "fullscreen",
    "overlay",
    "banner",
    "corner",
    "split",
    "carousel",
];
/**
 * Default scheduling rules
 */
export const DEFAULT_SCHEDULING_RULES = {
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // All days
    excludeHolidays: false,
    avoidPrayerTimes: true,
    showBeforePrayer: false,
    showAfterPrayer: false,
    prayerTimeOffset: 5, // 5 minutes
    maxDisplaysPerHour: 6,
    minIntervalBetweenDisplays: 10, // 10 minutes
    requiresSponsorshipActive: false,
    requiresInternetConnection: false,
};
/**
 * Default content rotation settings
 */
export const DEFAULT_CONTENT_ROTATION = {
    enabled: true,
    duration: 10, // 10 seconds
    transitionEffect: "fade",
    randomOrder: false,
    respectPriority: true,
    pauseOnInteraction: true,
};
/**
 * Default display layout for fullscreen
 */
export const DEFAULT_DISPLAY_LAYOUT = {
    mode: "fullscreen",
    position: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
    },
    zIndex: 1,
    opacity: 100,
};
/**
 * Layout presets for different display modes
 */
export const LAYOUT_PRESETS = {
    fullscreen: {
        mode: "fullscreen",
        position: { x: 0, y: 0, width: 100, height: 100 },
        zIndex: 1,
        opacity: 100,
    },
    banner_top: {
        mode: "banner",
        position: { x: 0, y: 0, width: 100, height: 10 },
        zIndex: 10,
        opacity: 90,
    },
    banner_bottom: {
        mode: "banner",
        position: { x: 0, y: 90, width: 100, height: 10 },
        zIndex: 10,
        opacity: 90,
    },
    corner_top_right: {
        mode: "corner",
        position: { x: 75, y: 5, width: 20, height: 15 },
        zIndex: 5,
        opacity: 85,
    },
    overlay_center: {
        mode: "overlay",
        position: { x: 25, y: 25, width: 50, height: 50 },
        zIndex: 8,
        opacity: 95,
    },
};
/**
 * Validation constraints
 */
export const ASSIGNMENT_VALIDATION = {
    TITLE: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 100,
    },
    DESCRIPTION: {
        MAX_LENGTH: 500,
    },
    PRIORITY_SCORE: {
        MIN: 1,
        MAX: 10,
    },
    DISPLAY_DURATION: {
        MIN: 1,
        MAX: 300, // 5 minutes
    },
    POSITION: {
        MIN: 0,
        MAX: 100,
    },
    OPACITY: {
        MIN: 0,
        MAX: 100,
    },
    Z_INDEX: {
        MIN: 0,
        MAX: 100,
    },
    MAX_DISPLAYS_PER_HOUR: {
        MIN: 1,
        MAX: 60,
    },
    MIN_INTERVAL: {
        MIN: 1,
        MAX: 1440, // 24 hours
    },
};
// ============================================================================
// Utility Functions
// ============================================================================
/**
 * Check if a value is a valid assignment status
 */
export function isValidAssignmentStatus(value) {
    return (typeof value === "string" &&
        ASSIGNMENT_STATUSES.includes(value));
}
/**
 * Check if a value is a valid assignment priority
 */
export function isValidAssignmentPriority(value) {
    return (typeof value === "string" &&
        ASSIGNMENT_PRIORITIES.includes(value));
}
/**
 * Check if a value is a valid display mode
 */
export function isValidDisplayMode(value) {
    return (typeof value === "string" && DISPLAY_MODES.includes(value));
}
/**
 * Get priority score from priority level
 */
export function getPriorityScore(priority) {
    return PRIORITY_SCORES[priority];
}
/**
 * Get priority level from score
 */
export function getPriorityLevel(score) {
    if (score <= 3)
        return "low";
    if (score <= 6)
        return "normal";
    if (score <= 8)
        return "high";
    if (score === 9)
        return "urgent";
    return "critical";
}
/**
 * Type guard for DisplayContentAssignment
 */
export function isDisplayContentAssignment(value) {
    if (!value || typeof value !== "object")
        return false;
    const assignment = value;
    return (typeof assignment.id === "string" &&
        typeof assignment.masjidId === "string" &&
        typeof assignment.displayId === "string" &&
        typeof assignment.contentId === "string" &&
        typeof assignment.title === "string" &&
        isValidAssignmentStatus(assignment.status) &&
        isValidAssignmentPriority(assignment.priority) &&
        assignment.startDate instanceof Date &&
        assignment.endDate instanceof Date);
}
/**
 * Type guard for CreateContentAssignmentRequest
 */
export function isCreateContentAssignmentRequest(value) {
    if (!value || typeof value !== "object")
        return false;
    const request = value;
    return (typeof request.masjidId === "string" &&
        typeof request.displayId === "string" &&
        typeof request.contentId === "string" &&
        typeof request.title === "string" &&
        request.title.length >= ASSIGNMENT_VALIDATION.TITLE.MIN_LENGTH &&
        request.title.length <= ASSIGNMENT_VALIDATION.TITLE.MAX_LENGTH &&
        isValidAssignmentPriority(request.priority) &&
        request.startDate instanceof Date &&
        request.endDate instanceof Date);
}
/**
 * Check if assignment is currently active
 */
export function isAssignmentActive(assignment, currentDate = new Date()) {
    return (assignment.status === "active" &&
        assignment.isActive &&
        currentDate >= assignment.startDate &&
        currentDate <= assignment.endDate);
}
/**
 * Check if assignment can be displayed now
 */
export function canDisplayAssignment(assignment, currentDate = new Date()) {
    if (!isAssignmentActive(assignment, currentDate))
        return false;
    const rules = assignment.schedulingRules;
    const now = currentDate;
    // Check day of week
    if (rules.daysOfWeek && !rules.daysOfWeek.includes(now.getDay())) {
        return false;
    }
    // Check time range
    if (rules.startTime || rules.endTime) {
        const currentTime = now.toTimeString().substring(0, 5); // HH:mm
        if (rules.startTime && currentTime < rules.startTime)
            return false;
        if (rules.endTime && currentTime > rules.endTime)
            return false;
    }
    return true;
}
/**
 * Calculate effective priority score including sponsorship boost
 */
export function calculateEffectivePriority(assignment) {
    const basePriority = assignment.priorityScore;
    const sponsorshipBoost = assignment.sponsorshipBoost || 1.0;
    const effectivePriority = basePriority * sponsorshipBoost;
    // Cap at maximum priority
    return Math.min(effectivePriority, ASSIGNMENT_VALIDATION.PRIORITY_SCORE.MAX);
}
/**
 * Get assignment status display name
 */
export function getAssignmentStatusDisplayName(status, language = "ms") {
    const translations = {
        ms: {
            active: "Aktif",
            scheduled: "Dijadualkan",
            paused: "Dijeda",
            expired: "Tamat Tempoh",
            cancelled: "Dibatalkan",
            completed: "Selesai",
        },
        en: {
            active: "Active",
            scheduled: "Scheduled",
            paused: "Paused",
            expired: "Expired",
            cancelled: "Cancelled",
            completed: "Completed",
        },
    };
    return translations[language][status] || status;
}
/**
 * Get priority display name
 */
export function getPriorityDisplayName(priority, language = "ms") {
    const translations = {
        ms: {
            low: "Rendah",
            normal: "Biasa",
            high: "Tinggi",
            urgent: "Mendesak",
            critical: "Kritikal",
        },
        en: {
            low: "Low",
            normal: "Normal",
            high: "High",
            urgent: "Urgent",
            critical: "Critical",
        },
    };
    return translations[language][priority] || priority;
}
/**
 * Get display mode display name
 */
export function getDisplayModeDisplayName(mode, language = "ms") {
    const translations = {
        ms: {
            fullscreen: "Skrin Penuh",
            overlay: "Lapisan",
            banner: "Sepanduk",
            corner: "Sudut",
            split: "Berpecah",
            carousel: "Karusel",
        },
        en: {
            fullscreen: "Full Screen",
            overlay: "Overlay",
            banner: "Banner",
            corner: "Corner",
            split: "Split",
            carousel: "Carousel",
        },
    };
    return translations[language][mode] || mode;
}
/**
 * Create content assignment with defaults
 */
export function createContentAssignment(request, createdBy) {
    const now = new Date();
    const assignmentId = `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const priorityScore = getPriorityScore(request.priority);
    const schedulingRules = {
        ...DEFAULT_SCHEDULING_RULES,
        ...request.schedulingRules,
    };
    const layout = {
        ...DEFAULT_DISPLAY_LAYOUT,
        ...request.layout,
    };
    const rotation = {
        ...DEFAULT_CONTENT_ROTATION,
        ...request.rotation,
    };
    const targeting = {
        ...request.targeting,
    };
    const analytics = {
        totalDisplayTime: 0,
        impressions: 0,
        uniqueViewers: 0,
        engagementScore: 0,
        clickThroughRate: 0,
        completionRate: 0,
        averageViewDuration: 0,
        peakViewingTimes: [],
        skipRate: 0,
        errorCount: 0,
        lastDisplayed: now,
        lastAnalyticsUpdate: now,
    };
    const baseAssignment = {
        id: assignmentId,
        masjidId: request.masjidId,
        displayId: request.displayId,
        contentId: request.contentId,
        title: request.title,
        status: "scheduled",
        priority: request.priority,
        priorityScore,
        startDate: request.startDate,
        endDate: request.endDate,
        timezone: "Asia/Kuala_Lumpur",
        schedulingRules,
        layout,
        rotation,
        targeting,
        sponsorshipBoost: 1.0,
        analytics,
        requiresApproval: request.requiresApproval ?? false,
        version: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy,
        lastModifiedBy: createdBy,
        displayCount: 0,
        errorCount: 0,
    };
    // Add optional properties only if provided
    const optionalFields = {};
    if (request.description !== undefined) {
        optionalFields.description = request.description;
    }
    if (request.sponsorshipId !== undefined) {
        optionalFields.sponsorshipId = request.sponsorshipId;
    }
    return { ...baseAssignment, ...optionalFields };
}
/**
 * Validate assignment date range
 */
export function validateAssignmentDates(startDate, endDate) {
    const errors = [];
    const now = new Date();
    if (startDate >= endDate) {
        errors.push("Start date must be before end date");
    }
    if (endDate <= now) {
        errors.push("End date must be in the future");
    }
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 365) {
        errors.push("Assignment duration cannot exceed 365 days");
    }
    return errors;
}
/**
 * Validate display layout
 */
export function validateDisplayLayout(layout) {
    const errors = [];
    const validation = ASSIGNMENT_VALIDATION;
    if (layout.position) {
        const pos = layout.position;
        if (pos.x < validation.POSITION.MIN || pos.x > validation.POSITION.MAX) {
            errors.push(`X position must be between ${validation.POSITION.MIN} and ${validation.POSITION.MAX}`);
        }
        if (pos.y < validation.POSITION.MIN || pos.y > validation.POSITION.MAX) {
            errors.push(`Y position must be between ${validation.POSITION.MIN} and ${validation.POSITION.MAX}`);
        }
        if (pos.width <= 0 || pos.width > validation.POSITION.MAX) {
            errors.push(`Width must be between 1 and ${validation.POSITION.MAX}`);
        }
        if (pos.height <= 0 || pos.height > validation.POSITION.MAX) {
            errors.push(`Height must be between 1 and ${validation.POSITION.MAX}`);
        }
    }
    if (layout.opacity !== undefined &&
        (layout.opacity < validation.OPACITY.MIN ||
            layout.opacity > validation.OPACITY.MAX)) {
        errors.push(`Opacity must be between ${validation.OPACITY.MIN} and ${validation.OPACITY.MAX}`);
    }
    if (layout.zIndex !== undefined &&
        (layout.zIndex < validation.Z_INDEX.MIN ||
            layout.zIndex > validation.Z_INDEX.MAX)) {
        errors.push(`Z-index must be between ${validation.Z_INDEX.MIN} and ${validation.Z_INDEX.MAX}`);
    }
    return errors;
}
/**
 * Validate content assignment
 */
export function validateContentAssignment(assignment) {
    const errors = [];
    if (assignment.title &&
        (assignment.title.length < ASSIGNMENT_VALIDATION.TITLE.MIN_LENGTH ||
            assignment.title.length > ASSIGNMENT_VALIDATION.TITLE.MAX_LENGTH)) {
        errors.push(`Title must be between ${ASSIGNMENT_VALIDATION.TITLE.MIN_LENGTH} and ${ASSIGNMENT_VALIDATION.TITLE.MAX_LENGTH} characters`);
    }
    if (assignment.description &&
        assignment.description.length > ASSIGNMENT_VALIDATION.DESCRIPTION.MAX_LENGTH) {
        errors.push(`Description must not exceed ${ASSIGNMENT_VALIDATION.DESCRIPTION.MAX_LENGTH} characters`);
    }
    if (assignment.priorityScore !== undefined &&
        (assignment.priorityScore < ASSIGNMENT_VALIDATION.PRIORITY_SCORE.MIN ||
            assignment.priorityScore > ASSIGNMENT_VALIDATION.PRIORITY_SCORE.MAX)) {
        errors.push(`Priority score must be between ${ASSIGNMENT_VALIDATION.PRIORITY_SCORE.MIN} and ${ASSIGNMENT_VALIDATION.PRIORITY_SCORE.MAX}`);
    }
    if (assignment.startDate && assignment.endDate) {
        errors.push(...validateAssignmentDates(assignment.startDate, assignment.endDate));
    }
    if (assignment.layout) {
        errors.push(...validateDisplayLayout(assignment.layout));
    }
    if (assignment.rotation?.duration !== undefined) {
        const duration = assignment.rotation.duration;
        if (duration < ASSIGNMENT_VALIDATION.DISPLAY_DURATION.MIN ||
            duration > ASSIGNMENT_VALIDATION.DISPLAY_DURATION.MAX) {
            errors.push(`Display duration must be between ${ASSIGNMENT_VALIDATION.DISPLAY_DURATION.MIN} and ${ASSIGNMENT_VALIDATION.DISPLAY_DURATION.MAX} seconds`);
        }
    }
    return errors;
}
//# sourceMappingURL=display-content-assignment.js.map