import { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';
import UserModal from '../components/UserModal';

export default function Team() {
  const [users, setUsers] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);

  const fetchUsers = async () => {
    const { data } = await usersAPI.getAll();
    setUsers(data);
  };

  const fetchWorkload = async () => {
    const { data } = await usersAPI.getWorkloadStats();
    setWorkload(data || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchUsers(), fetchWorkload()]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAddMember = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleSave = async (payload) => {
    await usersAPI.create(payload);
    await fetchUsers();
    await fetchWorkload();
    handleClose();
  };

  const getWorkloadForUser = (userId) => {
    const w = workload.find((x) => String(x._id) === String(userId));
    return w ? { total: w.count, completed: w.completed } : { total: 0, completed: 0 };
  };

  const handleViewTasks = async (user) => {
    const { data } = await usersAPI.getTasks(user._id);
    setUserTasks(data);
    setSelectedUser(user);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h1>
        <button
          onClick={handleAddMember}
          className="px-4 py-2 rounded-lg bg-gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          + Add Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const w = getWorkloadForUser(u._id);
          return (
            <div
              key={u._id}
              className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                </div>
              </div>
              <p className="text-xs capitalize text-gray-500 dark:text-gray-400 mb-3">{u.role?.replace('_', ' ')}</p>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Assigned tasks</span>
                  <span>{w.total} ({w.completed} done)</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-primary transition-all"
                    style={{ width: w.total ? `${(w.completed / w.total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
              <button
                onClick={() => handleViewTasks(u)}
                className="mt-3 w-full py-2 rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-sm font-medium"
              >
                View assigned tasks
              </button>
            </div>
          );
        })}
      </div>

      {selectedUser && (
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tasks assigned to {selectedUser.name}
            </h2>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          {userTasks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No tasks assigned.</p>
          ) : (
            <ul className="space-y-2">
              {userTasks.map((task) => (
                <li
                  key={task._id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{task.title}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {task.status.replace('_', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {modalOpen && <UserModal onClose={handleClose} onSave={handleSave} />}
    </div>
  );
}
