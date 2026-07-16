import { supabase } from "../../config/supabase";

const TASK_TABLE = "tasks";

async function getTasks() {
  const { data, error } = await supabase
    .from(TASK_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

async function getDashboardTasks() {
  const tasks = await getTasks();

  return tasks.map((task) => ({
    ...task,
    dueDate: task.due_date ?? task.dueDate ?? null,
    createdAt: task.created_at ?? task.createdAt ?? null,
    status: task.status ?? "pending",
    priority: task.priority ?? "medium",
  }));
}

const taskService = {
  getTasks,
  getDashboardTasks,
};

export default taskService;
