import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [tasksRes, statsRes] = await Promise.all([
          tasksAPI.getAll(),
          isAdmin ? usersAPI.getWorkloadStats() : Promise.resolve({ data: null }),
        ]);
        setTasks(tasksRes.data);
        setStats(statsRes?.data || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  const todo = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const total = tasks.length;
  const progressPct = total ? Math.round((completed / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your project overview</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/tasks"
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200"
        >
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{total}</p>
        </Link>
        <Link
          to="/board"
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-200"
        >
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">To Do</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{todo}</p>
        </Link>
        <Link
          to="/board"
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
        >
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgress}</p>
        </Link>
        <Link
          to="/progress"
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-200 dark:hover:border-green-800 transition-all duration-200"
        >
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{completed}</p>
        </Link>
      </div>

      {/* Progress bar */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Progress</h2>
          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{progressPct}%</span>
        </div>
        <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/tasks"
          className="p-6 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 dark:from-primary-500/20 dark:to-accent-500/20 border border-primary-200 dark:border-primary-800 hover:shadow-lg transition-all"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white">View all tasks</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and create tasks</p>
        </Link>
        <Link
          to="/board"
          className="p-6 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 dark:from-primary-500/20 dark:to-accent-500/20 border border-primary-200 dark:border-primary-800 hover:shadow-lg transition-all"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white">Board</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag and drop to update status</p>
        </Link>
      </div>

      {/* Recent tasks */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No tasks yet. Create one from the Tasks page.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <li
                key={task._id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <span className="font-medium text-gray-900 dark:text-white truncate">{task.title}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : task.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {task.status.replace('_', ' ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
