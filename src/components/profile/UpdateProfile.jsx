import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import profileService from "../../services/profile/profileService";

function UpdateProfile({ user, profile }) {
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || user?.user_metadata?.full_name || "");

    setAvatarUrl(profile?.avatar_url || "");
  }, [profile, user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Allow only images
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    try {
      setUploading(true);

      const publicUrl = await profileService.uploadAvatar(user.id, file);

      setAvatarUrl(publicUrl);

      toast.success("Avatar uploaded successfully.");
    } catch (error) {
      console.error(error);

      toast.error(error.message || "Failed to upload avatar.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    try {
      setLoading(true);

      await profileService.updateProfile(user.id, {
        full_name: fullName,
        avatar_url: avatarUrl,
      });

      await profileService.updateAuthUser(fullName);

      toast.success("Profile updated successfully.");

      window.location.reload();
    } catch (error) {
      console.error(error);

      toast.error(error.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Update Profile</h2>

      <p className="mt-1 text-sm text-slate-500">
        Update your personal information.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Avatar Preview */}
        <div className="flex flex-col items-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-32 w-32 rounded-full border-4 border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-200 text-3xl font-bold text-slate-600">
              {fullName
                ? fullName
                    .split(" ")
                    .map((x) => x[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </div>
          )}

          <label className="mt-5 cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700">
            {uploading ? "Uploading..." : "Choose New Avatar"}

            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Full Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Full Name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Enter your full name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email Address
          </label>

          <input
            type="email"
            value={profile?.email || user?.email || ""}
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-500"
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default UpdateProfile;
