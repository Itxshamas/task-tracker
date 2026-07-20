import DashboardLayout from "../../components/layout/DashboardLayout";
import ProfileCard from "../../components/profile/ProfileCard";
import UpdateProfile from "../../components/profile/UpdateProfile";
import ChangePassword from "../../components/profile/ChangePassword";

import useAuth from "../../hooks/useAuth";

function Profile() {
  const { user, profile } = useAuth();

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-800">
              User not found
            </h2>

            <p className="mt-2 text-slate-500">Please login again.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>

          <p className="mt-2 text-slate-500">
            View and manage your account information.
          </p>
        </div>

        {/* Top Card */}
        <ProfileCard user={user} profile={profile} />

        {/* Bottom Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <UpdateProfile user={user} profile={profile} />

          <ChangePassword />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;
