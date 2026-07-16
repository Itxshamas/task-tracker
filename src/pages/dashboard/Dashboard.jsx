import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import DashboardCards from "../../components/dashboard/DashboardCards";
import RecentTasks from "../../components/dashboard/RecentTasks";
import Statistics from "../../components/dashboard/Statistics";
import UpcomingTasks from "../../components/dashboard/UpcomingTasks";
import DashboardLayout from "../../components/layout/DashboardLayout";
import taskService from "../../services/tasks/taskService";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const data = await taskService.getDashboardTasks();

        if (isMounted) {
          setTasks(data);
        }
      } catch (error) {
        toast.error(error?.message || "Unable to load dashboard data");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === "completed").length,
    inProgress: tasks.filter(
      (task) => task.status === "in_progress" || task.status === "in progress",
    ).length,
    pending: tasks.filter((task) => task.status === "pending").length,
  };

  const recentTasks = [...tasks].sort(
    (left, right) =>
      new Date(right.createdAt || 0) - new Date(left.createdAt || 0),
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Overview</h2>
            <p className="text-sm text-slate-500">
              A snapshot of your current workload and priorities.
            </p>
          </div>
        </div>

        <DashboardCards stats={stats} />

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <RecentTasks tasks={recentTasks} />
          <Statistics stats={stats} />
        </div>

        <UpcomingTasks tasks={tasks} />
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
