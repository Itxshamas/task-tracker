import { useEffect, useMemo, useState } from "react";

import Modal from "../common/Modal";

function SubtaskModal({
  isOpen,
  onClose,
  parentTask,
  subtask,
  onSubmit,
  isSubmitting,
  tasks = [],
}) {
  const [formData, setFormData] = useState({
    title: subtask?.title ?? "",
    description: subtask?.description ?? "",
    parentTaskId: parentTask?.id ?? subtask?.task_id ?? "",
  });
  const [errors, setErrors] = useState({});

  const taskOptions = useMemo(() => {
    return (tasks ?? []).map((task) => ({
      id: task.id,
      label: task.title || "Untitled task",
      category: task.category || "General",
    }));
  }, [tasks]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData({
      title: subtask?.title ?? "",
      description: subtask?.description ?? "",
      parentTaskId: parentTask?.id ?? subtask?.task_id ?? "",
    });
    setErrors({});
  }, [isOpen, parentTask, subtask]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({ ...previous, [name]: value }));

    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: undefined }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!formData.title.trim()) {
      nextErrors.title = "Subtask title is required";
    }

    if (!parentTask && !formData.parentTaskId) {
      nextErrors.parentTaskId = "Please select a parent task";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSubmit?.({
      title: formData.title.trim(),
      description: formData.description.trim(),
      parentTaskId: formData.parentTaskId || parentTask?.id || subtask?.task_id,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subtask ? "Edit subtask" : "Add subtask"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Parent task</p>
          {!parentTask ? (
            <>
              <select
                id="parent-task"
                name="parentTaskId"
                value={formData.parentTaskId}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select a parent task</option>
                {taskOptions.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.label} ({task.category})
                  </option>
                ))}
              </select>
              {errors.parentTaskId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.parentTaskId}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-slate-600">{parentTask.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                Category: {parentTask.category || "General"}
              </p>
            </>
          )}
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="subtask-title"
          >
            Subtask title
          </label>
          <input
            id="subtask-title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            placeholder="e.g. Review the latest notes"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="subtask-description"
          >
            Description
          </label>
          <textarea
            id="subtask-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            placeholder="Optional context for the subtask"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting
              ? "Saving..."
              : subtask
                ? "Save changes"
                : "Add subtask"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default SubtaskModal;
