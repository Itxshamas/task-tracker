import { supabase } from "../../config/supabase";

const TASK_TABLE = "tasks";
const SUBTASK_TABLE = "subtasks";
const PROFILES_TABLE = "profiles";
const TASK_ASSIGNMENTS_TABLE = "task_assignments";

const DEFAULT_CATEGORY = "General";

function normalizeTask(task) {
  return {
    ...task,
    dueDate: task.due_date ?? task.dueDate ?? null,
    createdAt: task.created_at ?? task.createdAt ?? null,
    updatedAt: task.updated_at ?? task.updatedAt ?? null,
    status:
      task.status && String(task.status).toLowerCase() === "completed"
        ? "completed"
        : "pending",
    priority: task.priority ?? "medium",
    category: task.category ?? DEFAULT_CATEGORY,
    subtasks: [],
    assignedUsers: [],
    assignedUserId: task.assigned_user_id ?? null,
    assignedUserName:
      task.assigned_user_id && task.assigned_user_name
        ? task.assigned_user_name
        : null,
  };
}

function normalizeSubtask(subtask) {
  return {
    ...subtask,
    createdAt: subtask.created_at ?? subtask.createdAt ?? null,
    updatedAt: subtask.updated_at ?? subtask.updatedAt ?? null,
    completed: Boolean(subtask.completed),
  };
}

function normalizeAssignment(assignment) {
  const assignee = assignment.assignedTo;
  const assigner = assignment.assignedBy;

  return {
    id: assignment.id,
    taskId: assignment.task_id,
    assignedToId: assignment.assigned_to,
    assignedById: assignment.assigned_by,
    assignedAt: assignment.assigned_at ?? null,
    status: assignment.status ?? "assigned",
    assignedUser: assignee
      ? {
          id: assignee.id,
          fullName: assignee.full_name || assignee.name || assignee.email,
          email: assignee.email,
          avatarUrl: assignee.avatar_url || null,
          role: assignee.role ?? null,
        }
      : null,
    assignedByUser: assigner
      ? {
          id: assigner.id,
          fullName: assigner.full_name || assigner.name || assigner.email,
          email: assigner.email,
          avatarUrl: assigner.avatar_url || null,
          role: assigner.role ?? null,
        }
      : null,
    task: assignment.task ? normalizeTask(assignment.task) : null,
  };
}

