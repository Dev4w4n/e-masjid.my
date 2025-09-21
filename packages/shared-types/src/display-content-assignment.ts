/**
 * Display Content Assignment Model
 *
 * This module defines types and utilities for managing content assignments
 * to TV displays in the Masjid Digital Display system. It handles the
 * relationship between content, displays, and scheduling.
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Assignment status
 */
export type AssignmentStatus =
  | "active" // Currently assigned and displaying
  | "scheduled" // Scheduled for future display
  | "paused" // Temporarily paused
  | "expired" // Past end date
  | "cancelled" // Manually cancelled
  | "completed"; // Successfully completed

/**
 * Assignment priority levels
 */
export type AssignmentPriority =
  | "low" // 1-3
  | "normal" // 4-6
  | "high" // 7-8
  | "urgent" // 9
  | "critical"; // 10

/**
 * Content display modes
 */
export type DisplayMode =
  | "fullscreen" // Full screen content
  | "overlay" // Overlay on other content
  | "banner" // Banner/ticker display
  | "corner" // Corner display
  | "split" // Split screen with other content
  | "carousel"; // Part of content carousel

/**
 * Scheduling rules for content
 */
export interface SchedulingRules {
  // Time-based rules
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
  excludeHolidays?: boolean;

  // Prayer time integration
  avoidPrayerTimes?: boolean;
  showBeforePrayer?: boolean; // Show before prayer time
  showAfterPrayer?: boolean; // Show after prayer time
  prayerTimeOffset?: number; // Minutes before/after prayer

  // Frequency controls
  maxDisplaysPerHour?: number;
  minIntervalBetweenDisplays?: number; // Minutes

  // Special conditions
  requiresSponsorshipActive?: boolean;
  requiresInternetConnection?: boolean;
  weatherConditions?: string[]; // e.g., ['sunny', 'rainy']
}

/**
 * Content rotation settings
 */
export interface ContentRotation {
  enabled: boolean;
  duration: number; // seconds per display
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
    x: number; // Percentage from left (0-100)
    y: number; // Percentage from top (0-100)
    width: number; // Percentage of screen width (1-100)
    height: number; // Percentage of screen height (1-100)
  };
  zIndex: number; // Layer order (higher = on top)
  opacity: number; // 0-100
  borderRadius?: number; // px
  padding?: number; // px
  margin?: number; // px
  backgroundColor?: string; // hex color
  borderColor?: string; // hex color
  borderWidth?: number; // px
}

/**
 * Content targeting criteria
 */
export interface ContentTargeting {
  // Audience targeting
  languages?: string[]; // ISO language codes
  ageGroups?: string[]; // e.g., ['children', 'youth', 'adults', 'seniors']
  interests?: string[]; // Interest tags

  // Geographic targeting
  locations?: string[]; // Specific locations within masjid
  zones?: string[]; // Prayer zones or areas

  // Temporal targeting
  seasons?: string[]; // e.g., ['ramadan', 'hajj', 'winter']
  occasions?: string[]; // Special occasions

  // Context targeting
  eventTypes?: string[]; // During specific events
  weatherConditions?: string[]; // Weather-based display

  // Technical targeting
  displayCapabilities?: string[]; // Required display features
  minResolution?: string; // Minimum resolution needed
  requiresAudio?: boolean;
  requiresTouch?: boolean;
}

/**
 * Assignment analytics and tracking
 */
export interface AssignmentAnalytics {
  totalDisplayTime: number; // Total seconds displayed
  impressions: number; // Number of times shown
  uniqueViewers: number; // Estimated unique viewers
  engagementScore: number; // 0-100 engagement rating
  clickThroughRate: number; // If interactive content
  completionRate: number; // How often fully displayed
  averageViewDuration: number; // Average viewing time
  peakViewingTimes: string[]; // Hours with most views
  skipRate: number; // How often skipped manually
  errorCount: number; // Display errors encountered
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

  // Assignment Details
  title: string;
  description?: string;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  priorityScore: number; // 1-10 numerical priority

  // Scheduling
  startDate: Date;
  endDate: Date;
  timezone: string;
  schedulingRules: SchedulingRules;

  // Display Configuration
  layout: DisplayLayout;
  rotation: ContentRotation;
  targeting: ContentTargeting;

  // Sponsorship Integration
  sponsorshipId?: string;
  sponsorshipBoost: number; // Priority multiplier from sponsorship

  // Analytics
  analytics: AssignmentAnalytics;

