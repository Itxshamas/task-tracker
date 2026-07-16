import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiLayout,
  FiCheckSquare,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

import useAuth from "../../hooks/useAuth";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: FiLayout },
  { name: "Tasks", href: "/tasks", icon: FiCheckSquare },
  { name: "Settings", href: "/settings", icon: FiSettings },
];

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();

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
              const isActive = location.pathname === item.href;

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
              <p className="text-sm font-medium text-white">
                {user?.email ?? "Signed in"}
              </p>
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
                  {user?.user_metadata?.full_name || "Your Dashboard"}
                </h1>
              </div>

              <div className="hidden rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 sm:block">
                {new Date().toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                })}
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