async function getTasks(userId) {
  console.log("[taskService] logged-in user id", userId);

  const query = supabase.from(TASK_TABLE).select("*").order("created_at", {
    ascending: false,
  });

  if (userId) {
    query.or(`user_id.eq.${userId},assigned_user_id.eq.${userId}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[taskService] query error", error);
    throw error;
  }

  console.log("[taskService] query result", data ?? []);
  return (data ?? []).map(normalizeTask);
}

async function getTasksByIds(taskIds) {
  if (!Array.isArray(taskIds) || !taskIds.length) {
    return [];
  }

  const { data, error } = await supabase
    .from(TASK_TABLE)
    .select("*")
    .in("id", taskIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map(normalizeTask);
}

async function hydrateAssignmentsWithTaskData(assignments) {
  if (!Array.isArray(assignments) || !assignments.length) {
    return [];
  }

  const missingTaskIds = [
    ...new Set(
      (assignments ?? [])
        .filter((assignment) => !assignment.task && assignment.task_id)
        .map((assignment) => assignment.task_id),
    ),
  ];

  const tasksById = (
    missingTaskIds.length ? await getTasksByIds(missingTaskIds) : []
  ).reduce((accumulator, task) => {
    if (task?.id) {
      accumulator[task.id] = task;
    }
    return accumulator;
  }, {});

  return (assignments ?? []).map((assignment) => {
    const taskSource = assignment.task || tasksById[assignment.task_id] || null;

    return normalizeAssignment({
      ...assignment,
      task: taskSource,
    });
  });
}

async function hydrateTasksWithRelatedData(tasks) {
  if (!Array.isArray(tasks) || !tasks.length) {
    return [];
  }

  const taskIds = tasks.map((task) => task.id);

  const [
    { data: subtasks, error: subtasksError },
    { data: assignments, error: assignmentsError },
  ] = await Promise.all([
    supabase.from(SUBTASK_TABLE).select("*").in("task_id", taskIds),
    supabase
      .from(TASK_ASSIGNMENTS_TABLE)
      .select(
        "*, assignedTo:profiles!task_assignments_assigned_to_fkey(*), assignedBy:profiles!task_assignments_assigned_by_fkey(*)",
      )
      .in("task_id", taskIds),
  ]);

  if (subtasksError) throw subtasksError;
  if (assignmentsError) throw assignmentsError;

  const subtasksByTask = (subtasks ?? []).reduce((accumulator, subtask) => {
    const taskId = subtask.task_id;

    if (!accumulator[taskId]) {
      accumulator[taskId] = [];
    }

    accumulator[taskId].push(normalizeSubtask(subtask));
    return accumulator;
  }, {});

  const assignmentsByTask = (assignments ?? []).reduce(
    (accumulator, assignment) => {
      const taskId = assignment.task_id;

      if (!accumulator[taskId]) {
        accumulator[taskId] = [];
      }

      accumulator[taskId].push(normalizeAssignment(assignment));
      return accumulator;
    },
    {},
  );

  return tasks.map((task) => ({
    ...task,
    subtasks: subtasksByTask[task.id] ?? [],
    assignedUsers: assignmentsByTask[task.id] ?? [],
  }));
}

async function getTasksAssignedToUser(userId) {
  if (!userId) {
    return [];
  }

  console.log("[taskService] getTasksAssignedToUser", { userId });

  const assignments = await getAssignedTasks(userId);

  if (!assignments.length) {
    return [];
  }

  const tasksById = assignments.reduce((accumulator, assignment) => {
    const task = assignment.task;

    if (!task || !task.id || accumulator[task.id]) {
      return accumulator;
    }

    accumulator[task.id] = {
      ...task,
      assignedUserId: assignment.assignedToId,
      assignedUserName:
        assignment.assignedUser?.fullName ||
        assignment.assignedUser?.email ||
        null,
    };

    return accumulator;
  }, {});

  const tasks = Object.values(tasksById);

  return hydrateTasksWithRelatedData(tasks);
}

async function getDashboardTasks(userId) {
  console.log("[taskService] getDashboardTasks userId", userId);

  const tasks = userId ? await getTasks(userId) : await getTasks();

  if (!tasks.length) {
    console.log("[taskService] getDashboardTasks result", []);
    return [];
  }

  const taskIds = tasks.map((task) => task.id);

  const { data: subtasks, error: subtasksError } = await supabase
    .from(SUBTASK_TABLE)
    .select("*")
    .in("task_id", taskIds);

  if (subtasksError) throw subtasksError;

  const { data: assignments, error: assignmentsError } = await supabase
    .from(TASK_ASSIGNMENTS_TABLE)
    .select(
      "*, assignedTo:profiles!task_assignments_assigned_to_fkey(*), assignedBy:profiles!task_assignments_assigned_by_fkey(*)",
    )
    .in("task_id", taskIds);

  if (assignmentsError) {
    console.error("[taskService] query error", assignmentsError);
    throw assignmentsError;
  }

  const subtasksByTask = (subtasks ?? []).reduce((accumulator, subtask) => {
    const taskId = subtask.task_id;

    if (!accumulator[taskId]) {
      accumulator[taskId] = [];
    }

    accumulator[taskId].push(normalizeSubtask(subtask));
    return accumulator;
  }, {});

  const assignmentsByTask = (assignments ?? []).reduce(
    (accumulator, assignment) => {
      const taskId = assignment.task_id;

      if (!accumulator[taskId]) {
        accumulator[taskId] = [];
      }

      accumulator[taskId].push(normalizeAssignment(assignment));
      return accumulator;
    },
    {},
  );

  return tasks.map((task) => ({
    ...task,
    subtasks: subtasksByTask[task.id] ?? [],
    assignedUsers: assignmentsByTask[task.id] ?? [],
  }));
}

async function createTask(taskData, userId) {
  const { data, error } = await supabase
    .from(TASK_TABLE)
    .insert({
      title: taskData.title,
      description: taskData.description ?? "",
      priority: taskData.priority ?? "medium",
      status: taskData.status ?? "pending",
      due_date: taskData.dueDate ?? null,
      category: taskData.category ?? DEFAULT_CATEGORY,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return normalizeTask(data);
}

async function createTaskWithSubtasks(taskData, userId, subtasks = []) {
  const task = await createTask(taskData, userId);

  if (!subtasks.length) {
    return task;
  }

  const payload = subtasks.map((subtask) => ({
    task_id: task.id,
    title: subtask.title,
    description: subtask.description ?? "",
    completed: false,
  }));

  const { data, error } = await supabase
    .from(SUBTASK_TABLE)
    .insert(payload)
    .select();

  if (error) {
    try {
      await deleteTask(task.id);
    } catch (cleanupError) {
      console.error(
        "Failed to clean up task after subtask creation failure",
        cleanupError,
      );
    }

    throw error;
  }

  return {
    ...task,
    subtasks: (data ?? []).map(normalizeSubtask),
  };
}

async function updateTask(taskId, taskData) {
  const { data, error } = await supabase
    .from(TASK_TABLE)
    .update({
      title: taskData.title,
      description: taskData.description ?? "",
      priority: taskData.priority ?? "medium",
      status: taskData.status ?? "pending",
      due_date: taskData.dueDate ?? null,
      category: taskData.category ?? DEFAULT_CATEGORY,
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;

  return normalizeTask(data);
}

async function setTaskAssignee(taskId, assignedUserId) {
  const { data, error } = await supabase
    .from(TASK_TABLE)
    .update({ assigned_user_id: assignedUserId })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;

  return normalizeTask(data);
}

async function deleteTask(taskId) {
  const { error } = await supabase.from(TASK_TABLE).delete().eq("id", taskId);

  if (error) throw error;
}

async function createSubtask(taskId, title, description = "") {
  const { data, error } = await supabase
    .from(SUBTASK_TABLE)
    .insert({
      task_id: taskId,
      title,
      description,
      completed: false,
    })
    .select()
    .single();

  if (error) throw error;

  return normalizeSubtask(data);
}

async function getSubtasks(taskId) {
  const { data, error } = await supabase
    .from(SUBTASK_TABLE)
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map(normalizeSubtask);
}

async function deleteSubtask(subtaskId) {
  const { error } = await supabase
    .from(SUBTASK_TABLE)
    .delete()
    .eq("id", subtaskId);

  if (error) throw error;
}

async function updateTaskStatus(taskId, status) {
  const { data, error } = await supabase
    .from(TASK_TABLE)
    .update({ status })
    .eq("id", taskId)
    .select()
    .maybeSingle(); // Changed from .single() to .maybeSingle()

  if (error) throw error;

  // If data is null, RLS blocked the update or task was not found
  if (!data) {
    throw new Error("You do not have permission to update this task.");
  }

  return normalizeTask(data);
}

async function updateSubtask(subtaskId, updates) {
  const { data, error } = await supabase
    .from(SUBTASK_TABLE)
    .update(updates)
    .eq("id", subtaskId)
    .select()
    .single();

  if (error) throw error;

  return normalizeSubtask(data);
}

async function updateSubtaskStatus(subtaskId, completed) {
  return updateSubtask(subtaskId, { completed });
}

async function getTeamUsers(currentUserId) {
  const query = supabase.from(PROFILES_TABLE).select("*");

  if (currentUserId) {
    query.neq("id", currentUserId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data ?? [];
}

async function getAssignedTasks(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from(TASK_ASSIGNMENTS_TABLE)
    .select(
      "*, task:tasks(*), assignedBy:profiles!task_assignments_assigned_by_fkey(*), assignedTo:profiles!task_assignments_assigned_to_fkey(*)",
    )
    .eq("assigned_to", userId)
    .order("assigned_at", { ascending: false });

  if (error) throw error;

  return hydrateAssignmentsWithTaskData(data ?? []);
}

async function getTaskWithAssignments(taskId) {
  if (!taskId) {
    return null;
  }

  const { data: taskData, error: taskError } = await supabase
    .from(TASK_TABLE)
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError) throw taskError;

  const task = normalizeTask(taskData);

  const { data: assignments, error: assignmentsError } = await supabase
    .from(TASK_ASSIGNMENTS_TABLE)
    .select(
      "*, assignedTo:profiles!task_assignments_assigned_to_fkey(*), assignedBy:profiles!task_assignments_assigned_by_fkey(*)",
    )
    .eq("task_id", taskId);

  if (assignmentsError) throw assignmentsError;

  return {
    ...task,
    assignedUsers: (assignments ?? []).map(normalizeAssignment),
  };
}

/**
 * Creates a task_assignments row for (taskId, assignedToId) if one doesn't
 * already exist. Low-level primitive — prefer `updateTaskAssignment` from
 * UI code, since this alone does not clear out any *other* existing
 * assignment rows for the task (e.g. a previous assignee).
 */
async function assignTask(taskId, assignedToId, assignedById) {
  if (!taskId || !assignedToId || !assignedById) {
    throw new Error("Missing assignment information");
  }

  const { data: existing, error: existingError } = await supabase
    .from(TASK_ASSIGNMENTS_TABLE)
    .select(
      "*, assignedTo:profiles!task_assignments_assigned_to_fkey(*), assignedBy:profiles!task_assignments_assigned_by_fkey(*)",
    )
    .eq("task_id", taskId)
    .eq("assigned_to", assignedToId)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    return normalizeAssignment(existing);
  }

  const { data, error } = await supabase
    .from(TASK_ASSIGNMENTS_TABLE)
    .insert({
      task_id: taskId,
      assigned_to: assignedToId,
      assigned_by: assignedById,
      status: "assigned",
      assigned_at: new Date().toISOString(),
    })
    .select(
      "*, assignedTo:profiles!task_assignments_assigned_to_fkey(*), assignedBy:profiles!task_assignments_assigned_by_fkey(*)",
    )
    .single();

  if (error) throw error;

  return normalizeAssignment(data);
}

/**
 * Removes every task_assignments row for a task. Used whenever the
 * assignee is being changed or cleared, so stale rows for previous
 * assignees never linger (which would otherwise leave the old assignee
 * seeing the task under "Assigned to me").
 */
async function clearTaskAssignments(taskId) {
  const { error } = await supabase
    .from(TASK_ASSIGNMENTS_TABLE)
    .delete()
    .eq("task_id", taskId);

  if (error) throw error;
}

/**
 * Single entry point for changing who a task is assigned to. Keeps
 * `tasks.assigned_user_id` and the `task_assignments` table in sync:
 *  - newAssignedToId is falsy -> unassign: clears both.
 *  - newAssignedToId is set   -> clears any prior assignment rows for the
 *    task, creates a fresh assignment row, and updates assigned_user_id.
 *
 * Returns { task, assignment } where assignment is null when unassigning.
 */
async function updateTaskAssignment(taskId, newAssignedToId, assignedById) {
  if (!taskId) {
    throw new Error("Missing task ID");
  }

  await clearTaskAssignments(taskId);

  if (!newAssignedToId) {
    const task = await setTaskAssignee(taskId, null);
    return { task, assignment: null };
  }

  if (!assignedById) {
    throw new Error("Missing assigner information");
  }

  const assignment = await assignTask(taskId, newAssignedToId, assignedById);
  const task = await setTaskAssignee(taskId, newAssignedToId);

  return { task, assignment };
}

async function updateAssignmentStatus(assignmentId, status) {
  if (!assignmentId || !status) {
    throw new Error("Missing assignment status information");
  }

  const { data, error } = await supabase
    .from(TASK_ASSIGNMENTS_TABLE)
    .update({ status })
    .eq("id", assignmentId)
    .select(
      "*, task:tasks(*), assignedBy:profiles!task_assignments_assigned_by_fkey(*), assignedTo:profiles!task_assignments_assigned_to_fkey(*)",
    )
    .single();

  if (error) throw error;

  return normalizeAssignment(data);
}

async function getTaskProgress(taskId) {
  const subtasks = await getSubtasks(taskId);
  const completed = subtasks.filter((subtask) => subtask.completed).length;

  return {
    total: subtasks.length,
    completed,
    percentage:
      subtasks.length > 0 ? Math.round((completed / subtasks.length) * 100) : 0,
  };
}

const taskService = {
  getTasks,
  getTasksByIds,
  getTasksAssignedToUser,
  getDashboardTasks,
  createTask,
  createTaskWithSubtasks,
  updateTask,
  deleteTask,
  createSubtask,
  getSubtasks,
  deleteSubtask,
  updateTaskStatus,
  updateSubtask,
  updateSubtaskStatus,
  getTeamUsers,
  getAssignedTasks,
  getTaskWithAssignments,
  assignTask,
  setTaskAssignee,
  clearTaskAssignments,
  updateTaskAssignment,
  updateAssignmentStatus,
  getTaskProgress,
};

export default taskService;
