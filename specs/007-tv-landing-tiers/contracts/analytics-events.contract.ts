/**
 * Contract: Landing analytics events for measurable outcomes
 * Supports SC-010 (support-ticket reduction analysis) and SC-011 (CTA CTR)
 *
 * FR-022 required event names:
 * - landing_cta_click
 * - zone_selection_success
 * - faq_item_expand
 * - upgrade_intent
 */

export type LandingEventName =
  | "landing_cta_click"
  | "zone_selection_success"
  | "faq_item_expand"
  | "upgrade_intent";

export type TierId = "asas" | "maju" | "gemilang" | "istimewa";

export interface BaseLandingAnalyticsEvent {
  event_name: LandingEventName;
  event_time: string; // UTC ISO-8601 timestamp
  session_id: string;
  actor_id: string; // anonymous or authenticated id
  page_path: string;
  locale: "ms" | "en";
}

export interface LandingCtaClickEvent extends BaseLandingAnalyticsEvent {
  event_name: "landing_cta_click";
  cta_id: string;
  cta_label: string;
  tier_context: TierId;
}

export interface ZoneSelectionSuccessEvent extends BaseLandingAnalyticsEvent {
  event_name: "zone_selection_success";
  selected_zone_code: string;
  target_display_id: string;
}

export interface FaqItemExpandEvent extends BaseLandingAnalyticsEvent {
  event_name: "faq_item_expand";
  faq_id: string;
}

export interface UpgradeIntentEvent extends BaseLandingAnalyticsEvent {
  event_name: "upgrade_intent";
  from_tier: TierId;
  target_tier: TierId;
}

export type LandingAnalyticsEvent =
  | LandingCtaClickEvent
  | ZoneSelectionSuccessEvent
  | FaqItemExpandEvent
  | UpgradeIntentEvent;

export interface CtaCtrMetrics {
  cta_id: string;
  impressions: number;
  clicks: number;
  click_through_rate: number;
}

export interface ZoneSelectionMetrics {
  attempts: number;
  successes: number;
  success_rate: number;
}
