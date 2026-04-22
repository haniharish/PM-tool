import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-amber-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'completed', title: 'Completed', color: 'bg-green-500' },
];

export default function Kanban() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    const { data } = await tasksAPI.getAll();
    setTasks(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchTasks();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleMove = async (taskId, newStatus, newOrder) => {
    await tasksAPI.updateStatus(taskId, { status: newStatus, order: newOrder });
    await fetchTasks();
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, { status: newStatus });
      await fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleSave = async (payload) => {
    if (editingTask) {
      await tasksAPI.update(editingTask._id, payload);
    } else {
      await tasksAPI.create(payload);
    }
    await fetchTasks();
    handleClose();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await tasksAPI.delete(id);
    await fetchTasks();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Board</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Drag cards between columns or use the status dropdown on each card to update progress.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg bg-gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          + Add Task
        </button>
      </div>

      <DndProvider backend={HTML5Backend}>
        <KanbanBoard
          columns={COLUMNS}
          tasks={tasks}
          onMove={handleMove}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          currentUserId={user?._id}
        />
      </DndProvider>

      {modalOpen && (
        <TaskModal task={editingTask} onClose={handleClose} onSave={handleSave} />
      )}
    </div>
  );
}
