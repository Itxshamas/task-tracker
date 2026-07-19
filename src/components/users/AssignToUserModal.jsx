import { useState } from "react";

function AssignToUserModal({ tasks = [], onAssign, onCancel }) {
  const [selected, setSelected] = useState([]);

  const toggle = (taskId) => {
    setSelected((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAssign?.(selected);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-slate-600">
        Select one or more tasks to assign to the user.
      </div>

      <div className="space-y-2 max-h-60 overflow-auto">
        {tasks.length ? (
          tasks.map((task) => (
            <label
              key={task.id}
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-3"
            >
              <input
                type="checkbox"
                checked={selected.includes(task.id)}
                onChange={() => toggle(task.id)}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">
                  {task.title}
                </div>
                <div className="text-xs text-slate-500">
                  {task.description || "No description"}
                </div>
              </div>
            </label>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            No tasks available to assign.
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selected.length}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          Assign Selected
        </button>
      </div>
    </form>
  );
}

export default AssignToUserModal;
