/**
 * Display Content Assignment Model
 *
 * This module defines types and utilities for managing content assignments
 * to TV displays in the Masjid Digital Display system. It handles the
 * relationship between content, displays, and scheduling.
 */
/**
 * Assignment status
 */
export type AssignmentStatus = "active" | "scheduled" | "paused" | "expired" | "cancelled" | "completed";
/**
 * Assignment priority levels
 */
export type AssignmentPriority = "low" | "normal" | "high" | "urgent" | "critical";
/**
 * Content display modes
 */
export type DisplayMode = "fullscreen" | "overlay" | "banner" | "corner" | "split" | "carousel";
/**
 * Scheduling rules for content
 */
export interface SchedulingRules {
    startTime?: string;
    endTime?: string;
    daysOfWeek?: number[];
    excludeHolidays?: boolean;
    avoidPrayerTimes?: boolean;
    showBeforePrayer?: boolean;
    showAfterPrayer?: boolean;
    prayerTimeOffset?: number;
    maxDisplaysPerHour?: number;
    minIntervalBetweenDisplays?: number;
    requiresSponsorshipActive?: boolean;
    requiresInternetConnection?: boolean;
    weatherConditions?: string[];
}
/**
 * Content rotation settings
 */
export interface ContentRotation {
    enabled: boolean;
    duration: number;
    transitionEffect: "fade" | "slide" | "zoom" | "flip" | "none";
    randomOrder: boolean;
    respectPriority: boolean;
    pauseOnInteraction: boolean;
}
/**
 * Display position and layout
 */
export interface DisplayLayout {
    mode: DisplayMode;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    zIndex: number;
    opacity: number;
    borderRadius?: number;
    padding?: number;
    margin?: number;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
}
/**
 * Content targeting criteria
 */
export interface ContentTargeting {
    languages?: string[];
    ageGroups?: string[];
    interests?: string[];
    locations?: string[];
    zones?: string[];
    seasons?: string[];
    occasions?: string[];
    eventTypes?: string[];
    weatherConditions?: string[];
    displayCapabilities?: string[];
    minResolution?: string;
    requiresAudio?: boolean;
    requiresTouch?: boolean;
}
/**
 * Assignment analytics and tracking
 */
export interface AssignmentAnalytics {
    totalDisplayTime: number;
    impressions: number;
    uniqueViewers: number;
    engagementScore: number;
    clickThroughRate: number;
    completionRate: number;
    averageViewDuration: number;
    peakViewingTimes: string[];
    skipRate: number;
    errorCount: number;
    lastDisplayed: Date;
    lastAnalyticsUpdate: Date;
}
/**
 * Main display content assignment interface
 */
export interface DisplayContentAssignment {
    id: string;
    masjidId: string;
    displayId: string;
    contentId: string;
    title: string;
    description?: string;
    status: AssignmentStatus;
    priority: AssignmentPriority;
    priorityScore: number;
    startDate: Date;
    endDate: Date;
    timezone: string;
    schedulingRules: SchedulingRules;
    layout: DisplayLayout;
    rotation: ContentRotation;
    targeting: ContentTargeting;
    sponsorshipId?: string;
    sponsorshipBoost: number;
    analytics: AssignmentAnalytics;
    requiresApproval: boolean;
    approvalStatus?: "pending" | "approved" | "rejected";
    approvedAt?: Date;
    approvedBy?: string;
    rejectedAt?: Date;
    rejectedBy?: string;
    rejectionReason?: string;
    version: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
    lastDisplayed?: Date;
    nextScheduledDisplay?: Date;
    displayCount: number;
    errorCount: number;
    lastError?: string;
    lastErrorAt?: Date;
}
/**
 * Request for creating a content assignment
 */
export interface CreateContentAssignmentRequest {
    masjidId: string;
    displayId: string;
    contentId: string;
    title: string;
    description?: string;
    priority: AssignmentPriority;
    startDate: Date;
    endDate: Date;
    schedulingRules?: Partial<SchedulingRules>;
    layout?: Partial<DisplayLayout>;
    rotation?: Partial<ContentRotation>;
    targeting?: Partial<ContentTargeting>;
    sponsorshipId?: string;
    requiresApproval?: boolean;
}
/**
 * Request for updating content assignment
 */
