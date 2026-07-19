import type { DragEvent } from "react";
import type { Task, TaskStatus } from "../../types/task";
import TaskItem from "./TaskItem";

interface TaskCardProps {
  task: Task;
  onAddSubtask: (taskId: string, title: string) => Promise<void>;
  onToggleSubtask: (subtaskId: string, completed: boolean) => Promise<void>;
  onToggleTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onDeleteSubtask: (subtaskId: string) => Promise<void>;
  onDragStart: (event: DragEvent<HTMLDivElement>, taskId: string) => void;
}

function TaskCard({
  task,
  onAddSubtask,
  onToggleSubtask,
  onToggleTaskStatus,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onDeleteSubtask,
  onDragStart,
}: TaskCardProps) {
  return (
    <TaskItem
      task={task}
      onAddSubtask={onAddSubtask}
      onToggleSubtask={onToggleSubtask}
      onToggleTaskStatus={onToggleTaskStatus}
      onViewTask={onViewTask}
      onEditTask={onEditTask}
      onDeleteTask={onDeleteTask}
      onDeleteSubtask={onDeleteSubtask}
      onDragStart={onDragStart}
    />
  );
}

export default TaskCard;
