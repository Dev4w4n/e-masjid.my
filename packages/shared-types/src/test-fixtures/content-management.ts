/**
 * Content Management Test Fixtures
 *
 * Provides mock data synchronized with the display_content schema
 * and extended content_notifications table for comprehensive testing
 * of the approval workflow system.
 */

import type { Tables, TablesInsert, TablesUpdate, Enums } from "../database.js";

// Type aliases for cleaner code
export type DisplayContent = Tables<"display_content">;
export type DisplayContentInsert = TablesInsert<"display_content">;
export type DisplayContentUpdate = TablesUpdate<"display_content">;
export type ContentStatus = Enums<"content_status">;
export type ContentType = Enums<"content_type">;
export type SponsorshipTier = Enums<"sponsorship_tier">;

// Additional types for content management
export interface ContentNotification {
  id: string;
  user_id: string;
  content_id: string;
  masjid_id: string;
  notification_type:
    | "approval_needed"
    | "approved"
    | "rejected"
    | "resubmitted";
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface ContentManagementCreateRequest {
  title: string;
  description?: string;
  type: ContentType;
  url: string;
  thumbnail_url?: string;
  duration?: number;
  start_date?: string;
  end_date?: string;
  masjid_id: string;
  display_id?: string | null;
}

export interface ApprovalRequest {
  approver_id: string;
  notes?: string;
}

export interface RejectionRequest {
  rejector_id: string;
  reason: string;
}

export interface DisplaySettings {
  masjid_id: string;
  carousel_interval: number;
  max_content_items: number;
  content_transition_type: string;
  auto_refresh_interval: number;
  show_sponsorship_amounts: boolean;
  prayer_time_position: Enums<"prayer_time_position">;
  is_active: boolean;
}

// Fixed UUIDs for contract testing - these MUST match the database seed data
export const FIXED_IDS = {
  // Contract test display ID (fixed in setup-supabase.sh)
  CONTRACT_TEST_DISPLAY: "550e8400-e29b-41d4-a716-446655440000",

  // Test user IDs (will be replaced with actual IDs from test environment)
  users: {
    admin: "00000000-0000-0000-0000-000000000002",
    regularUser: "00000000-0000-0000-0000-000000000003",
    adminPutrajaya: "00000000-0000-0000-0000-000000000004",
    superAdmin: "00000000-0000-0000-0000-000000000001",
  },

  // Test masjid IDs
  masjids: {
    masjidKlcc: "00000000-0000-0000-0000-000000000100",
    masjidPutrajaya: "00000000-0000-0000-0000-000000000101",
  },

  // Test content IDs matching MOCK_CONTENT_BASE
  content: {
    pendingImage: "550e8400-e29b-41d4-a716-446655440002", // Will use PENDING_VIDEO
    pendingYoutube: "550e8400-e29b-41d4-a716-446655440002", // PENDING_VIDEO
    approvedYoutube: "550e8400-e29b-41d4-a716-446655440001", // ACTIVE_IMAGE
    rejectedImage: "550e8400-e29b-41d4-a716-446655440003", // REJECTED_ANNOUNCEMENT
  },

  // Legacy IDs for backward compatibility
  TEST_SUPER_ADMIN: "00000000-0000-0000-0000-000000000001",
  TEST_MASJID_ADMIN: "00000000-0000-0000-0000-000000000002",
  TEST_USER: "00000000-0000-0000-0000-000000000003",
  TEST_MASJID: "00000000-0000-0000-0000-000000000100",
} as const;

// Base mock content for different scenarios
export const MOCK_CONTENT_BASE = {
  // Active content (already approved)
  ACTIVE_IMAGE: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Community Iftar Event",
    description: "Join us for our monthly community iftar gathering",
    type: "image" as ContentType,
    url: "https://example.com/test-images/iftar-event.jpg",
    thumbnail_url: "https://example.com/test-images/iftar-event-thumb.jpg",
    duration: 15,
    status: "active" as ContentStatus,
    masjid_id: FIXED_IDS.masjids.masjidKlcc,
    display_id: null, // Available for all displays
    submitted_by: FIXED_IDS.users.admin,
    approved_by: FIXED_IDS.users.admin,
    start_date: "2025-09-24",
    end_date: "2025-10-24",
    sponsorship_amount: 0,
    sponsorship_tier: null,
    file_size: 2048000, // 2MB
    file_type: "image/jpeg",
    submitted_at: "2025-09-23T10:00:00.000Z",
    approved_at: "2025-09-23T14:30:00.000Z",
    created_at: "2025-09-23T10:00:00.000Z",
    updated_at: "2025-09-23T14:30:00.000Z",
  },

