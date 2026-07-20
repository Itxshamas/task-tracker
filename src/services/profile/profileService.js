import { supabase } from "../../config/supabase";

const BUCKET_NAME = "avatars";

const profileService = {
  /**
   * Get current user's profile
   */
  async getProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Update profile
   */
  async updateProfile(userId, values) {
    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (values.full_name !== undefined) {
      updates.full_name = values.full_name;
    }

    if (values.avatar_url !== undefined) {
      updates.avatar_url = values.avatar_url;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Update auth user metadata
   */
  async updateAuthUser(fullName) {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
      },
    });

    if (error) throw error;

    return data;
  },

  /**
   * Update password
   */
  async updatePassword(password) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;

    return data;
  },

  /**
   * Upload avatar to Supabase Storage
   */
  async uploadAvatar(userId, file) {
    if (!file) return null;

    const extension = file.name.split(".").pop();

    const fileName = `${userId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    await this.updateProfile(userId, {
      avatar_url: publicUrl,
    });

    return publicUrl;
  },
};

export default profileService;
