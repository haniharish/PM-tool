import express from 'express';
import {
  getUsers,
  createUser,
  getUserTasks,
  getWorkloadStats,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getUsers); // All users can list team (for assignee dropdown)
router.post('/', adminOnly, createUser);
router.get('/stats', getWorkloadStats);
router.get('/:id/tasks', getUserTasks);

export default router;
