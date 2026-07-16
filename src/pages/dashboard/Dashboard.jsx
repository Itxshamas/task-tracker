import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

import DashboardCards from "../../components/dashboard/DashboardCards";
import RecentTasks from "../../components/dashboard/RecentTasks";
import Statistics from "../../components/dashboard/Statistics";
import TaskList from "../../components/dashboard/TaskList";
import UpcomingTasks from "../../components/dashboard/UpcomingTasks";
import Modal from "../../components/common/Modal";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useAuth from "../../hooks/useAuth";
import taskService from "../../services/tasks/taskService";

const initialFormState = {
  title: "",
  description: "",
  priority: "medium",
  status: "pending",
  dueDate: "",
  category: "",
};

function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isMounted = true;

    const loadDashboardData = async () => {
      setLoading(true);

      try {
        const data = await taskService.getDashboardTasks(user.id);

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
  }, [user?.id]);

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

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setFormErrors({});
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((previous) => ({
        ...previous,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Task title is required";
    }

    if (formData.dueDate) {
      const selectedDate = new Date(`${formData.dueDate}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.dueDate = "Due date cannot be in the past";
      }
    }

    setFormErrors(errors);
    return errors;
  };

  const refreshTasks = async () => {
    if (!user?.id) {
      return;
    }

    const data = await taskService.getDashboardTasks(user.id);
    setTasks(data);
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length) {
      return;
    }

    setIsSaving(true);

    try {
      await taskService.createTask(
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          status: formData.status,
          dueDate: formData.dueDate || null,
          category: formData.category.trim() || "general",
        },
        user.id,
      );

      toast.success("Task created successfully");
      await refreshTasks();
      closeModal();
    } catch (error) {
      toast.error(error?.message || "Unable to create the task");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubtask = async (taskId, title) => {
    try {
      await taskService.createSubtask(taskId, title);
      toast.success("Subtask added");
      await refreshTasks();
    } catch (error) {
      toast.error(error?.message || "Unable to add the subtask");
    }
  };

  const handleToggleSubtask = async (subtaskId, completed) => {
    try {
      await taskService.updateSubtask(subtaskId, { completed });
      toast.success(completed ? "Subtask marked complete" : "Subtask reopened");
      await refreshTasks();
    } catch (error) {
      toast.error(error?.message || "Unable to update the subtask");
    }
  };

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Overview</h2>
            <p className="text-sm text-slate-500">
              A snapshot of your current workload and priorities.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <FiPlus className="h-4 w-4" />
            Add Task
          </button>
        </div>

        <DashboardCards stats={stats} />

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <RecentTasks tasks={recentTasks} />
          <Statistics stats={stats} />
        </div>

        <TaskList
          tasks={tasks}
          loading={false}
          onAddSubtask={handleAddSubtask}
          onToggleSubtask={handleToggleSubtask}
        />

        <UpcomingTasks tasks={tasks} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Create a new task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="title"
              >
                Task title
              </label>
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleFieldChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                placeholder="e.g. Prepare sprint review"
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFieldChange}
                rows="3"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                placeholder="Add context, notes, or details"
              />
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="priority"
              >
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleFieldChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="status"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleFieldChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="dueDate"
              >
                Due date
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleFieldChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
              {formErrors.dueDate && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.dueDate}
                </p>
              )}
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="category"
              >
                Category
              </label>
              <input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleFieldChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                placeholder="Work, Study, Personal"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSaving ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default Dashboard;
