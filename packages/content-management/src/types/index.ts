/**
 * Main types export for content management package
 */

// Content types
export * from "./content";

// Display settings types
export * from "./display-settings";

// Notification types
export * from "./notifications";

// Re-export commonly used types for convenience
export type {
  DisplayContent,
  CreateContentRequest,
  ApprovalRequest,
  ContentWithSubmitter,
} from "./content";

export type { DisplayConfiguration } from "./display-settings";

export type { NotificationEvent, ToastNotification } from "./notifications";

export type { ContentType, ContentStatus, SponsorshipTier } from "./content";

export type { TransitionType, PrayerTimePosition } from "./display-settings";
