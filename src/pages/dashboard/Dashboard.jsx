import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

import DashboardCards from "../../components/dashboard/DashboardCards";
import TaskList from "../../components/dashboard/TaskList";
import UpcomingTasks from "../../components/dashboard/UpcomingTasks";
import Modal from "../../components/common/Modal";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useAuth from "../../hooks/useAuth";
import taskService from "../../services/tasks/taskService";
import { categories } from "../../constants/categories";

const getCategoryOption = (category) => {
  if (!category) {
    return { value: "", label: "Unknown" };
  }

  if (typeof category === "string") {
    const label = category.charAt(0).toUpperCase() + category.slice(1);
    return { value: category, label };
  }

  if (typeof category === "object") {
    const value = category.value ?? category.label ?? "";
    const rawLabel = category.label ?? category.value ?? "";
    const label = String(rawLabel || "Unknown");
    return { value, label };
  }

  return { value: String(category), label: String(category) };
};

const initialFormState = {
  title: "",
  description: "",
  priority: "medium",
  status: "pending",
  dueDate: "",
  category: "general",
  subtasks: [],
};

function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isMounted = true;

    const loadDashboardData = async () => {
      setLoading(true);

      try {
        console.log("[Dashboard] logged-in user id", user.id);
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
    // inProgress removed; normalize older values are treated as pending in the service
    inProgress: 0,
    pending: tasks.filter((task) => task.status === "pending").length,
  };

  const [subtaskDraft, setSubtaskDraft] = useState({
    title: "",
    description: "",
  });

  const handleOpenCreateTaskModal = () => {
    setModalMode("create");
    setSelectedTask(null);
    setFormData(initialFormState);
    setSubtaskDraft({ title: "", description: "" });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditTaskModal = (task) => {
    setModalMode("edit");
    setSelectedTask(task);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      status: task.status || "pending",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
      category: task.category || "general",
      subtasks: [],
    });
    setSubtaskDraft({ title: "", description: "" });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenViewTaskModal = (task) => {
    setViewTask(task);
  };

  const handleOpenDeleteTaskModal = (task) => {
    setDeleteTask(task);
    setIsDeleteModalOpen(true);
  };

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

    if (!formData.category.trim()) {
      errors.category = "Category is required";
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
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || null,
        category: formData.category.trim() || "general",
      };

      if (modalMode === "edit" && selectedTask?.id) {
        await taskService.updateTask(selectedTask.id, payload);

        if (formData.subtasks.length) {
          await Promise.all(
            formData.subtasks.map((subtask) =>
              taskService.createSubtask(
                selectedTask.id,
                subtask.title.trim(),
                subtask.description?.trim(),
              ),
            ),
          );
        }

        toast.success("Task updated successfully");
      } else {
        await taskService.createTaskWithSubtasks(
          payload,
          user.id,
          formData.subtasks,
        );
        toast.success("Task created successfully");
      }

      await refreshTasks();
      setIsModalOpen(false);
      setModalMode("create");
      setSelectedTask(null);
      setFormData(initialFormState);
      setSubtaskDraft({ title: "", description: "" });
    } catch (error) {
      toast.error(error?.message || "Unable to save the task");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubtask = async (taskId, title) => {
    // normalize in case a whole task object was passed accidentally
    if (taskId && typeof taskId === "object") {
      taskId = taskId.id || taskId.task_id || null;
    }

    const finalTitle = String(title ?? "").trim();

    if (!taskId || typeof taskId !== "string") {
      toast.error("Invalid task ID for subtask");
      return;
    }

    if (!finalTitle) {
      toast.error("Subtask title is required");
      return;
    }

    try {
      await taskService.createSubtask(taskId, finalTitle);
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

  const handleDeleteTask = async () => {
    if (!deleteTask?.id) return;

    setIsDeleting(true);
    try {
      await taskService.deleteTask(deleteTask.id);
      toast.success("Task deleted successfully");
      await refreshTasks();
      setIsDeleteModalOpen(false);
      setDeleteTask(null);
    } catch (error) {
      toast.error(error?.message || "Unable to delete the task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleTaskStatus = async (taskId, nextStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, nextStatus);
      toast.success(
        nextStatus === "completed"
          ? "Task marked complete"
          : "Task moved to pending",
      );
      await refreshTasks();
    } catch (error) {
      toast.error(error?.message || "Unable to update the task status");
    }
  };

  const handleAddDraftSubtask = () => {
    const title = subtaskDraft.title.trim();

    if (!title) {
      setFormErrors((previous) => ({
        ...previous,
        subtaskDraft: "Subtask title is required",
      }));
      return;
    }

    setFormData((previous) => ({
      ...previous,
      subtasks: [
        ...previous.subtasks,
        {
          title,
          description: subtaskDraft.description.trim(),
        },
      ],
    }));

    setSubtaskDraft({ title: "", description: "" });
    setFormErrors((previous) => ({
      ...previous,
      subtaskDraft: undefined,
    }));
  };

  const handleRemoveDraftSubtask = (index) => {
    setFormData((previous) => ({
      ...previous,
      subtasks: previous.subtasks.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleDragStart = (event, taskId) => {
    try {
      event.dataTransfer.effectAllowed = "move";
      // store id in drag data for cross-browser consistency
      event.dataTransfer.setData("text/plain", String(taskId));
    } catch (err) {
      // ignore if dataTransfer not available
    }

    setDraggedTaskId(taskId);
  };

  const handleDropTask = async (event, targetStatus) => {
    event.preventDefault();

    // try to read id from dataTransfer if state wasn't set
    const dtId =
      (event?.dataTransfer?.getData &&
        event.dataTransfer.getData("text/plain")) ||
      draggedTaskId;
    const id = dtId || draggedTaskId;

    if (!id) return;

    const previous = tasks;

    // optimistic UI update
    setTasks((current) =>
      current.map((t) => (t.id === id ? { ...t, status: targetStatus } : t)),
    );

    try {
      await taskService.updateTaskStatus(id, targetStatus);
      toast.success(
        targetStatus === "completed"
          ? "Task moved to completed"
          : "Task moved to pending",
      );
      await refreshTasks();
    } catch (error) {
      setTasks(previous);
      toast.error(error?.message || "Unable to move the task");
    } finally {
      setDraggedTaskId(null);
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
            onClick={handleOpenCreateTaskModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <FiPlus className="h-4 w-4" />
            Add Task
          </button>
        </div>

        <DashboardCards stats={stats} />

        {/* Recent tasks and Performance widgets removed as requested */}

        <TaskList
          tasks={tasks}
          loading={false}
          onAddSubtask={handleAddSubtask}
          onToggleSubtask={handleToggleSubtask}
          onViewTask={handleOpenViewTaskModal}
          onEditTask={handleOpenEditTaskModal}
          onDeleteTask={handleOpenDeleteTaskModal}
          onToggleTaskStatus={handleToggleTaskStatus}
          onDragStart={handleDragStart}
          onDropTask={handleDropTask}
        />

        <UpcomingTasks tasks={tasks} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalMode === "edit" ? "Edit task" : "Create a new task"}
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
                {/* 'In Progress' status removed; only pending and completed are supported */}
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
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleFieldChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                {categories.map((category) => {
                  const option = getCategoryOption(category);
                  return (
                    <option
                      key={option.value || option.label}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  );
                })}
              </select>
              {formErrors.category && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.category}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Subtasks
                </h3>
                <p className="text-sm text-slate-500">
                  Add subtasks before saving the task.
                </p>
              </div>
              <span className="text-sm text-slate-500">
                {formData.subtasks.length} added
              </span>
            </div>

            {formData.subtasks.length > 0 && (
              <div className="space-y-2 pb-4">
                {formData.subtasks.map((subtask, index) => (
                  <div
                    key={`${subtask.title}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-white p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {subtask.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {subtask.description || "No description"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDraftSubtask(index)}
                        className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700"
                  htmlFor="subtaskTitle"
                >
                  Subtask title
                </label>
                <input
                  id="subtaskTitle"
                  name="subtaskTitle"
                  value={subtaskDraft.title}
                  onChange={(event) =>
                    setSubtaskDraft((previous) => ({
                      ...previous,
                      title: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="e.g. Prepare notes"
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700"
                  htmlFor="subtaskDescription"
                >
                  Description
                </label>
                <input
                  id="subtaskDescription"
                  name="subtaskDescription"
                  value={subtaskDraft.description}
                  onChange={(event) =>
                    setSubtaskDraft((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="Optional details"
                />
              </div>
            </div>
            {formErrors.subtaskDraft && (
              <p className="mt-2 text-sm text-red-600">
                {formErrors.subtaskDraft}
              </p>
            )}
            <button
              type="button"
              onClick={handleAddDraftSubtask}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Add subtask
            </button>
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
              {isSaving
                ? modalMode === "edit"
                  ? "Saving..."
                  : "Creating..."
                : modalMode === "edit"
                  ? "Save Changes"
                  : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(viewTask)}
        onClose={() => setViewTask(null)}
        title="Task details"
      >
        {viewTask && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-lg font-semibold text-slate-900">
                {viewTask.title}
              </h4>
              <p className="mt-2 text-sm text-slate-600">
                {viewTask.description || "No description provided"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Priority:</span>{" "}
                {viewTask.priority}
              </div>
              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Status:</span>{" "}
                {viewTask.status}
              </div>
              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Category:</span>{" "}
                {viewTask.category || "general"}
              </div>
              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Due date:</span>{" "}
                {viewTask.dueDate
                  ? new Date(viewTask.dueDate).toLocaleDateString()
                  : "Not set"}
              </div>
              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Created:</span>{" "}
                {viewTask.createdAt
                  ? new Date(viewTask.createdAt).toLocaleString()
                  : "Not available"}
              </div>
              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Updated:</span>{" "}
                {viewTask.updatedAt
                  ? new Date(viewTask.updatedAt).toLocaleString()
                  : "Not available"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">
                  Subtasks
                </h4>
                <span className="text-sm text-slate-500">
                  {
                    (viewTask.subtasks ?? []).filter(
                      (subtask) => subtask.completed,
                    ).length
                  }
                  /{viewTask.subtasks?.length ?? 0}
                </span>
              </div>
              {(viewTask.subtasks ?? []).length ? (
                <div className="space-y-2">
                  {viewTask.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      <span
                        className={
                          subtask.completed ? "line-through text-slate-400" : ""
                        }
                      >
                        {subtask.title}
                      </span>
                      <span className="text-xs text-slate-500">
                        {subtask.completed ? "Complete" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No subtasks have been added yet.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete task"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            This action will permanently remove the task and its subtasks from
            your dashboard. Continue?
          </p>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteTask}
              disabled={isDeleting}
              className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export default Dashboard;
