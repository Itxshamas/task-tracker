import { useEffect, useState } from "react";

import Modal from "../common/Modal";

function SubtaskModal({
  isOpen,
  onClose,
  parentTask,
  subtask,
  onSubmit,
  isSubmitting,
}) {
  const [formData, setFormData] = useState({
    title: subtask?.title ?? "",
    description: subtask?.description ?? "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData({
      title: subtask?.title ?? "",
      description: subtask?.description ?? "",
    });
    setErrors({});
  }, [isOpen, subtask]);

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

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSubmit?.({
      title: formData.title.trim(),
      description: formData.description.trim(),
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
          <p className="mt-1 text-sm text-slate-600">
            {parentTask?.title || "Select a task"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Category: {parentTask?.category || "general"}
          </p>
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
