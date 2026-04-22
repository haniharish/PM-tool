import { useDrop } from 'react-dnd';
import KanbanCard from './KanbanCard';

const PRIORITY_COLOR = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-500',
  high: 'border-l-amber-500',
  critical: 'border-l-red-500',
};

export default function KanbanBoard({ columns, tasks, onMove, onEdit, onDelete, onStatusChange, currentUserId }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => (
        <KanbanColumn
          key={col.id}
          column={col}
          tasks={tasks.filter((t) => t.status === col.id)}
          onDrop={(taskId, order) => onMove(taskId, col.id, order)}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}

function KanbanColumn({ column, tasks, onDrop, onEdit, onDelete, onStatusChange, currentUserId }) {
  const [{ isOver }, dropRef] = useDrop({
    accept: 'TASK',
    drop: (item) => {
      onDrop(item.id, tasks.length);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={dropRef}
      className={`rounded-xl border-2 border-dashed p-4 min-h-[400px] transition-colors ${
        isOver ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${column.color}`} />
        <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((task) => (
            <KanbanCard
              key={task._id}
              task={task}
              priorityColor={PRIORITY_COLOR[task.priority]}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task._id)}
              onStatusChange={onStatusChange}
              isCreator={currentUserId && (task.createdBy?._id?.toString() === currentUserId.toString() || task.createdBy?.toString() === currentUserId.toString())}
            />
          ))}
      </div>
    </div>
  );
}
