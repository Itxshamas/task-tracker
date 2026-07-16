import { supabase } from "../../config/supabase";

const TASK_TABLE = "tasks";
const SUBTASK_TABLE = "subtasks";

function normalizeTask(task) {
  return {
    ...task,
    dueDate: task.due_date ?? task.dueDate ?? null,
    createdAt: task.created_at ?? task.createdAt ?? null,
    updatedAt: task.updated_at ?? task.updatedAt ?? null,
    // Normalize any legacy or alternative statuses to the canonical values
    // Only `pending` and `completed` are supported in the app.
    status:
      task.status && String(task.status).toLowerCase() === "completed"
        ? "completed"
        : "pending",
    priority: task.priority ?? "medium",
    category: task.category ?? "general",
    subtasks: [],
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

async function getTasks(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from(TASK_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map(normalizeTask);
}

async function getDashboardTasks(userId) {
  const tasks = await getTasks(userId);

  if (!tasks.length) {
    return [];
  }

  const { data: subtasks, error } = await supabase
    .from(SUBTASK_TABLE)
    .select("*")
    .in(
      "task_id",
      tasks.map((task) => task.id),
    );

  if (error) throw error;

  const subtasksByTask = (subtasks ?? []).reduce((accumulator, subtask) => {
    const taskId = subtask.task_id;

    if (!accumulator[taskId]) {
      accumulator[taskId] = [];
    }

    accumulator[taskId].push(normalizeSubtask(subtask));
    return accumulator;
  }, {});

  return tasks.map((task) => ({
    ...task,
    subtasks: subtasksByTask[task.id] ?? [],
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
      category: taskData.category ?? "general",
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return normalizeTask(data);
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
      category: taskData.category ?? "general",
    })
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
    .single();

  if (error) throw error;

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
  getDashboardTasks,
  createTask,
  updateTask,
  deleteTask,
  createSubtask,
  getSubtasks,
  deleteSubtask,
  updateTaskStatus,
  updateSubtask,
  updateSubtaskStatus,
  getTaskProgress,
};

export default taskService;