  // Approval Workflow
  requiresApproval: boolean;
  approvalStatus?: "pending" | "approved" | "rejected";
  approvedAt?: Date;
  approvedBy?: string; // Admin user ID
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;

  // Metadata
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
  lastModifiedBy: string;

  // System fields
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

  // Optional configurations
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
export interface DisplayContentAssignmentWithRelations
  extends DisplayContentAssignment {
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
  duration: number; // seconds
  priorityScore: number;
  layout: DisplayLayout;
  sponsorshipBoost: number;
  estimatedViewers: number;
}

/**
 * Assignment error codes
 */
export type AssignmentErrorCode =
  | "ASSIGNMENT_NOT_FOUND"
  | "ASSIGNMENT_ALREADY_EXISTS"
  | "INVALID_MASJID_ID"
  | "INVALID_DISPLAY_ID"
  | "INVALID_CONTENT_ID"
  | "INVALID_DATE_RANGE"
  | "INVALID_PRIORITY"
  | "INVALID_LAYOUT"
  | "CONTENT_NOT_APPROVED"
  | "DISPLAY_NOT_AVAILABLE"
  | "SCHEDULING_CONFLICT"
  | "INSUFFICIENT_PERMISSIONS"
  | "SPONSORSHIP_REQUIRED"
  | "APPROVAL_REQUIRED"
  | "ALREADY_APPROVED"
  | "ALREADY_REJECTED"
  | "DISPLAY_CAPACITY_EXCEEDED"
  | "VALIDATION_ERROR";

// ============================================================================
// Constants and Validation
// ============================================================================

/**
 * Available assignment statuses
 */
export const ASSIGNMENT_STATUSES: readonly AssignmentStatus[] = [
  "active",
  "scheduled",
  "paused",
  "expired",
  "cancelled",
  "completed",
] as const;

/**
 * Available priority levels
 */
export const ASSIGNMENT_PRIORITIES: readonly AssignmentPriority[] = [
  "low",
  "normal",
  "high",
  "urgent",
  "critical",
] as const;

/**
 * Priority score mapping
 */
export const PRIORITY_SCORES = {
  low: 2,
  normal: 5,
  high: 7,
  urgent: 9,
  critical: 10,
} as const;

/**
 * Available display modes
 */
export const DISPLAY_MODES: readonly DisplayMode[] = [
  "fullscreen",
  "overlay",
  "banner",
  "corner",
  "split",
  "carousel",
] as const;

/**
 * Default scheduling rules
 */
export const DEFAULT_SCHEDULING_RULES: SchedulingRules = {
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
export const DEFAULT_CONTENT_ROTATION: ContentRotation = {
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
export const DEFAULT_DISPLAY_LAYOUT: DisplayLayout = {
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
    mode: "fullscreen" as DisplayMode,
    position: { x: 0, y: 0, width: 100, height: 100 },
    zIndex: 1,
    opacity: 100,
  },
  banner_top: {
    mode: "banner" as DisplayMode,
    position: { x: 0, y: 0, width: 100, height: 10 },
    zIndex: 10,
    opacity: 90,
  },
  banner_bottom: {
    mode: "banner" as DisplayMode,
    position: { x: 0, y: 90, width: 100, height: 10 },
    zIndex: 10,
    opacity: 90,
  },
  corner_top_right: {
    mode: "corner" as DisplayMode,
    position: { x: 75, y: 5, width: 20, height: 15 },
    zIndex: 5,
    opacity: 85,
  },
  overlay_center: {
    mode: "overlay" as DisplayMode,
    position: { x: 25, y: 25, width: 50, height: 50 },
    zIndex: 8,
    opacity: 95,
  },
} as const;

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
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a value is a valid assignment status
 */
export function isValidAssignmentStatus(
  value: unknown
): value is AssignmentStatus {
  return (
    typeof value === "string" &&
    ASSIGNMENT_STATUSES.includes(value as AssignmentStatus)
  );
}

/**
 * Check if a value is a valid assignment priority
 */
export function isValidAssignmentPriority(
  value: unknown
): value is AssignmentPriority {
  return (
    typeof value === "string" &&
    ASSIGNMENT_PRIORITIES.includes(value as AssignmentPriority)
  );
}

/**
 * Check if a value is a valid display mode
 */
export function isValidDisplayMode(value: unknown): value is DisplayMode {
  return (
    typeof value === "string" && DISPLAY_MODES.includes(value as DisplayMode)
  );
}

/**
 * Get priority score from priority level
 */
export function getPriorityScore(priority: AssignmentPriority): number {
  return PRIORITY_SCORES[priority];
}

/**
 * Get priority level from score
 */
export function getPriorityLevel(score: number): AssignmentPriority {
  if (score <= 3) return "low";
  if (score <= 6) return "normal";
  if (score <= 8) return "high";
  if (score === 9) return "urgent";
  return "critical";
}

/**
 * Type guard for DisplayContentAssignment
 */
export function isDisplayContentAssignment(
  value: unknown
): value is DisplayContentAssignment {
  if (!value || typeof value !== "object") return false;

  const assignment = value as any;
  return (
    typeof assignment.id === "string" &&
    typeof assignment.masjidId === "string" &&
    typeof assignment.displayId === "string" &&
    typeof assignment.contentId === "string" &&
    typeof assignment.title === "string" &&
    isValidAssignmentStatus(assignment.status) &&
    isValidAssignmentPriority(assignment.priority) &&
    assignment.startDate instanceof Date &&
    assignment.endDate instanceof Date
  );
}

/**
 * Type guard for CreateContentAssignmentRequest
 */
export function isCreateContentAssignmentRequest(
  value: unknown
): value is CreateContentAssignmentRequest {
  if (!value || typeof value !== "object") return false;

  const request = value as any;
  return (
    typeof request.masjidId === "string" &&
    typeof request.displayId === "string" &&
    typeof request.contentId === "string" &&
    typeof request.title === "string" &&
    request.title.length >= ASSIGNMENT_VALIDATION.TITLE.MIN_LENGTH &&
    request.title.length <= ASSIGNMENT_VALIDATION.TITLE.MAX_LENGTH &&
    isValidAssignmentPriority(request.priority) &&
    request.startDate instanceof Date &&
    request.endDate instanceof Date
  );
}

/**
 * Check if assignment is currently active
 */
export function isAssignmentActive(
  assignment: DisplayContentAssignment,
  currentDate: Date = new Date()
): boolean {
  return (
    assignment.status === "active" &&
    assignment.isActive &&
    currentDate >= assignment.startDate &&
    currentDate <= assignment.endDate
  );
}

/**
 * Check if assignment can be displayed now
 */
export function canDisplayAssignment(
  assignment: DisplayContentAssignment,
  currentDate: Date = new Date()
): boolean {
  if (!isAssignmentActive(assignment, currentDate)) return false;

  const rules = assignment.schedulingRules;
  const now = currentDate;

  // Check day of week
  if (rules.daysOfWeek && !rules.daysOfWeek.includes(now.getDay())) {
    return false;
  }

  // Check time range
  if (rules.startTime || rules.endTime) {
    const currentTime = now.toTimeString().substring(0, 5); // HH:mm
    if (rules.startTime && currentTime < rules.startTime) return false;
    if (rules.endTime && currentTime > rules.endTime) return false;
  }

  return true;
}

/**
 * Calculate effective priority score including sponsorship boost
 */
export function calculateEffectivePriority(
  assignment: DisplayContentAssignment
): number {
  const basePriority = assignment.priorityScore;
  const sponsorshipBoost = assignment.sponsorshipBoost || 1.0;
  const effectivePriority = basePriority * sponsorshipBoost;

  // Cap at maximum priority
  return Math.min(effectivePriority, ASSIGNMENT_VALIDATION.PRIORITY_SCORE.MAX);
}

/**
 * Get assignment status display name
 */
export function getAssignmentStatusDisplayName(
  status: AssignmentStatus,
  language: "ms" | "en" = "ms"
): string {
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
export function getPriorityDisplayName(
  priority: AssignmentPriority,
  language: "ms" | "en" = "ms"
): string {
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
export function getDisplayModeDisplayName(
  mode: DisplayMode,
  language: "ms" | "en" = "ms"
): string {
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
export function createContentAssignment(
  request: CreateContentAssignmentRequest,
  createdBy: string
): DisplayContentAssignment {
  const now = new Date();
  const assignmentId = `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const priorityScore = getPriorityScore(request.priority);

  const schedulingRules: SchedulingRules = {
    ...DEFAULT_SCHEDULING_RULES,
    ...request.schedulingRules,
  };

  const layout: DisplayLayout = {
    ...DEFAULT_DISPLAY_LAYOUT,
    ...request.layout,
  };

  const rotation: ContentRotation = {
    ...DEFAULT_CONTENT_ROTATION,
    ...request.rotation,
  };

  const targeting: ContentTargeting = {
    ...request.targeting,
  };

  const analytics: AssignmentAnalytics = {
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
    status: "scheduled" as AssignmentStatus,
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
  const optionalFields: Partial<DisplayContentAssignment> = {};

  if (request.description !== undefined) {
    optionalFields.description = request.description;
  }
  if (request.sponsorshipId !== undefined) {
    optionalFields.sponsorshipId = request.sponsorshipId;
  }

  return { ...baseAssignment, ...optionalFields } as DisplayContentAssignment;
}

/**
 * Validate assignment date range
 */
export function validateAssignmentDates(
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
export function validateDisplayLayout(
  layout: Partial<DisplayLayout>
): string[] {
  const errors: string[] = [];
  const validation = ASSIGNMENT_VALIDATION;

  if (layout.position) {
    const pos = layout.position;
    if (pos.x < validation.POSITION.MIN || pos.x > validation.POSITION.MAX) {
      errors.push(
        `X position must be between ${validation.POSITION.MIN} and ${validation.POSITION.MAX}`
      );
    }
    if (pos.y < validation.POSITION.MIN || pos.y > validation.POSITION.MAX) {
      errors.push(
        `Y position must be between ${validation.POSITION.MIN} and ${validation.POSITION.MAX}`
      );
    }
    if (pos.width <= 0 || pos.width > validation.POSITION.MAX) {
      errors.push(`Width must be between 1 and ${validation.POSITION.MAX}`);
    }
    if (pos.height <= 0 || pos.height > validation.POSITION.MAX) {
      errors.push(`Height must be between 1 and ${validation.POSITION.MAX}`);
    }
  }

  if (
    layout.opacity !== undefined &&
    (layout.opacity < validation.OPACITY.MIN ||
      layout.opacity > validation.OPACITY.MAX)
  ) {
    errors.push(
      `Opacity must be between ${validation.OPACITY.MIN} and ${validation.OPACITY.MAX}`
    );
  }

  if (
    layout.zIndex !== undefined &&
    (layout.zIndex < validation.Z_INDEX.MIN ||
      layout.zIndex > validation.Z_INDEX.MAX)
  ) {
    errors.push(
      `Z-index must be between ${validation.Z_INDEX.MIN} and ${validation.Z_INDEX.MAX}`
    );
  }

  return errors;
}

/**
 * Validate content assignment
 */
export function validateContentAssignment(
  assignment: Partial<DisplayContentAssignment>
): string[] {
  const errors: string[] = [];

  if (
    assignment.title &&
    (assignment.title.length < ASSIGNMENT_VALIDATION.TITLE.MIN_LENGTH ||
      assignment.title.length > ASSIGNMENT_VALIDATION.TITLE.MAX_LENGTH)
  ) {
    errors.push(
      `Title must be between ${ASSIGNMENT_VALIDATION.TITLE.MIN_LENGTH} and ${ASSIGNMENT_VALIDATION.TITLE.MAX_LENGTH} characters`
    );
  }

  if (
    assignment.description &&
    assignment.description.length > ASSIGNMENT_VALIDATION.DESCRIPTION.MAX_LENGTH
  ) {
    errors.push(
      `Description must not exceed ${ASSIGNMENT_VALIDATION.DESCRIPTION.MAX_LENGTH} characters`
    );
  }

  if (
    assignment.priorityScore !== undefined &&
    (assignment.priorityScore < ASSIGNMENT_VALIDATION.PRIORITY_SCORE.MIN ||
      assignment.priorityScore > ASSIGNMENT_VALIDATION.PRIORITY_SCORE.MAX)
  ) {
    errors.push(
      `Priority score must be between ${ASSIGNMENT_VALIDATION.PRIORITY_SCORE.MIN} and ${ASSIGNMENT_VALIDATION.PRIORITY_SCORE.MAX}`
    );
  }

  if (assignment.startDate && assignment.endDate) {
    errors.push(
      ...validateAssignmentDates(assignment.startDate, assignment.endDate)
    );
  }

  if (assignment.layout) {
    errors.push(...validateDisplayLayout(assignment.layout));
  }

  if (assignment.rotation?.duration !== undefined) {
    const duration = assignment.rotation.duration;
    if (
      duration < ASSIGNMENT_VALIDATION.DISPLAY_DURATION.MIN ||
      duration > ASSIGNMENT_VALIDATION.DISPLAY_DURATION.MAX
    ) {
      errors.push(
        `Display duration must be between ${ASSIGNMENT_VALIDATION.DISPLAY_DURATION.MIN} and ${ASSIGNMENT_VALIDATION.DISPLAY_DURATION.MAX} seconds`
      );
    }
  }

  return errors;
}
