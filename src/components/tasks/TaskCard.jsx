import TaskItem from "./TaskItem";

function TaskCard({ task, onAddSubtask, onToggleSubtask }) {
  return (
    <TaskItem
      task={task}
      onAddSubtask={onAddSubtask}
      onToggleSubtask={onToggleSubtask}
    />
  );
}

export default TaskCard;