export interface UpdateContentAssignmentRequest {
    title?: string;
    description?: string;
    status?: AssignmentStatus;
    priority?: AssignmentPriority;
    startDate?: Date;
    endDate?: Date;
    schedulingRules?: Partial<SchedulingRules>;
    layout?: Partial<DisplayLayout>;
    rotation?: Partial<ContentRotation>;
    targeting?: Partial<ContentTargeting>;
    sponsorshipId?: string;
    requiresApproval?: boolean;
    isActive?: boolean;
}
/**
 * Request for approving content assignment
 */
export interface ApproveContentAssignmentRequest {
    approve: boolean;
    rejectionReason?: string;
    notes?: string;
}
/**
 * Assignment with full relations
 */
export interface DisplayContentAssignmentWithRelations extends DisplayContentAssignment {
    masjid: {
        id: string;
        name: string;
        timezone: string;
        jakimZone: string;
    };
    display: {
        id: string;
        name: string;
        location: string;
        resolution: string;
        capabilities: string[];
    };
    content: {
        id: string;
        title: string;
        type: string;
        status: string;
        url: string;
        duration: number;
        thumbnailUrl?: string;
    };
    sponsorship?: {
        id: string;
        title: string;
        sponsor: {
            name: string;
            company?: string;
        };
        amount: number;
        benefits: {
            contentPriorityBoost: number;
            displayFrequency: number;
        };
    };
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
 * Assignment schedule entry
 */
export interface AssignmentScheduleEntry {
    assignmentId: string;
    displayTime: Date;
    duration: number;
    priorityScore: number;
    layout: DisplayLayout;
    sponsorshipBoost: number;
    estimatedViewers: number;
}
/**
 * Assignment error codes
 */
export type AssignmentErrorCode = "ASSIGNMENT_NOT_FOUND" | "ASSIGNMENT_ALREADY_EXISTS" | "INVALID_MASJID_ID" | "INVALID_DISPLAY_ID" | "INVALID_CONTENT_ID" | "INVALID_DATE_RANGE" | "INVALID_PRIORITY" | "INVALID_LAYOUT" | "CONTENT_NOT_APPROVED" | "DISPLAY_NOT_AVAILABLE" | "SCHEDULING_CONFLICT" | "INSUFFICIENT_PERMISSIONS" | "SPONSORSHIP_REQUIRED" | "APPROVAL_REQUIRED" | "ALREADY_APPROVED" | "ALREADY_REJECTED" | "DISPLAY_CAPACITY_EXCEEDED" | "VALIDATION_ERROR";
/**
 * Available assignment statuses
 */
export declare const ASSIGNMENT_STATUSES: readonly AssignmentStatus[];
/**
 * Available priority levels
 */
export declare const ASSIGNMENT_PRIORITIES: readonly AssignmentPriority[];
/**
 * Priority score mapping
 */
export declare const PRIORITY_SCORES: {
    readonly low: 2;
    readonly normal: 5;
    readonly high: 7;
    readonly urgent: 9;
    readonly critical: 10;
};
/**
 * Available display modes
 */
export declare const DISPLAY_MODES: readonly DisplayMode[];
/**
 * Default scheduling rules
 */
export declare const DEFAULT_SCHEDULING_RULES: SchedulingRules;
/**
 * Default content rotation settings
 */
export declare const DEFAULT_CONTENT_ROTATION: ContentRotation;
/**
 * Default display layout for fullscreen
 */
export declare const DEFAULT_DISPLAY_LAYOUT: DisplayLayout;
/**
 * Layout presets for different display modes
 */
export declare const LAYOUT_PRESETS: {
    readonly fullscreen: {
        readonly mode: DisplayMode;
        readonly position: {
            readonly x: 0;
            readonly y: 0;
            readonly width: 100;
            readonly height: 100;
        };
        readonly zIndex: 1;
        readonly opacity: 100;
    };
    readonly banner_top: {
        readonly mode: DisplayMode;
        readonly position: {
            readonly x: 0;
            readonly y: 0;
            readonly width: 100;
            readonly height: 10;
        };
        readonly zIndex: 10;
        readonly opacity: 90;
    };
    readonly banner_bottom: {
        readonly mode: DisplayMode;
        readonly position: {
            readonly x: 0;
            readonly y: 90;
            readonly width: 100;
            readonly height: 10;
        };
        readonly zIndex: 10;
        readonly opacity: 90;
    };
    readonly corner_top_right: {
        readonly mode: DisplayMode;
        readonly position: {
            readonly x: 75;
            readonly y: 5;
            readonly width: 20;
            readonly height: 15;
        };
        readonly zIndex: 5;
        readonly opacity: 85;
    };
    readonly overlay_center: {
        readonly mode: DisplayMode;
        readonly position: {
            readonly x: 25;
            readonly y: 25;
            readonly width: 50;
            readonly height: 50;
        };
        readonly zIndex: 8;
        readonly opacity: 95;
    };
};
/**
 * Validation constraints
 */
export declare const ASSIGNMENT_VALIDATION: {
    readonly TITLE: {
        readonly MIN_LENGTH: 3;
        readonly MAX_LENGTH: 100;
    };
    readonly DESCRIPTION: {
        readonly MAX_LENGTH: 500;
    };
    readonly PRIORITY_SCORE: {
        readonly MIN: 1;
        readonly MAX: 10;
    };
    readonly DISPLAY_DURATION: {
        readonly MIN: 1;
        readonly MAX: 300;
    };
    readonly POSITION: {
        readonly MIN: 0;
        readonly MAX: 100;
    };
    readonly OPACITY: {
        readonly MIN: 0;
        readonly MAX: 100;
    };
    readonly Z_INDEX: {
        readonly MIN: 0;
        readonly MAX: 100;
    };
    readonly MAX_DISPLAYS_PER_HOUR: {
        readonly MIN: 1;
        readonly MAX: 60;
    };
    readonly MIN_INTERVAL: {
        readonly MIN: 1;
        readonly MAX: 1440;
    };
};
/**
 * Check if a value is a valid assignment status
 */
export declare function isValidAssignmentStatus(value: unknown): value is AssignmentStatus;
/**
 * Check if a value is a valid assignment priority
 */
export declare function isValidAssignmentPriority(value: unknown): value is AssignmentPriority;
/**
 * Check if a value is a valid display mode
 */
export declare function isValidDisplayMode(value: unknown): value is DisplayMode;
/**
 * Get priority score from priority level
 */
export declare function getPriorityScore(priority: AssignmentPriority): number;
/**
 * Get priority level from score
 */
export declare function getPriorityLevel(score: number): AssignmentPriority;
/**
 * Type guard for DisplayContentAssignment
 */
export declare function isDisplayContentAssignment(value: unknown): value is DisplayContentAssignment;
/**
 * Type guard for CreateContentAssignmentRequest
 */
export declare function isCreateContentAssignmentRequest(value: unknown): value is CreateContentAssignmentRequest;
/**
 * Check if assignment is currently active
 */
export declare function isAssignmentActive(assignment: DisplayContentAssignment, currentDate?: Date): boolean;
/**
 * Check if assignment can be displayed now
 */
export declare function canDisplayAssignment(assignment: DisplayContentAssignment, currentDate?: Date): boolean;
/**
 * Calculate effective priority score including sponsorship boost
 */
export declare function calculateEffectivePriority(assignment: DisplayContentAssignment): number;
/**
 * Get assignment status display name
 */
export declare function getAssignmentStatusDisplayName(status: AssignmentStatus, language?: "ms" | "en"): string;
/**
 * Get priority display name
 */
export declare function getPriorityDisplayName(priority: AssignmentPriority, language?: "ms" | "en"): string;
/**
 * Get display mode display name
 */
export declare function getDisplayModeDisplayName(mode: DisplayMode, language?: "ms" | "en"): string;
/**
 * Create content assignment with defaults
 */
export declare function createContentAssignment(request: CreateContentAssignmentRequest, createdBy: string): DisplayContentAssignment;
/**
 * Validate assignment date range
 */
export declare function validateAssignmentDates(startDate: Date, endDate: Date): string[];
/**
 * Validate display layout
 */
export declare function validateDisplayLayout(layout: Partial<DisplayLayout>): string[];
/**
 * Validate content assignment
 */
export declare function validateContentAssignment(assignment: Partial<DisplayContentAssignment>): string[];
//# sourceMappingURL=display-content-assignment.d.ts.map