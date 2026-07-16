function DashboardPreview() {
  const tasks = [
    {
      id: 1,
      title: "Design Landing Page",
      status: "Completed",
    },
    {
      id: 2,
      title: "Build Authentication",
      status: "In Progress",
    },
    {
      id: 3,
      title: "Implement Dashboard",
      status: "Pending",
    },
    {
      id: 4,
      title: "Create Task Module",
      status: "Pending",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-500";
      case "In Progress":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-100">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Today's Tasks</h2>

        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
          8 Tasks
        </span>
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:shadow-md"
          >
            <div>
              <h3 className="font-semibold text-gray-800">{task.title}</h3>

              <p className="text-sm text-gray-500">{task.status}</p>
            </div>

            <div
              className={`h-3 w-3 rounded-full ${getStatusColor(task.status)}`}
            />
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-8 rounded-xl bg-blue-600 p-5 text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Productivity</h3>

          <span className="font-bold">68%</span>
        </div>

        <p className="mt-2 text-sm text-blue-100">
          You completed 68% of today's work.
        </p>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-blue-400">
          <div className="h-full w-2/3 rounded-full bg-white"></div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPreview;
