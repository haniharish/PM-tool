import User from '../models/User.js';
import Task from '../models/Task.js';

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only - for team management)
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @route   POST /api/users
 * @desc    Add new team member (Admin only)
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'team_member',
    });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @route   GET /api/users/:id/tasks
 * @desc    Get tasks assigned to a user (workload)
 */
export const getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.id })
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @route   GET /api/users/stats
 * @desc    Get workload distribution (tasks per user)
 */
export const getWorkloadStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', email: '$user.email', count: 1, completed: 1 } },
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
