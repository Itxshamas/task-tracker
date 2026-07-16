function formatDisplayDate(value) {
  if (!value) return "No due date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function RecentTasks({ tasks }) {
  if (!tasks?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-700">No tasks yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Your newest tasks will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Recent tasks</h3>
          <p className="text-sm text-slate-500">
            Latest activity from your workspace
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.slice(0, 5).map((task) => (
          <div
            key={task.id}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-slate-900">{task.title}</p>
              <p className="text-sm text-slate-500">
                {task.description || "No description provided"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                {task.priority}
              </span>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                {task.status}
              </span>
              <span className="text-slate-500">
                {formatDisplayDate(task.dueDate)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentTasks;
