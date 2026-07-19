function Statistics({ stats }) {
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const metrics = [
    {
      label: "Total Tasks",
      value: stats.total ?? 0,
      accent: "bg-blue-50 text-blue-700",
    },
    {
      label: "Pending Tasks",
      value: stats.pending ?? 0,
      accent: "bg-amber-50 text-amber-700",
    },
    {
      label: "Completed Tasks",
      value: stats.completed ?? 0,
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Completion %",
      value: `${completionRate}%`,
      accent: "bg-slate-100 text-slate-700",
    },
    {
      label: "Total Subtasks",
      value: stats.totalSubtasks ?? 0,
      accent: "bg-violet-50 text-violet-700",
    },
    {
      label: "Completed Subtasks",
      value: stats.completedSubtasks ?? 0,
      accent: "bg-cyan-50 text-cyan-700",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Performance</h3>
          <p className="text-sm text-slate-500">
            Live overview of task and subtask progress.
          </p>
        </div>
        <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
          {completionRate}% completed
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-2xl font-semibold text-slate-900">
                {metric.value}
              </p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${metric.accent}`}
              >
                Live
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Statistics;
