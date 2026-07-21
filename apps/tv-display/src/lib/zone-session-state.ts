export interface ZoneSessionState {
  locale: "ms" | "en";
  zone_code?: string;
  last_display_id?: string;
  comparison_context?: string;
  updated_at: string;
}

const ZONE_SESSION_KEY = "zone_session_state";

const isBrowser = () => typeof window !== "undefined";

export function readZoneSessionState(): ZoneSessionState | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(ZONE_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as ZoneSessionState;
    if (!parsed || (parsed.locale !== "ms" && parsed.locale !== "en")) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeZoneSessionState(
  payload: Omit<ZoneSessionState, "updated_at">,
): void {
  if (!isBrowser()) {
    return;
  }

  const next: ZoneSessionState = {
    ...payload,
    updated_at: new Date().toISOString(),
  };

  sessionStorage.setItem(ZONE_SESSION_KEY, JSON.stringify(next));
}

export function patchZoneSessionState(
  payload: Partial<Omit<ZoneSessionState, "updated_at">>,
): void {
  const current = readZoneSessionState();
  const zoneCode = payload.zone_code ?? current?.zone_code;
  const lastDisplayId = payload.last_display_id ?? current?.last_display_id;

  writeZoneSessionState({
    locale: payload.locale ?? current?.locale ?? "ms",
    comparison_context:
      payload.comparison_context ?? current?.comparison_context ?? "tiers",
    ...(zoneCode ? { zone_code: zoneCode } : {}),
    ...(lastDisplayId ? { last_display_id: lastDisplayId } : {}),
  });
}

export function clearZoneSessionState(): void {
  if (!isBrowser()) {
    return;
  }

  sessionStorage.removeItem(ZONE_SESSION_KEY);
}
