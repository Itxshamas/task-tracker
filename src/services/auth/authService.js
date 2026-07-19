import { supabase } from "../../config/supabase";

const authService = {
  async register(name, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) throw error;

    return data;
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    // Also remove any lingering supabase-related keys from localStorage
    try {
      Object.keys(window.localStorage || {}).forEach((key) => {
        if (/supabase|sb-|supabase.auth/i.test(key)) {
          try {
            window.localStorage.removeItem(key);
          } catch (e) {
            // ignore
          }
        }
      });
    } catch (e) {
      // ignore
    }
  },

  async forgotPassword(email) {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) throw error;
  },

  async updatePassword(password) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;

    return data;
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    return user;
  },

  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    return session;
  },
};

export default authService;