  // Pending content awaiting approval
  PENDING_VIDEO: {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Islamic Lecture Series",
    description: "Weekly Islamic lectures by renowned scholars",
    type: "youtube_video" as ContentType,
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail_url: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    duration: 25,
    status: "pending" as ContentStatus,
    masjid_id: FIXED_IDS.masjids.masjidKlcc,
    display_id: FIXED_IDS.CONTRACT_TEST_DISPLAY,
    submitted_by: FIXED_IDS.users.regularUser,
    approved_by: null,
    start_date: "2025-09-25",
    end_date: "2025-10-25",
    sponsorship_amount: 50.0,
    sponsorship_tier: "silver" as SponsorshipTier,
    file_size: null, // YouTube video
    file_type: null,
    submitted_at: "2025-09-24T08:15:00.000Z",
    approved_at: null,
    created_at: "2025-09-24T08:15:00.000Z",
    updated_at: "2025-09-24T08:15:00.000Z",
  },

  // Rejected content for testing resubmission flow
  REJECTED_ANNOUNCEMENT: {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Rejected Content Test",
    description: "This content was rejected for testing purposes",
    type: "text_announcement" as ContentType,
    url: "data:text/plain;base64,VGVzdCBjb250ZW50IGZvciByZWplY3Rpb24=", // "Test content for rejection"
    thumbnail_url: null,
    duration: 10,
    status: "rejected" as ContentStatus,
    masjid_id: FIXED_IDS.masjids.masjidKlcc,
    display_id: null,
    submitted_by: FIXED_IDS.users.regularUser,
    approved_by: FIXED_IDS.users.admin,
    start_date: "2025-09-24",
    end_date: "2025-09-29",
    sponsorship_amount: 0,
    sponsorship_tier: null,
    rejection_reason:
      "Content quality is below standards. Please revise and resubmit.",
    file_size: 256, // Small text content
    file_type: "text/plain",
    submitted_at: "2025-09-23T16:00:00.000Z",
    approved_at: "2025-09-24T09:00:00.000Z",
    created_at: "2025-09-23T16:00:00.000Z",
    updated_at: "2025-09-24T09:00:00.000Z",
  },

  // Expired content for testing cleanup
  EXPIRED_EVENT: {
    id: "550e8400-e29b-41d4-a716-446655440004",
    title: "Past Event Notice",
    description: "This event has already concluded",
    type: "event_poster" as ContentType,
    url: "https://example.com/test-images/past-event.jpg",
    thumbnail_url: "https://example.com/test-images/past-event-thumb.jpg",
    duration: 12,
    status: "expired" as ContentStatus,
    masjid_id: FIXED_IDS.masjids.masjidKlcc,
    display_id: null,
    submitted_by: FIXED_IDS.users.admin,
    approved_by: FIXED_IDS.users.admin,
    start_date: "2025-09-14",
    end_date: "2025-09-21", // Expired
    sponsorship_amount: 25.0,
    sponsorship_tier: "bronze" as SponsorshipTier,
    file_size: 1536000, // 1.5MB
    file_type: "image/png",
    submitted_at: "2025-09-13T12:00:00.000Z",
    approved_at: "2025-09-13T15:00:00.000Z",
    created_at: "2025-09-13T12:00:00.000Z",
    updated_at: "2025-09-21T23:59:59.000Z", // Updated when expired
  },
} as const;

