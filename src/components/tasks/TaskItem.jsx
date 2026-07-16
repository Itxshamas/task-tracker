import { useState } from "react";

import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

function formatDate(value) {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function TaskItem({
  task,
  onAddSubtask,
  onToggleSubtask,
  onToggleTaskStatus,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onDeleteSubtask,
  onDragStart,
  onDropTask,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedSubtasks =
    task.subtasks?.filter((item) => item.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;
  const completionPercentage =
    totalSubtasks > 0
      ? Math.round((completedSubtasks / totalSubtasks) * 100)
      : 0;
  const isCompleted = task.status === "completed";

  return (
    <div
      draggable
      onDragStart={(event) => onDragStart?.(event, task.id)}
      onDragOver={(event) => event.preventDefault()}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold text-slate-900">
              {task.title}
            </h4>
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
          <p className="text-sm text-slate-600">
            {task.description || "No description provided"}
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-500">
            <span>Category: {task.category || "Uncategorized"}</span>
            <span>Due: {formatDate(task.dueDate)}</span>
            <span>Created: {formatDate(task.createdAt)}</span>
          </div>
        </div>

        <div className="w-full max-w-50 space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Subtasks</span>
            <span>
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            Completion: {completionPercentage}%
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onViewTask?.(task)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => onEditTask?.(task)}
            className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDeleteTask?.(task)}
            className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
          >
            Delete
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            {isCompleted ? "Completed" : "Pending"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isCompleted}
            onClick={() =>
              onToggleTaskStatus(task.id, isCompleted ? "pending" : "completed")
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${isCompleted ? "bg-blue-600" : "bg-slate-300"}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${isCompleted ? "translate-x-5" : "translate-x-1"}`}
            />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          {isExpanded ? "Hide subtasks" : "Manage subtasks"}
        </button>
        <button
          type="button"
          onClick={() => onAddSubtask?.(task)}
          className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
        >
          + Add Subtask
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4">
          {task.subtasks?.length ? (
            <div className="space-y-2">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                >
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(subtask.completed)}
                      onChange={() =>
                        onToggleSubtask(subtask.id, !subtask.completed)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span
                      className={
                        subtask.completed
                          ? "text-slate-400 line-through"
                          : "text-slate-700"
                      }
                    >
                      {subtask.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onDeleteSubtask?.(subtask.id)}
                    className="text-sm font-medium text-rose-600 hover:text-rose-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
              <p className="mb-2">No subtasks yet.</p>
              <button
                type="button"
                onClick={() => onAddSubtask(task.id)}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Add Subtask
              </button>
            </div>
          )}

          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">
            <p className="mb-2">
              Use the add-subtask action to create a new subtask for this task.
            </p>
            <button
              type="button"
              onClick={() => onAddSubtask?.(task)}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Open subtask form
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskItem;
