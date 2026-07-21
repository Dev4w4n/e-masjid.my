import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-idempotency-key",
};

const VALID_EVENTS = new Set([
  "landing_cta_click",
  "zone_selection_success",
  "faq_item_expand",
  "upgrade_intent",
]);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type JsonObject = Record<string, unknown>;

const parseJsonBody = async (req: Request): Promise<JsonObject> => {
  try {
    const payload = (await req.json()) as JsonObject;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("Request body must be a JSON object");
    }
    return payload;
  } catch (_error) {
    throw new Error("Invalid JSON body");
  }
};

const getRequiredString = (payload: JsonObject, key: string): string => {
  const value = payload[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing or invalid field: ${key}`);
  }
  return value.trim();
};

const getOptionalString = (payload: JsonObject, key: string): string | null => {
  const value = payload[key];
  if (value == null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error(`Invalid field type for ${key}`);
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const validateIsoDateTime = (value: string, key: string): void => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || !value.includes("T")) {
    throw new Error(`Invalid ISO-8601 timestamp for ${key}`);
  }
};

const validateEventSpecificFields = (
  eventName: string,
  payload: JsonObject,
): JsonObject => {
  switch (eventName) {
    case "landing_cta_click":
      return {
        cta_id: getRequiredString(payload, "cta_id"),
        cta_label: getRequiredString(payload, "cta_label"),
        tier_context: getRequiredString(payload, "tier_context"),
      };
    case "zone_selection_success":
      return {
        selected_zone_code: getRequiredString(payload, "selected_zone_code"),
        target_display_id: getRequiredString(payload, "target_display_id"),
      };
    case "faq_item_expand":
      return {
        faq_id: getRequiredString(payload, "faq_id"),
      };
    case "upgrade_intent":
      return {
        from_tier: getRequiredString(payload, "from_tier"),
        target_tier: getRequiredString(payload, "target_tier"),
      };
    default:
      throw new Error(`Unsupported event_name: ${eventName}`);
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceRole) {
      return new Response(
        JSON.stringify({ error: "Supabase environment is not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const payload = await parseJsonBody(req);

    const eventName = getRequiredString(payload, "event_name");
    if (!VALID_EVENTS.has(eventName)) {
      throw new Error(`Invalid event_name: ${eventName}`);
    }

    const eventTime = getRequiredString(payload, "event_time");
    validateIsoDateTime(eventTime, "event_time");

    const sessionId = getRequiredString(payload, "session_id");
    const actorId = getRequiredString(payload, "actor_id");
    const pagePath = getRequiredString(payload, "page_path");
    const locale = getRequiredString(payload, "locale");

    const idempotencyKey =
      req.headers.get("x-idempotency-key") ||
      getOptionalString(payload, "idempotency_key") ||
      crypto.randomUUID();

    const metadata = validateEventSpecificFields(eventName, payload);

    const supabase = createClient(supabaseUrl, supabaseServiceRole, {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") ?? "",
        },
      },
    });

    const { data: existing, error: existingError } = await supabase
      .from("analytics_events")
      .select("event_id")
      .eq("idempotency_key", idempotencyKey)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing?.event_id && UUID_REGEX.test(existing.event_id)) {
      return new Response(
        JSON.stringify({
          accepted: true,
          deduplicated: true,
          event_id: existing.event_id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data, error } = await supabase
      .from("analytics_events")
      .insert({
        event_name: eventName,
        event_time: eventTime,
        session_id: sessionId,
        actor_id: actorId,
        page_path: pagePath,
        locale,
        idempotency_key: idempotencyKey,
        metadata,
      })
      .select("event_id")
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        accepted: true,
        deduplicated: false,
        event_id: data.event_id,
      }),
      {
        status: 202,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
