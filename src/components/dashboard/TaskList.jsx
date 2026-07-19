import { useMemo, useState } from "react";

import SearchBar from "../tasks/SearchBar";
import TaskCard from "../tasks/TaskCard";

const statusOptions = ["all", "pending", "completed"];
const priorityOptions = ["all", "low", "medium", "high", "urgent"];
const categoryOptions = [
  "all",
  "work",
  "personal",
  "study",
  "health",
  "shopping",
];
const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "dueDate", label: "Due Date" },
  { value: "priority", label: "Priority" },
  { value: "status", label: "Status" },
  { value: "alphabetical", label: "Alphabetical" },
];

function TaskList({
  tasks = [],
  loading = false,
  onAddTask,
  onAddSubtask,
  onToggleSubtask,
  onToggleTaskStatus,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onDeleteSubtask,
  onDragStart,
  onDropTask,
  onAssignTask,
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = tasks.filter((task) => {
      const matchesQuery =
        !normalizedQuery ||
        task.title?.toLowerCase().includes(normalizedQuery) ||
        task.description?.toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;
      const matchesCategory =
        categoryFilter === "all" || task.category === categoryFilter;

      return (
        matchesQuery && matchesStatus && matchesPriority && matchesCategory
      );
    });

    const sorted = [...filtered].sort((left, right) => {
      switch (sortBy) {
        case "oldest":
          return new Date(left.createdAt || 0) - new Date(right.createdAt || 0);
        case "dueDate":
          return new Date(left.dueDate || 0) - new Date(right.dueDate || 0);
        case "priority": {
          const priorityRank = { low: 1, medium: 2, high: 3, urgent: 4 };
          return (
            (priorityRank[right.priority] || 0) -
            (priorityRank[left.priority] || 0)
          );
        }
        case "status":
          return String(left.status).localeCompare(String(right.status));
        case "alphabetical":
          return String(left.title || "").localeCompare(
            String(right.title || ""),
          );
        case "newest":
        default:
          return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
      }
    });

    return sorted;
  }, [categoryFilter, priorityFilter, query, sortBy, statusFilter, tasks]);

  const pendingTasks = filteredTasks.filter(
    (task) => task.status !== "completed",
  );
  const completedTasks = filteredTasks.filter(
    (task) => task.status === "completed",
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-6 w-40 animate-pulse rounded bg-slate-200" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Tasks</h3>
          <p className="text-sm text-slate-500">
            Search, filter, and review your task list.
          </p>
        </div>
        <div className="w-full max-w-md">
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All statuses" : option.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          <span>Priority</span>
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            {priorityOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All priorities" : option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          <span>Category</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All categories" : option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">
          {filteredTasks.length} task{filteredTasks.length === 1 ? "" : "s"}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span>Sort by</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 7h8M8 12h5M8 17h3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="4"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </div>
          <h4 className="text-base font-semibold text-slate-900">
            No tasks found
          </h4>
          <p className="mt-1 text-sm text-slate-500">
            Create your first task to get started.
          </p>
          <button
            type="button"
            onClick={() => onAddTask?.()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Add Task
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => onDropTask?.(event, "pending")}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-semibold text-slate-900">Pending</h4>
              <span className="rounded-full bg-white px-2.5 py-1 text-sm text-slate-600">
                {pendingTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingTasks.length ? (
                pendingTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onAddSubtask={onAddSubtask}
                    onToggleSubtask={onToggleSubtask}
                    onToggleTaskStatus={onToggleTaskStatus}
                    onViewTask={onViewTask}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                    onDeleteSubtask={onDeleteSubtask}
                    onDragStart={onDragStart}
                    onDropTask={onDropTask}
                    onAssignTask={onAssignTask}
                  />
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  Drop completed tasks here to move them back to pending.
                </p>
              )}
            </div>
          </div>

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => onDropTask?.(event, "completed")}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-semibold text-slate-900">Completed</h4>
              <span className="rounded-full bg-white px-2.5 py-1 text-sm text-slate-600">
                {completedTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {completedTasks.length ? (
                completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onAddSubtask={onAddSubtask}
                    onToggleSubtask={onToggleSubtask}
                    onToggleTaskStatus={onToggleTaskStatus}
                    onViewTask={onViewTask}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                    onDeleteSubtask={onDeleteSubtask}
                    onDragStart={onDragStart}
                    onDropTask={onDropTask}
                    onAssignTask={onAssignTask}
                  />
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  Drag completed tasks here.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskList;
