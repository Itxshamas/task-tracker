import { useState } from "react";

import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

function formatDate(value) {
  if (!value) return "No due date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No due date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function TaskItem({ task, onAddSubtask, onToggleSubtask }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subtaskDraft, setSubtaskDraft] = useState("");

  const completedSubtasks =
    task.subtasks?.filter((item) => item.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;
  const completionPercentage =
    totalSubtasks > 0
      ? Math.round((completedSubtasks / totalSubtasks) * 100)
      : 0;

  const handleAddSubtask = async (event) => {
    event.preventDefault();

    if (!subtaskDraft.trim()) {
      return;
    }

    await onAddSubtask(task.id, subtaskDraft.trim());
    setSubtaskDraft("");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {isExpanded ? "Hide subtasks" : "Manage subtasks"}
        </button>
        <span className="text-sm text-slate-500">{totalSubtasks} total</span>
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
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No subtasks yet.</p>
          )}

          <form
            onSubmit={handleAddSubtask}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              type="text"
              value={subtaskDraft}
              onChange={(event) => setSubtaskDraft(event.target.value)}
              placeholder="Add a subtask"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default TaskItem;
