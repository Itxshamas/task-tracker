import { useEffect, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

import { supabase } from "../../config/supabase";
import DashboardCards from "../../components/dashboard/DashboardCards";
import Statistics from "../../components/dashboard/Statistics";
import TaskList from "../../components/dashboard/TaskList";
import AssignedTasks from "../../components/dashboard/AssignedTasks";
import Modal from "../../components/common/Modal";
import DashboardLayout from "../../components/layout/DashboardLayout";
import SubtaskModal from "../../components/tasks/SubtaskModal";
import AssignTaskModal from "../../components/tasks/AssignTaskModal";
import useAuth from "../../hooks/useAuth";
import taskService from "../../services/tasks/taskService";
import { categories } from "../../constants/categories";
import { buildTaskStats } from "../../utils/taskStats";

const initialFormState = {
  title: "",
  description: "",
  priority: "medium",
  status: "pending",
  dueDate: "",
  category: "General",
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
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [subtaskTargetTask, setSubtaskTargetTask] = useState(null);
  const [activeSubtask, setActiveSubtask] = useState(null);
  const [isSubtaskSaving, setIsSubtaskSaving] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTask, setAssignTask] = useState(null);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(true);
  const [updatingAssignmentId, setUpdatingAssignmentId] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isMounted = true;

    const loadDashboardData = async () => {
      setLoading(true);
      setAssignedLoading(true);

      try {
        const [data, assigned] = await Promise.all([
          taskService.getDashboardTasks(user.id),
          taskService.getAssignedTasks(user.id),
        ]);

        if (isMounted) {
          setTasks(data);
          setAssignedTasks(assigned);
        }
      } catch (error) {
        toast.error(error?.message || "Unable to load dashboard data");
      } finally {
        if (isMounted) {
          setLoading(false);
          setAssignedLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const stats = useMemo(() => buildTaskStats(tasks), [tasks]);

  const handleOpenCreateTaskModal = () => {
    setModalMode("create");
    setSelectedTask(null);
    setFormData(initialFormState);
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
    });
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

  const handleOpenAssignTaskModal = async (task) => {
    setAssignTask(task);
    setIsAssignModalOpen(true);

    try {
      const users = await taskService.getTeamUsers(user?.id);
      setAssignableUsers(users);
    } catch (error) {
      toast.error(error?.message || "Unable to load team members");
    }
  };

  const handleOpenSubtaskModal = (task, subtask = null) => {
    setSubtaskTargetTask(task ?? null);
    setActiveSubtask(subtask);
    setIsSubtaskModalOpen(true);
  };

  const handleOpenGlobalSubtaskModal = () => {
    setSubtaskTargetTask(null);
    setActiveSubtask(null);
    setIsSubtaskModalOpen(true);
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

    try {
      const [data, assigned] = await Promise.all([
        taskService.getDashboardTasks(user.id),
        taskService.getAssignedTasks(user.id),
      ]);

      setTasks(data);
      setAssignedTasks(assigned);
    } catch (error) {
      toast.error(error?.message || "Unable to refresh dashboard data");
    }
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
        category: (formData.category || "").trim() || "General",
      };

      if (modalMode === "edit" && selectedTask?.id) {
        await taskService.updateTask(selectedTask.id, payload);
        toast.success("Task updated successfully");
      } else {
        await taskService.createTask(payload, user.id);
        toast.success("Task created successfully");
      }

      await refreshTasks();
      setIsModalOpen(false);
      setModalMode("create");
      setSelectedTask(null);
      setFormData(initialFormState);
    } catch (error) {
      toast.error(error?.message || "Unable to save the task");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubtask = async (taskId, title, description = "") => {
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
      await taskService.createSubtask(taskId, finalTitle, description);
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

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await taskService.deleteSubtask(subtaskId);
      toast.success("Subtask removed");
      await refreshTasks();
    } catch (error) {
      toast.error(error?.message || "Unable to remove the subtask");
    }
  };

  const handleSaveSubtask = async (payload) => {
    const parentTaskId = payload.parentTaskId || subtaskTargetTask?.id;

    if (!parentTaskId) {
      toast.error("Please select a parent task before adding a subtask");
      return;
    }

    setIsSubtaskSaving(true);

    try {
      if (activeSubtask?.id) {
        const updatedSubtask = await taskService.updateSubtask(
          activeSubtask.id,
          {
            title: payload.title,
            description: payload.description,
          },
        );
        setTasks((current) =>
          current.map((task) =>
            task.id === parentTaskId
              ? {
                  ...task,
                  subtasks: (task.subtasks ?? []).map((subtask) =>
                    subtask.id === updatedSubtask.id ? updatedSubtask : subtask,
                  ),
                }
              : task,
          ),
        );
        toast.success("Subtask updated");
      } else {
        const createdSubtask = await taskService.createSubtask(
          parentTaskId,
          payload.title,
          payload.description,
        );
        setTasks((current) =>
          current.map((task) =>
            task.id === parentTaskId
              ? {
                  ...task,
                  subtasks: [...(task.subtasks ?? []), createdSubtask],
                }
              : task,
          ),
        );
        toast.success("Subtask added");
      }

      setIsSubtaskModalOpen(false);
      setSubtaskTargetTask(null);
      setActiveSubtask(null);
    } catch (error) {
      toast.error(error?.message || "Unable to save the subtask");
    } finally {
      setIsSubtaskSaving(false);
    }
  };

  const handleAssignTask = async (assignedToId) => {
    if (!assignTask?.id || !assignedToId || !user?.id) {
      return;
    }

    setIsAssigning(true);

    try {
      const assignment = await taskService.assignTask(
        assignTask.id,
        assignedToId,
        user.id,
      );

      const assignedUserName =
        assignment?.assignedUser?.fullName ||
        assignment?.assignedUser?.email ||
        "Assigned user";

      setTasks((current) =>
        current.map((task) =>
          task.id === assignTask.id
            ? {
                ...task,
                assignedUsers: [assignment],
                assignedUserName,
              }
            : task,
        ),
      );

      toast.success("Task assigned successfully");
      setIsAssignModalOpen(false);
      setAssignTask(null);
    } catch (error) {
      toast.error(error?.message || "Unable to assign the task");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateAssignment = async (
    assignmentId,
    nextStatus,
    successMessage,
  ) => {
    if (!assignmentId) {
      return;
    }

    setUpdatingAssignmentId(assignmentId);
    const previousAssignments = assignedTasks;

    setAssignedTasks((current) =>
      current.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, status: nextStatus }
          : assignment,
      ),
    );

    try {
      const updatedAssignment = await taskService.updateAssignmentStatus(
        assignmentId,
        nextStatus,
      );

      setAssignedTasks((current) =>
        current.map((assignment) =>
          assignment.id === assignmentId ? updatedAssignment : assignment,
        ),
      );
      await refreshTasks();
      toast.success(successMessage);
    } catch (error) {
      setAssignedTasks(previousAssignments);
      toast.error(error?.message || "Unable to update assignment status");
    } finally {
      setUpdatingAssignmentId(null);
    }
  };

  const handleAcceptAssignment = (assignment) => {
    handleUpdateAssignment(assignment.id, "accepted", "Assignment accepted");
  };

  const handleRejectAssignment = (assignment) => {
    handleUpdateAssignment(assignment.id, "rejected", "Assignment rejected");
  };

  const handleCompleteAssignment = (assignment) => {
    handleUpdateAssignment(
      assignment.id,
      "completed",
      "Assignment marked completed",
    );
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreateTaskModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <FiPlus className="h-4 w-4" />
              Add Task
            </button>
            <button
              type="button"
              onClick={handleOpenGlobalSubtaskModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              <FiPlus className="h-4 w-4" />+ Add Subtask
            </button>
          </div>
        </div>

        <DashboardCards stats={stats} />

        <Statistics stats={stats} />

        <TaskList
          tasks={tasks}
          loading={false}
          onAddTask={handleOpenCreateTaskModal}
          onAddSubtask={handleOpenSubtaskModal}
          onToggleSubtask={handleToggleSubtask}
          onViewTask={handleOpenViewTaskModal}
          onEditTask={handleOpenEditTaskModal}
          onDeleteTask={handleOpenDeleteTaskModal}
          onDeleteSubtask={handleDeleteSubtask}
          onToggleTaskStatus={handleToggleTaskStatus}
          onDragStart={handleDragStart}
          onDropTask={handleDropTask}
          onAssignTask={handleOpenAssignTaskModal}
        />

        <div className="mt-6">
          <AssignedTasks
            assignments={assignedTasks}
            loading={assignedLoading}
            updatingAssignmentId={updatingAssignmentId}
            onAccept={handleAcceptAssignment}
            onReject={handleRejectAssignment}
            onComplete={handleCompleteAssignment}
          />
        </div>
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
                {(categories || []).map((category) => {
                  const option =
                    typeof category === "string"
                      ? { label: category, value: category }
                      : category;

                  const value = option.value ?? option.label ?? "General";
                  const label = option.label ?? String(value);

                  return (
                    <option key={value} value={value}>
                      {label}
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

      <SubtaskModal
        isOpen={isSubtaskModalOpen}
        onClose={() => {
          setIsSubtaskModalOpen(false);
          setSubtaskTargetTask(null);
          setActiveSubtask(null);
        }}
        parentTask={subtaskTargetTask}
        subtask={activeSubtask}
        onSubmit={handleSaveSubtask}
        isSubmitting={isSubtaskSaving}
        tasks={tasks}
      />

      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssignTask(null);
        }}
        users={assignableUsers}
        selectedUserId={assignTask?.assignedUserId}
        onAssign={handleAssignTask}
        isAssigning={isAssigning}
      />

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