// Content creation requests for testing API endpoints
export const CREATE_CONTENT_REQUESTS = {
  VALID_IMAGE: {
    title: "New Community Event",
    description: "Upcoming community gathering this weekend",
    type: "image" as ContentType,
    url: "https://example.com/test-images/community-event.jpg",
    thumbnail_url: "https://example.com/test-images/community-event-thumb.jpg",
    duration: 20,
    masjid_id: FIXED_IDS.masjids.masjidKlcc,
    display_id: null,
  },

  VALID_YOUTUBE: {
    title: "Quran Recitation",
    description: "Beautiful Quran recitation by Qari Ahmad",
    type: "youtube_video" as ContentType,
    url: "https://www.youtube.com/watch?v=abc123",
    duration: 30,
    masjid_id: FIXED_IDS.masjids.masjidKlcc,
    display_id: FIXED_IDS.CONTRACT_TEST_DISPLAY,
  },

  INVALID_MISSING_TITLE: {
    description: "Content without title for validation testing",
    type: "image" as ContentType,
    url: "https://example.com/test-images/invalid.jpg",
    masjid_id: FIXED_IDS.masjids.masjidKlcc,
  },

  INVALID_YOUTUBE_URL: {
    title: "Invalid YouTube Content",
    type: "youtube_video" as ContentType,
    url: "https://invalid-youtube-url.com/watch?v=invalid",
    masjid_id: FIXED_IDS.masjids.masjidKlcc,
  },

  // Backwards compatibility aliases for tests
  image: {
    title: "New Community Event",
    description: "Upcoming community gathering this weekend",
    type: "image" as ContentType,
    url: "https://example.com/test-images/community-event.jpg",
    thumbnail_url: "https://example.com/test-images/community-event-thumb.jpg",
    duration: 20,
    masjid_id: FIXED_IDS.masjids.masjidKlcc,
    display_id: null,
  },

  youtube: {
    title: "Quran Recitation",
    description: "Beautiful Quran recitation by Qari Ahmad",
    type: "youtube_video" as ContentType,
    url: "https://www.youtube.com/watch?v=abc123",
    duration: 30,
    masjid_id: FIXED_IDS.masjids.masjidKlcc,
    display_id: FIXED_IDS.CONTRACT_TEST_DISPLAY,
  },
} as const;

// Approval and rejection requests
export const APPROVAL_REQUESTS = {
  APPROVE_WITH_NOTES: {
    content_id: MOCK_CONTENT_BASE.PENDING_VIDEO.id,
    notes: "Great content! Approved for immediate display.",
  },

  APPROVE_WITHOUT_NOTES: {
    content_id: MOCK_CONTENT_BASE.PENDING_VIDEO.id,
  },

  REJECT_WITH_REASON: {
    content_id: MOCK_CONTENT_BASE.PENDING_VIDEO.id,
    reason:
      "Video quality is too low. Please upload higher resolution version.",
  },
} as const;

// Mock approval requests for testing
export const MOCK_APPROVAL_REQUESTS = {
  withNotes: {
    approver_id: FIXED_IDS.users.admin,
    notes: "Great content! Approved for immediate display.",
  },

  withoutNotes: {
    approver_id: FIXED_IDS.users.admin,
  },
} as const;

// Mock rejection requests for testing
export const MOCK_REJECTION_REQUESTS = {
  inappropriateContent: {
    rejector_id: FIXED_IDS.users.admin,
    reason: "Content does not meet community guidelines.",
  },

  poorQuality: {
    rejector_id: FIXED_IDS.users.admin,
    reason:
      "Video quality is too low. Please upload higher resolution version.",
  },

  incorrectFormat: {
    rejector_id: FIXED_IDS.users.admin,
    reason: "Incorrect file format. Please use supported formats only.",
  },
} as const;

