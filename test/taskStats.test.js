import test from "node:test";
import assert from "node:assert/strict";

import { buildTaskStats, getSubtaskProgress } from "../src/utils/taskStats.js";

test("buildTaskStats calculates summary metrics from tasks", () => {
  const tasks = [
    {
      id: 1,
      status: "pending",
      subtasks: [{ completed: false }, { completed: true }],
    },
    {
      id: 2,
      status: "completed",
      subtasks: [{ completed: true }, { completed: true }],
    },
    { id: 3, status: "pending", subtasks: [] },
  ];

  const stats = buildTaskStats(tasks);

  assert.equal(stats.total, 3);
  assert.equal(stats.pending, 2);
  assert.equal(stats.completed, 1);
  assert.equal(stats.completionPercentage, 33);
  assert.equal(stats.totalSubtasks, 4);
  assert.equal(stats.completedSubtasks, 3);
});

test("getSubtaskProgress returns a percentage and counts", () => {
  const progress = getSubtaskProgress([
    { completed: true },
    { completed: false },
  ]);

  assert.equal(progress.total, 2);
  assert.equal(progress.completed, 1);
  assert.equal(progress.percentage, 50);
});
