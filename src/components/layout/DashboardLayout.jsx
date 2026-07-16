import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiChevronDown,
  FiLayout,
  FiLogOut,
  FiMenu,
  FiUser,
  FiX,
} from "react-icons/fi";

import useAuth from "../../hooks/useAuth";
import { getInitials } from "../../utils/generateAvatar";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: FiLayout },
  { name: "Profile", href: "/profile", icon: FiUser },
];

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "Signed in";

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-slate-900 text-slate-100 transition-transform duration-200 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
            <div>
              <p className="text-lg font-semibold">Task Tracker</p>
              <p className="text-xs text-slate-400">Dashboard</p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-slate-800 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close navigation"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.href ||
                (item.href === "/dashboard" &&
                  location.pathname.startsWith("/dashboard"));

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="absolute inset-x-0 bottom-0 border-t border-slate-800 p-4">
            <div className="mb-3 rounded-xl bg-slate-800/80 p-3">
              <p className="text-sm font-medium text-white">{displayEmail}</p>
              <p className="text-xs text-slate-400">Workspace access</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <FiLogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex-1 lg:ml-72">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <button
                type="button"
                className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <FiMenu className="h-5 w-5" />
              </button>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Welcome back
                </p>
                <h1 className="text-lg font-semibold text-slate-900">
                  {displayName}
                </h1>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((value) => !value)}
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    {getInitials(displayName)}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-medium text-slate-800">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500">{displayEmail}</p>
                  </div>
                  <FiChevronDown className="mr-1 h-4 w-4 text-slate-500" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-500">{displayEmail}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="mt-2 flex items-center rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FiUser className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      <FiLogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