// Notification fixtures
export const MOCK_NOTIFICATIONS = {
  APPROVAL_NEEDED: {
    id: "550e8400-e29b-41d4-a716-446655440101",
    user_id: FIXED_IDS.users.admin,
    content_id: MOCK_CONTENT_BASE.PENDING_VIDEO.id,
    masjid_id: FIXED_IDS.masjids.masjidKlcc,
    notification_type: "approval_needed" as const,
    title: "New Content Awaiting Approval",
    message:
      'New content "Islamic Lecture Series" has been submitted and requires your approval.',
    is_read: false,
    read_at: null,
    created_at: "2025-09-24T08:15:00.000Z",
  },

  CONTENT_APPROVED: {
    id: "550e8400-e29b-41d4-a716-446655440102",
    user_id: FIXED_IDS.users.regularUser,
    content_id: MOCK_CONTENT_BASE.ACTIVE_IMAGE.id,
    masjid_id: FIXED_IDS.masjids.masjidKlcc,
    notification_type: "approved" as const,
    title: "Content Approved",
    message:
      'Your content "Community Iftar Event" has been approved and is now live.',
    is_read: true,
    read_at: "2025-09-23T16:00:00.000Z",
    created_at: "2025-09-23T14:30:00.000Z",
  },

  CONTENT_REJECTED: {
    id: "550e8400-e29b-41d4-a716-446655440103",
    user_id: FIXED_IDS.users.regularUser,
    content_id: MOCK_CONTENT_BASE.REJECTED_ANNOUNCEMENT.id,
    masjid_id: FIXED_IDS.masjids.masjidKlcc,
    notification_type: "rejected" as const,
    title: "Content Rejected",
    message:
      'Your content "Rejected Content Test" was rejected. Reason: Content quality is below standards. Please revise and resubmit.',
    is_read: false,
    read_at: null,
    created_at: "2025-09-24T09:00:00.000Z",
  },
} as const;

// Display settings fixtures
export const MOCK_DISPLAY_SETTINGS = {
  DEFAULT_SETTINGS: {
    masjid_id: FIXED_IDS.masjids.masjidKlcc,
    carousel_interval: 10,
    max_content_items: 20,
    content_transition_type: "fade",
    auto_refresh_interval: 5,
    show_sponsorship_amounts: false,
    prayer_time_position: "top" as Enums<"prayer_time_position">,
    is_active: true,
  },

  CUSTOM_SETTINGS: {
    masjid_id: FIXED_IDS.masjids.masjidKlcc,
    carousel_interval: 15,
    max_content_items: 30,
    content_transition_type: "slide",
    auto_refresh_interval: 3,
    show_sponsorship_amounts: true,
    prayer_time_position: "bottom" as Enums<"prayer_time_position">,
    is_active: true,
  },
} as const;

// Utility functions for generating dynamic test data

/**
 * Generates a display content fixture with overrides
 */
export function createDisplayContent(
  base: keyof typeof MOCK_CONTENT_BASE,
  overrides: Partial<DisplayContent> = {}
): DisplayContent {
  return {
    ...MOCK_CONTENT_BASE[base],
    ...overrides,
    // Ensure required fields are not null when overriding
    id: overrides.id || MOCK_CONTENT_BASE[base].id,
    title: overrides.title || MOCK_CONTENT_BASE[base].title,
    type: overrides.type || MOCK_CONTENT_BASE[base].type,
    url: overrides.url || MOCK_CONTENT_BASE[base].url,
    masjid_id: overrides.masjid_id || MOCK_CONTENT_BASE[base].masjid_id,
    submitted_by:
      overrides.submitted_by || MOCK_CONTENT_BASE[base].submitted_by,
    status: overrides.status || MOCK_CONTENT_BASE[base].status,
    duration: overrides.duration || MOCK_CONTENT_BASE[base].duration,
    start_date: overrides.start_date || MOCK_CONTENT_BASE[base].start_date,
    end_date: overrides.end_date || MOCK_CONTENT_BASE[base].end_date,
    sponsorship_amount:
      overrides.sponsorship_amount ??
      MOCK_CONTENT_BASE[base].sponsorship_amount,
  } as DisplayContent;
}

/**
 * Creates a content creation request with overrides
 */
