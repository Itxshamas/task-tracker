import { supabase } from "../config/supabase";

const PROFILES_TABLE = "profiles";

async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  if (!session || !session.user) {
    throw new Error("Unable to retrieve session. Please sign in again.");
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

  if (profile?.role !== "admin") {
    throw new Error("Only administrators can create, update, or delete users");
  }

  return profile;
}

async function invokeFunction(functionName, payload = {}) {
  const session = await getSession();
  await assertAdmin(session);

  const { data, error } = await supabase.functions.invoke(functionName, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (error) {
    const message =
      typeof error.message === "string"
        ? error.message
        : "An error occurred when calling the Edge Function";
    throw new Error(message);
  }

  return data;
}

const userService = {
  async getUsers(excludeId) {
    const query = supabase.from(PROFILES_TABLE).select("*");

    if (excludeId) query.neq("id", excludeId);

    const { data, error } = await query;
    if (error) throw error;

    return data ?? [];
  },

  async createUserAsAdmin({ full_name, email, password }) {
    if (!full_name || !email || !password) {
      throw new Error("Full name, email, and password are required");
    }

    const data = await invokeFunction("create-user", {
      full_name,
      email,
      password,
    });

    return data;
  },

  async updateUserRole(id, updates = {}) {
    if (!id) {
      throw new Error("User id is required");
    }

    const data = await invokeFunction("update-user", {
      id,
      ...updates,
    });

    return data;
  },

  async deleteUser(id) {
    if (!id) {
      throw new Error("User id is required");
    }

    const data = await invokeFunction("delete-user", { id });
    return data;
  },
};

export default userService;
