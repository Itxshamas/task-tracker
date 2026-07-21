export function getSubtaskProgress(subtasks = []) {
  const total = subtasks.length;
  const completed = subtasks.filter((subtask) =>
    Boolean(subtask?.completed),
  ).length;

  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function buildTaskStats(tasks = []) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task?.status === "completed").length;
  const pending = tasks.filter((task) => task?.status !== "completed").length;
  const subtaskProgress = tasks.reduce(
    (accumulator, task) => {
      const progress = getSubtaskProgress(task?.subtasks ?? []);
      accumulator.totalSubtasks += progress.total;
      accumulator.completedSubtasks += progress.completed;
      return accumulator;
    },
    { totalSubtasks: 0, completedSubtasks: 0 },
  );

  return {
    total,
    completed,
    pending,
    inProgress: pending,
    completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    totalSubtasks: subtaskProgress.totalSubtasks,
    completedSubtasks: subtaskProgress.completedSubtasks,
  };
}
