import { useDrag } from 'react-dnd';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function KanbanCard({ task, priorityColor, onEdit, onDelete, onStatusChange, isCreator }) {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'TASK',
    item: { id: task._id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={dragRef}
      className={`rounded-lg border-l-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${priorityColor}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{task.title}</p>
      {task.assignedTo && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
          → {task.assignedTo.name}
        </p>
      )}
      {task.dueDate && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
      {onStatusChange && (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className="w-full text-xs py-1.5 px-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer focus:ring-1 focus:ring-primary-500"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}
      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          {isCreator && onEdit && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="text-xs text-primary-500 hover:text-primary-600"
            >
              Edit
            </button>
          )}
          {isCreator && onDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
