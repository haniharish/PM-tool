/**
 * Seed script - creates sample users and tasks
 * Run: npm run seed (after setting MONGODB_URI and JWT_SECRET in .env)
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Task from '../models/Task.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany({});
    await Task.deleteMany({});

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@project.com',
      password: 'admin123',
      role: 'admin',
    });

    const member1 = await User.create({
      name: 'John Doe',
      email: 'john@project.com',
      password: 'member123',
      role: 'team_member',
    });

    const member2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@project.com',
      password: 'member123',
      role: 'team_member',
    });

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const twoWeeks = new Date(today);
    twoWeeks.setDate(twoWeeks.getDate() + 14);

    const tasks = [
      { title: 'Setup project repository', status: 'completed', priority: 'high', assignedTo: admin._id, dueDate: today, order: 0 },
      { title: 'Design database schema', status: 'completed', priority: 'high', assignedTo: member1._id, dueDate: today, order: 1 },
      { title: 'Implement auth API', status: 'in_progress', priority: 'critical', assignedTo: member1._id, dueDate: nextWeek, order: 2 },
      { title: 'Build dashboard UI', status: 'in_progress', priority: 'high', assignedTo: member2._id, dueDate: nextWeek, order: 3 },
      { title: 'Add Kanban board', status: 'todo', priority: 'medium', assignedTo: member2._id, dueDate: twoWeeks, order: 4 },
      { title: 'Calendar integration', status: 'todo', priority: 'medium', assignedTo: member1._id, dueDate: twoWeeks, order: 5 },
      { title: 'Write documentation', status: 'todo', priority: 'low', assignedTo: admin._id, dueDate: twoWeeks, order: 6 },
    ];

    for (const t of tasks) {
      await Task.create({ ...t, createdBy: admin._id });
    }

    console.log('Seed completed. Users: admin@project.com / admin123, john@project.com / member123, jane@project.com / member123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
