// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask,
  toggleTaskStatus,
  getTasksByProject
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { checkLicense } = require('../middleware/license');
const { checkAddon } = require('../middleware/addons');

// Semua route task membutuhkan plus_advance addon aktif
router.use(authenticate, checkLicense, checkAddon('plus_advance'));

router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.put('/:id/toggle', toggleTaskStatus);
router.get('/project/:projectId', getTasksByProject);

module.exports = router;