export type TaskStatus = "pending" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  category: string;
  status: TaskStatus;
  due_date: string | null;
  completed: boolean;
  created_at: string | null;
  updated_at: string | null;
  subtasks: Subtask[];
}

export type TaskInsertData = {
  title: string;
  description?: string;
  priority: TaskPriority;
  category: string;
  status?: TaskStatus;
  dueDate?: string | null;
};

export type SubtaskInsertData = {
  title: string;
  description?: string;
  completed?: boolean;
};