export function createContentRequest(
  base: keyof typeof CREATE_CONTENT_REQUESTS,
  overrides: Partial<ContentManagementCreateRequest> = {}
): ContentManagementCreateRequest {
  return {
    ...CREATE_CONTENT_REQUESTS[base],
    ...overrides,
  } as ContentManagementCreateRequest;
}

/**
 * Generates a notification fixture with overrides
 */
export function createNotification(
  base: keyof typeof MOCK_NOTIFICATIONS,
  overrides: Partial<ContentNotification> = {}
): ContentNotification {
  return {
    ...MOCK_NOTIFICATIONS[base],
    ...overrides,
  };
}

/**
 * Creates an array of content items for list testing
 */
export function createContentList(count: number = 5): DisplayContent[] {
  const bases = Object.keys(MOCK_CONTENT_BASE) as Array<
    keyof typeof MOCK_CONTENT_BASE
  >;

  if (bases.length === 0) {
    throw new Error("MOCK_CONTENT_BASE must have at least one entry");
  }

  return Array.from({ length: count }, (_, i) => {
    const base = bases[i % bases.length]!; // Non-null assertion since we know bases has length > 0
    return createDisplayContent(base, {
      id: `550e8400-e29b-41d4-a716-44665544${String(i).padStart(4, "0")}`,
      title: `${MOCK_CONTENT_BASE[base].title} ${i + 1}`,
      submitted_at: new Date(Date.now() - i * 86400000).toISOString(), // Stagger by days
    });
  });
}

/**
 * Creates test data for pending approvals
 */
export function createPendingApprovals(count: number = 3): DisplayContent[] {
  return Array.from({ length: count }, (_, i) => {
    return createDisplayContent("PENDING_VIDEO", {
      id: `550e8400-e29b-41d4-a716-44665555${String(i).padStart(4, "0")}`,
      title: `Pending Content ${i + 1}`,
      description: `Content item ${i + 1} waiting for approval`,
      submitted_at: new Date(Date.now() - i * 3600000).toISOString(), // Stagger by hours
    });
  });
}

/**
 * Global mock data state for testing
 */
let mockDataState: {
  contents: DisplayContent[];
  notifications: ContentNotification[];
  settings: DisplaySettings[];
  initialized: boolean;
} = {
  contents: [],
  notifications: [],
  settings: [],
  initialized: false,
};

/**
 * Resets all mock data to initial state for consistent test runs
 */
export function resetMockData(): void {
  // Reset content data
  mockDataState.contents = [
    createDisplayContent("ACTIVE_IMAGE"),
    createDisplayContent("PENDING_VIDEO"),
    createDisplayContent("REJECTED_ANNOUNCEMENT"),
    createDisplayContent("EXPIRED_EVENT"),
  ];

  // Reset notification data
  mockDataState.notifications = [
    createNotification("APPROVAL_NEEDED"),
    createNotification("CONTENT_APPROVED"),
    createNotification("CONTENT_REJECTED"),
  ];

  // Reset display settings
  mockDataState.settings = [{ ...MOCK_DISPLAY_SETTINGS.DEFAULT_SETTINGS }];

  mockDataState.initialized = true;
}

/**
 * Gets current mock data state for testing
 */
export function getMockDataState() {
  if (!mockDataState.initialized) {
    resetMockData();
  }
  return mockDataState;
}

// Export all fixtures for easy importing
export const ContentManagementFixtures = {
  FIXED_IDS,
  MOCK_CONTENT_BASE,
  CREATE_CONTENT_REQUESTS,
  APPROVAL_REQUESTS,
  MOCK_APPROVAL_REQUESTS,
  MOCK_REJECTION_REQUESTS,
  MOCK_NOTIFICATIONS,
  MOCK_DISPLAY_SETTINGS,

  // Utility functions
  createDisplayContent,
  createContentRequest,
  createNotification,
  createContentList,
  createPendingApprovals,
  resetMockData,
  getMockDataState,
} as const;

export default ContentManagementFixtures;
