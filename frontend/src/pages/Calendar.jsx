import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { tasksAPI } from '../services/api';
import TaskModal from '../components/TaskModal';
import { useAuth } from '../context/AuthContext';

const isCreator = (task, userId) =>
  userId && (task.createdBy?._id?.toString() === userId.toString() || task.createdBy?.toString() === userId.toString());

export default function Calendar() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [dateTasks, setDateTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    const { data } = await tasksAPI.getAll();
    setTasks(data);
    const evts = data
      .filter((t) => t.dueDate)
      .map((t) => ({
        id: t._id,
        title: t.title,
        date: new Date(t.dueDate).toISOString().slice(0, 10),
        extendedProps: { task: t },
      }));
    setEvents(evts);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchTasks();
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleDateClick = (arg) => {
    const dateStr = arg.dateStr;
    const onDate = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate).toISOString().slice(0, 10);
      return d === dateStr;
    });
    setDateTasks(onDate);
    setSelectedDate(dateStr);
  };

  const handleEventClick = (info) => {
    const task = info.event.extendedProps.task;
    if (!isCreator(task, user?._id)) return; // Only creator can open edit
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTask(null);
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
    const { data } = await tasksAPI.getAll();
    setTasks(data);
    const evts = data
      .filter((t) => t.dueDate)
      .map((t) => ({
        id: t._id,
        title: t.title,
        date: new Date(t.dueDate).toISOString().slice(0, 10),
        extendedProps: { task: t },
      }));
    setEvents(evts);
    if (selectedDate) {
      setDateTasks(data.filter((t) => t.dueDate && new Date(t.dueDate).toISOString().slice(0, 10) === selectedDate));
    }
    handleClose();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 rounded-lg bg-gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          + Add Task
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
        />
      </div>

      {selectedDate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tasks on {new Date(selectedDate).toLocaleDateString()}
          </h2>
          {dateTasks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No tasks due on this date.</p>
          ) : (
            <ul className="space-y-2">
              {dateTasks.map((task) => (
                <li
                  key={task._id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{task.title}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {task.status.replace('_', ' ')} · {task.priority}
                  </span>
                  {isCreator(task, user?._id) ? (
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setModalOpen(true);
                      }}
                      className="text-primary-500 hover:text-primary-600 text-sm"
                    >
                      Edit
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">Assignee: status only</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {modalOpen && (
        <TaskModal task={editingTask} onClose={handleClose} onSave={handleSave} />
      )}
    </div>
  );
}
