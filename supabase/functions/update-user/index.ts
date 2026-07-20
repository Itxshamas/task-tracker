import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    console.log("========== UPDATE USER ==========");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });

    // Verify logged in admin
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      throw new Error("Missing Authorization header.");
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user: caller },
      error: authError,
    } = await admin.auth.getUser(token);

    if (authError) {
      throw authError;
    }

    if (!caller) {
      throw new Error("Unable to verify logged in user.");
    }

    console.log("Caller:", caller.id);

    const { data: callerProfile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    if (!callerProfile || callerProfile.role !== "admin") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Only admins can update users.",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Request Body
    const body = await req.json();

    console.log("Body:", body);

    const {
      id,
      full_name,
      email,
      role,
    }: {
      id: string;
      full_name?: string;
      email?: string;
      role?: string;
    } = body;

    if (!id) {
      throw new Error("User ID is required.");
    }

    // Build profile update
    const profileUpdates: Record<string, any> = {};

    if (full_name !== undefined) profileUpdates.full_name = full_name;
    if (email !== undefined) profileUpdates.email = email;
    if (role !== undefined) profileUpdates.role = role;

    console.log("Updating profile...");

    const { data: updatedProfile, error: updateProfileError } = await admin
      .from("profiles")
      .update(profileUpdates)
      .eq("id", id)
      .select()
      .single();

    if (updateProfileError) {
      throw updateProfileError;
    }

    // Update Auth Email
    if (email) {
      console.log("Updating auth email...");

      const { error: authUpdateError } = await admin.auth.admin.updateUserById(
        id,
        {
          email,
        },
      );

      if (authUpdateError) {
        throw authUpdateError;
      }
    }

    console.log("User updated successfully.");

    return new Response(
      JSON.stringify({
        success: true,
        profile: updatedProfile,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err: any) {
    console.error("UPDATE USER ERROR:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err.message ?? String(err),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
