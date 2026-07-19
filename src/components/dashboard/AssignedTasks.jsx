import AssignedTaskCard from "./AssignedTaskCard";

function AssignedTasks({
  assignments,
  loading,
  updatingAssignmentId,
  onAccept,
  onReject,
  onComplete,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!assignments?.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Assigned To Me
            </h3>
            <p className="text-sm text-slate-500">
              Tasks that have been assigned to you.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No tasks have been assigned to you yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Assigned To Me
          </h3>
          <p className="text-sm text-slate-500">
            Review and update assignments that are waiting for your response.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
          {assignments.length} assignment{assignments.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <AssignedTaskCard
            key={assignment.id}
            assignment={assignment}
            onAccept={onAccept}
            onReject={onReject}
            onComplete={onComplete}
            isUpdating={updatingAssignmentId === assignment.id}
          />
        ))}
      </div>
    </div>
  );
}

export default AssignedTasks;
