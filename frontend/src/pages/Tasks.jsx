import { useEffect, useState } from 'react';
import { tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskModal from '../components/TaskModal';

const isCreator = (task, userId) =>
  userId && (task.createdBy?._id?.toString() === userId.toString() || task.createdBy?.toString() === userId.toString());

const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
const STATUS_LABELS = { todo: 'Todo', in_progress: 'In Progress', completed: 'Completed' };
const PRIORITY_CLASS = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const STATUS_CLASS = {
  todo: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { user } = useAuth();

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

  const handleCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
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

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, { status: newStatus });
      await fetchTasks();
    } catch (e) {
      console.error(e);
    }
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 rounded-lg bg-gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          + Add Task
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No tasks yet. Click "Add Task" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Priority</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Assigned</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Due</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{task.title}</td>
                    <td className="px-4 py-3">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className={`text-xs px-2 py-1.5 rounded-lg border-0 cursor-pointer font-medium ${STATUS_CLASS[task.status] || ''} focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100`}
                      >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${PRIORITY_CLASS[task.priority]}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {task.assignedTo?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isCreator(task, user?._id) ? (
                        <>
                          <button
                            onClick={() => handleEdit(task)}
                            className="text-primary-500 hover:text-primary-600 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">Assignee: status only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
