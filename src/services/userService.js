import { supabase } from "../config/supabase";

const PROFILES_TABLE = "profiles";

async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session) {
    throw new Error("Your session has expired. Please login again.");
  }

  return session;
}

async function assertAdmin(session) {
  const { data: profile, error } = await supabase
    .from(PROFILES_TABLE)
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (error) {
    throw error;
  }

  if (!profile || profile.role !== "admin") {
    throw new Error("Only administrators can perform this action.");
  }

  return profile;
}

async function invokeFunction(functionName, payload = {}) {
  const session = await getSession();

  await assertAdmin(session);

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    console.error(`Edge Function (${functionName}) Error:`, error);

    throw new Error(
      error.message ||
        error.context ||
        `Failed to execute Edge Function: ${functionName}`,
    );
  }

  return data;
}

const userService = {
  async getUsers(excludeId = null) {
    let query = supabase.from(PROFILES_TABLE).select("*");

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      throw error;
    }

    return data ?? [];
  },

  async createUserAsAdmin({ full_name, email, password }) {
    if (!full_name || !email || !password) {
      throw new Error("Full name, email and password are required.");
    }

    return await invokeFunction("create-user", {
      full_name,
      email,
      password,
    });
  },

  async updateUserRole(id, updates = {}) {
    if (!id) {
      throw new Error("User id is required.");
    }

    return await invokeFunction("update-user", {
      id,
      ...updates,
    });
  },

  async deleteUser(id) {
    if (!id) {
      throw new Error("User id is required.");
    }

    return await invokeFunction("delete-user", {
      id,
    });
  },
};

export default userService;
