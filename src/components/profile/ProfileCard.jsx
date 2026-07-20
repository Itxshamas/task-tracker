import Avatar from "../common/Avatar";
import { FiCalendar, FiMail, FiShield } from "react-icons/fi";

function ProfileCard({ user, profile }) {
  const fullName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const email = profile?.email || user?.email || "-";

  const role = profile?.role || "User";

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString()
    : "-";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center gap-6 md:flex-row">
        {/* Avatar */}
        <Avatar
          src={profile?.avatar_url}
          name={fullName}
          className="h-24 w-24"
        />

        <div className="flex-1">
          <h2 className="text-3xl font-bold text-slate-900">{fullName}</h2>

          <p className="mt-1 text-slate-500">Manage your account information</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
              <FiMail className="h-5 w-5 text-blue-600" />

              <div>
                <p className="text-xs text-slate-400">Email</p>

                <p className="text-sm font-medium text-slate-900">{email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
              <FiShield className="h-5 w-5 text-green-600" />

              <div>
                <p className="text-xs text-slate-400">Role</p>

                <p className="text-sm font-medium capitalize text-slate-900">
                  {role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 md:col-span-2">
              <FiCalendar className="h-5 w-5 text-violet-600" />

              <div>
                <p className="text-xs text-slate-400">Member Since</p>

                <p className="text-sm font-medium text-slate-900">
                  {joinedDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
