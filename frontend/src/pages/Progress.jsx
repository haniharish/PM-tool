import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { tasksAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = { todo: '#94a3b8', in_progress: '#3b82f6', completed: '#22c55e' };
const PRIORITY_COLORS = { low: '#94a3b8', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444' };

export default function Progress() {
  const [tasks, setTasks] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: tasksData } = await tasksAPI.getAll();
        setTasks(tasksData);
        if (isAdmin) {
          const { data: stats } = await usersAPI.getWorkloadStats();
          setWorkload(stats || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const progressPct = total ? Math.round((completed / total) * 100) : 0;

  const myTasks = tasks.filter(
    (t) =>
      t.assignedTo?._id === user?._id ||
      t.assignedTo === user?._id ||
      t.createdBy?._id === user?._id ||
      t.createdBy === user?._id
  );
  const myCompleted = myTasks.filter((t) => t.status === 'completed').length;
  const myProgressPct = myTasks.length ? Math.round((myCompleted / myTasks.length) * 100) : 0;

  const statusData = [
    { name: 'Todo', value: todo, color: STATUS_COLORS.todo },
    { name: 'In Progress', value: inProgress, color: STATUS_COLORS.in_progress },
    { name: 'Completed', value: completed, color: STATUS_COLORS.completed },
  ];

  const priorityData = [
    { name: 'Low', value: tasks.filter((t) => t.priority === 'low').length, color: PRIORITY_COLORS.low },
    { name: 'Medium', value: tasks.filter((t) => t.priority === 'medium').length, color: PRIORITY_COLORS.medium },
    { name: 'High', value: tasks.filter((t) => t.priority === 'high').length, color: PRIORITY_COLORS.high },
    { name: 'Critical', value: tasks.filter((t) => t.priority === 'critical').length, color: PRIORITY_COLORS.critical },
  ].filter((d) => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Tracking</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Progress</h2>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Completed</span>
            <span className="font-medium text-primary-600 dark:text-primary-400">{myProgressPct}%</span>
          </div>
          <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-4">
            <div
              className="h-full rounded-full bg-gradient-primary transition-all duration-500"
              style={{ width: `${myProgressPct}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {myCompleted} of {myTasks.length} tasks completed
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Progress</h2>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Overall completion</span>
            <span className="font-medium text-primary-600 dark:text-primary-400">{progressPct}%</span>
          </div>
          <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-4">
            <div
              className="h-full rounded-full bg-gradient-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {completed} of {total} tasks completed
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tasks by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tasks by Priority</h2>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 py-8">No task data yet.</p>
          )}
        </div>
      </div>

      {isAdmin && workload.length > 0 && (
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Workload Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={workload} margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="Total tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
