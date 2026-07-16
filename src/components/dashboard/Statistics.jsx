function StatBar({ label, value, total }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-blue-600"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function Statistics({ stats }) {
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Performance</h3>
          <p className="text-sm text-slate-500">
            Progress overview for your tasks
          </p>
        </div>
        <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
          {completionRate}% completed
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <StatBar
          label="Completed"
          value={stats.completed ?? 0}
          total={stats.total ?? 0}
        />
        <StatBar
          label="Pending"
          value={stats.pending ?? 0}
          total={stats.total ?? 0}
        />
        <StatBar
          label="In Progress"
          value={stats.inProgress ?? 0}
          total={stats.total ?? 0}
        />
      </div>
    </div>
  );
}

export default Statistics;
