function UpcomingTasks({ tasks }) {
  const upcomingTasks = [...tasks]
    .filter((task) => task.dueDate)
    .sort((left, right) => new Date(left.dueDate) - new Date(right.dueDate))
    .slice(0, 5);

  if (!upcomingTasks.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-700">No upcoming tasks</p>
        <p className="mt-1 text-sm text-slate-500">
          You are all caught up for now.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Upcoming tasks</h3>
        <p className="text-sm text-slate-500">
          Next milestones on your calendar
        </p>
      </div>

      <div className="space-y-3">
        {upcomingTasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-slate-900">{task.title}</p>
              <p className="text-sm text-slate-500">
                {new Date(task.dueDate).toLocaleDateString()}
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-700">
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UpcomingTasks;
