import Avatar from "../common/Avatar";
import PriorityBadge from "../tasks/PriorityBadge";

const statusStyles = {
  assigned: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  completed: "bg-slate-100 text-slate-700",
};

function AssignedTaskCard({
  assignment,
  onAccept,
  onReject,
  onComplete,
  isUpdating = false,
}) {
  const status = String(assignment.status || "assigned").toLowerCase();
  const canAccept = status !== "accepted" && status !== "completed";
  const canReject = status !== "rejected" && status !== "completed";
  const canComplete = status !== "completed" && status !== "rejected";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold text-slate-900">
              {assignment.task?.title || "Untitled task"}
            </h4>
            <PriorityBadge priority={assignment.task?.priority || "medium"} />
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                statusStyles[status] || statusStyles.assigned
              }`}
            >
              {status}
            </span>
          </div>

          <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:flex-wrap">
            <span>Category: {assignment.task?.category || "General"}</span>
            <span>
              Due:{" "}
              {assignment.task?.dueDate
                ? new Date(assignment.task.dueDate).toLocaleDateString()
                : "Not set"}
            </span>
            <span>
              Assigned by: {assignment.assignedByUser?.fullName || "Unknown"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Avatar
            src={assignment.assignedByUser?.avatarUrl}
            name={assignment.assignedByUser?.fullName}
            className="h-11 w-11"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onAccept(assignment)}
          disabled={!canAccept || isUpdating}
          className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          {isUpdating && canAccept ? "Updating..." : "Accept"}
        </button>
        <button
          type="button"
          onClick={() => onReject(assignment)}
          disabled={!canReject || isUpdating}
          className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          {isUpdating && canReject ? "Updating..." : "Reject"}
        </button>
        <button
          type="button"
          onClick={() => onComplete(assignment)}
          disabled={!canComplete || isUpdating}
          className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          {isUpdating && canComplete ? "Updating..." : "Mark Completed"}
        </button>
      </div>
    </div>
  );
}

export default AssignedTaskCard;
