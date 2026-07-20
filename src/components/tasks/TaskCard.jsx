import TaskItem from "./TaskItem";

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
  onDropTask,
  onAssignTask,
  isAdmin,
  currentUserId,
}) {
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
      onDropTask={onDropTask}
      onAssignTask={onAssignTask}
      isAdmin={isAdmin}
      currentUserId={currentUserId}
    />
  );
}

export default TaskCard;
