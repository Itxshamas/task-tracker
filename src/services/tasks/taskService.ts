import { supabase } from "../../config/supabase";
import type {
  Subtask,
  Task,
  TaskInsertData,
  SubtaskInsertData,
  TaskPriority,
  TaskStatus,
} from "../../types/task";

const TASK_TABLE = "tasks";
const SUBTASK_TABLE = "subtasks";

function normalizeTask(task: any): Task {
  return {
    id: task.id,
    user_id: task.user_id ?? task.userId ?? "",
    title: task.title ?? "",
    description: task.description ?? "",
    status:
      task.status && String(task.status).toLowerCase() === "completed"
        ? "completed"
        : "pending",
    priority: (task.priority as TaskPriority) ?? "medium",
    category: task.category ?? "general",
    due_date: task.due_date ?? task.dueDate ?? null,
    completed: Boolean(task.completed),
    created_at: task.created_at ?? task.createdAt ?? null,
    updated_at: task.updated_at ?? task.updatedAt ?? null,
    subtasks: [],
  };
}

function normalizeSubtask(subtask: any): Subtask {
  return {
    id: subtask.id,
    task_id: subtask.task_id ?? subtask.taskId ?? "",
    title: subtask.title ?? "",
    description: subtask.description ?? "",
    completed: Boolean(subtask.completed),
    created_at: subtask.created_at ?? subtask.createdAt ?? null,
    updated_at: subtask.updated_at ?? subtask.updatedAt ?? null,
  };
}

async function getTasks(userId: string | null): Promise<Task[]> {
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

async function getDashboardTasks(userId: string | null): Promise<Task[]> {
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

  const subtasksByTask = (subtasks ?? []).reduce(
    (accumulator: Record<string, Subtask[]>, subtask: any) => {
      const taskId = subtask.task_id;

      if (!accumulator[taskId]) {
        accumulator[taskId] = [];
      }

      accumulator[taskId].push(normalizeSubtask(subtask));
      return accumulator;
    },
    {},
  );

  return tasks.map((task) => ({
    ...task,
    subtasks: subtasksByTask[task.id] ?? [],
  }));
}

async function createTask(
  taskData: TaskInsertData,
  userId: string,
): Promise<Task> {
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

async function createTaskWithSubtasks(
  taskData: TaskInsertData,
  userId: string,
  subtasks: SubtaskInsertData[] = [],
): Promise<Task> {
  const task = await createTask(taskData, userId);

  if (!subtasks.length) {
    return task;
  }

  const preparedSubtasks = subtasks.map((subtask) => ({
    task_id: task.id,
    title: subtask.title,
    description: subtask.description ?? "",
    completed: false,
  }));

  const { data, error } = await supabase
    .from(SUBTASK_TABLE)
    .insert(preparedSubtasks)
    .select();

  if (error) {
    try {
      await deleteTask(task.id);
    } catch (cleanupError) {
      console.error("Failed to clean up task after subtask creation failure", cleanupError);
    }

    throw error;
  }

  return {
    ...task,
    subtasks: (data ?? []).map(normalizeSubtask),
  };
}

async function updateTask(
  taskId: string,
  taskData: TaskInsertData,
): Promise<Task> {
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

async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from(TASK_TABLE).delete().eq("id", taskId);

  if (error) throw error;
}

async function createSubtask(
  taskId: string,
  title: string,
  description = "",
): Promise<Subtask> {
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

async function getSubtasks(taskId: string): Promise<Subtask[]> {
  const { data, error } = await supabase
    .from(SUBTASK_TABLE)
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map(normalizeSubtask);
}

async function deleteSubtask(subtaskId: string): Promise<void> {
  const { error } = await supabase
    .from(SUBTASK_TABLE)
    .delete()
    .eq("id", subtaskId);

  if (error) throw error;
}

async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<Task> {
  const { data, error } = await supabase
    .from(TASK_TABLE)
    .update({ status })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;

  return normalizeTask(data);
}

async function updateSubtask(
  subtaskId: string,
  updates: Partial<{ title: string; description: string; completed: boolean }>,
): Promise<Subtask> {
  const { data, error } = await supabase
    .from(SUBTASK_TABLE)
    .update(updates)
    .eq("id", subtaskId)
    .select()
    .single();

  if (error) throw error;

  return normalizeSubtask(data);
}

async function updateSubtaskStatus(
  subtaskId: string,
  completed: boolean,
): Promise<Subtask> {
  return updateSubtask(subtaskId, { completed });
}

async function getTaskProgress(taskId: string) {
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
  createTaskWithSubtasks,
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
