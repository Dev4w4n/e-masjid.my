import type { LandingAnalyticsEvent } from "@masjid-suite/shared-types";

function createIdempotencyKey(event: LandingAnalyticsEvent): string {
  const seed = `${event.event_name}:${event.session_id}:${event.event_time}`;
  return btoa(seed).replace(/=/g, "");
}

export async function sendLandingAnalyticsEvent(
  event: LandingAnalyticsEvent,
): Promise<void> {
  const idempotencyKey = createIdempotencyKey(event);

  await fetch("/functions/v1/landing-analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-idempotency-key": idempotencyKey,
    },
    body: JSON.stringify({
      ...event,
      idempotency_key: idempotencyKey,
    }),
  });
}
