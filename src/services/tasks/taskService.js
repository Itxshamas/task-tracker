import { supabase } from "../../config/supabase";

const TASK_TABLE = "tasks";
const SUBTASK_TABLE = "subtasks";

function normalizeTask(task) {
  return {
    ...task,
    dueDate: task.due_date ?? task.dueDate ?? null,
    createdAt: task.created_at ?? task.createdAt ?? null,
    status: task.status ?? "pending",
    priority: task.priority ?? "medium",
    category: task.category ?? "general",
    subtasks: [],
  };
}

function normalizeSubtask(subtask) {
  return {
    ...subtask,
    createdAt: subtask.created_at ?? subtask.createdAt ?? null,
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

async function createSubtask(taskId, title) {
  const { data, error } = await supabase
    .from(SUBTASK_TABLE)
    .insert({
      task_id: taskId,
      title,
      completed: false,
    })
    .select()
    .single();

  if (error) throw error;

  return normalizeSubtask(data);
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

const taskService = {
  getTasks,
  getDashboardTasks,
  createTask,
  createSubtask,
  updateSubtask,
};

export default taskService;
