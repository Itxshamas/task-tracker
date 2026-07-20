import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    console.log("===== CREATE USER FUNCTION START =====");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("SUPABASE_URL:", !!SUPABASE_URL);
    console.log("SERVICE_ROLE_KEY:", !!SERVICE_ROLE_KEY);

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error("Missing SUPABASE_URL or SERVICE_ROLE_KEY");
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const authHeader = req.headers.get("authorization");

    console.log("Authorization:", authHeader);

    if (!authHeader) {
      return jsonResponse(
        {
          success: false,
          error: "Authorization header missing.",
        },
        401,
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user: caller },
      error: authError,
    } = await admin.auth.getUser(token);

    console.log("Caller:", caller?.email);

    if (authError) {
      console.error(authError);
    }

    if (!caller) {
      return jsonResponse(
        {
          success: false,
          error: "Invalid access token.",
        },
        401,
      );
    }

    const { data: callerProfile, error: profileError } = await admin
      .from("profiles")
      .select("*")
      .eq("id", caller.id)
      .maybeSingle();

    console.log("Caller Profile:", callerProfile);

    if (profileError) {
      console.error(profileError);
      throw profileError;
    }

    if (!callerProfile) {
      throw new Error("Profile not found.");
    }

    if (callerProfile.role !== "admin") {
      return jsonResponse(
        {
          success: false,
          error: "Only admin can create users.",
        },
        403,
      );
    }

    //---------------------------------------
    // Parse body
    //---------------------------------------

    const body = await req.json();

    console.log(body);

    const { full_name, email, password, role = "user" } = body;

    if (!full_name || !email || !password) {
      return jsonResponse(
        {
          success: false,
          error: "full_name, email and password required.",
        },
        400,
      );
    }

    //---------------------------------------
    // Check existing user
    //---------------------------------------

    const { data: users, error: listError } =
      await admin.auth.admin.listUsers();

    if (listError) {
      console.error(listError);
      throw listError;
    }

    const exists = users.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );

    if (exists) {
      return jsonResponse(
        {
          success: false,
          error: "User already exists.",
        },
        409,
      );
    }

    //---------------------------------------
    // Create auth user
    //---------------------------------------

    console.log("Creating auth user...");

    const { data: newUser, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
        },
      });

    console.log("Created:", newUser);

    if (createError) {
      console.error(createError);
      throw createError;
    }

    //---------------------------------------
    // Wait for trigger
    //---------------------------------------
    console.log("Saving profile...");

    const profileData = {
      id: newUser.user.id,
      full_name,
      email,
      role,
    };

    console.log("Profile Data:", profileData);

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .upsert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error("Profile Error:", profileError);

      return jsonResponse(
        {
          success: false,
          step: "Saving Profile",
          error: profileError.message,
          details: profileError,
        },
        500,
      );
    }

    console.log("Profile Saved Successfully");

    return jsonResponse({
      success: true,
      user: newUser.user,
      profile,
    });} catch (err) {

  if (err instanceof Error) {
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
  } else {
    console.error(err);
  }

  return jsonResponse(
    {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    },
    500,
  );
} 

    console.log(updated);

    if (updateError) {
      console.error(updateError);
      throw updateError;
    }

    //---------------------------------------
    // Return profile
    //---------------------------------------

    const { data: profile, error: finalError } = await admin
      .from("profiles")
      .select("*")
      .eq("id", newUser.user.id)
      .maybeSingle();

    if (finalError) {
      console.error(finalError);
      throw finalError;
    }

    console.log("SUCCESS");

    return jsonResponse({
      success: true,
      user: newUser.user,
      profile,
    });
  } catch (err) {
    console.error("==============");
    console.error(err);
    console.error(err?.stack);
    console.error("==============");

    return jsonResponse(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      500,
    );
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
