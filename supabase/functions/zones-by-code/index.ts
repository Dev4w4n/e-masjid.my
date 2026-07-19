import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ZONE_CODE_REGEX = /^[A-Z]{3}\d{2}$/;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: "Supabase environment is not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const url = new URL(req.url);
    const zoneCode = (url.searchParams.get("zone_code") ?? "").toUpperCase();

    if (!ZONE_CODE_REGEX.test(zoneCode)) {
      return new Response(
        JSON.stringify({ error: `Invalid zone_code format: ${zoneCode}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") ?? "",
        },
      },
    });

    const { data: masjids, error } = await supabase
      .from("masjids")
      .select("id, name, display_id")
      .eq("zone_code", zoneCode)
      .eq("is_auto_populated", true)
      .eq("tier", "asas")
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const primary = masjids?.[0];
    if (!primary?.display_id) {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    return new Response(
      JSON.stringify({
        zone_code: zoneCode,
        mosques: masjids,
        primary_display_id: primary.display_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
