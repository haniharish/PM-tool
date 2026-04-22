import Task from '../models/Task.js';
import User from '../models/User.js';

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks (filter by user role: admin sees all, member sees assigned + created)
 */
export const getTasks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'team_member') {
      query = {
        $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }],
      };
    }
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task
 */
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.user.role === 'team_member') {
      const isAssignedOrCreator =
        task.assignedTo?._id?.toString() === req.user._id.toString() ||
        task.createdBy._id.toString() === req.user._id.toString();
      if (!isAssignedOrCreator) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @route   POST /api/tasks
 * @desc    Create task (assign by email: send assignedToEmail)
 */
export const createTask = async (req, res) => {
  try {
    const { assignedToEmail, ...rest } = req.body;
    let assignedTo = null;
    if (assignedToEmail && typeof assignedToEmail === 'string') {
      const user = await User.findOne({ email: assignedToEmail.trim().toLowerCase() });
      if (!user) {
        return res.status(400).json({ message: 'No user found with this email' });
      }
      assignedTo = user._id;
    }
    const task = await Task.create({
      ...rest,
      createdBy: req.user._id,
      assignedTo,
    });
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task - only creator can edit. Assignee can only change status (use PATCH /status).
 */
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const creatorId = task.createdBy?.toString?.() || task.createdBy.toString();
    if (creatorId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the task creator can edit. Assignee can only change status.' });
    }
    if (req.user.role === 'team_member') {
      const isAssignedOrCreator =
        task.assignedTo?.toString() === req.user._id.toString() || creatorId === req.user._id.toString();
      if (!isAssignedOrCreator) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    const { assignedToEmail, ...rest } = req.body;
    if (assignedToEmail !== undefined) {
      if (!assignedToEmail || typeof assignedToEmail !== 'string' || !assignedToEmail.trim()) {
        task.assignedTo = null;
      } else {
        const user = await User.findOne({ email: assignedToEmail.trim().toLowerCase() });
        if (!user) {
          return res.status(400).json({ message: 'No user found with this email' });
        }
        task.assignedTo = user._id;
      }
    }
    Object.assign(task, rest);
    await task.save();
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Update task status (for Kanban drag-drop)
 */
export const updateTaskStatus = async (req, res) => {
  try {
    const { status, order } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.user.role === 'team_member') {
      const isAssignedOrCreator =
        task.assignedTo?.toString() === req.user._id.toString() ||
        task.createdBy.toString() === req.user._id.toString();
      if (!isAssignedOrCreator) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    if (status) task.status = status;
    if (typeof order === 'number') task.order = order;
    await task.save();
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task - only the user who created (assigned) the task can delete
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const creatorId = task.createdBy?.toString?.() || task.createdBy.toString();
    if (creatorId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the task creator can delete this task.' });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
