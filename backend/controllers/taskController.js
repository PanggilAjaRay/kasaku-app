// controllers/taskController.js
const { Task } = require('../models');
const { Op } = require('sequelize');

const getAllTasks = async (req, res) => {
  try {
    const { project_id, status, assignee, priority, due_date } = req.query;
    
    const whereClause = { user_id: req.user.id };
    
    if (project_id) whereClause.project_id = project_id;
    if (status) whereClause.status = status;
    if (assignee) whereClause.assignee = assignee;
    if (priority) whereClause.priority = priority;
    if (due_date) whereClause.due_date = due_date;

    const tasks = await Task.findAll({
      where: whereClause,
      order: [
        ['due_date', 'ASC'],
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    res.json(tasks);

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data tugas.' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tugas tidak ditemukan.' });
    }

    res.json(task);

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data tugas.' });
  }
};

const createTask = async (req, res) => {
  try {
    const { project_id, title, description, assignee, due_date, status, priority } = req.body;

    // Validasi
    if (!title) {
      return res.status(400).json({ error: 'Judul tugas wajib diisi.' });
    }

    const task = await Task.create({
      user_id: req.user.id,
      project_id: project_id || null,
      title,
      description: description || '',
      assignee: assignee || '',
      due_date: due_date || null,
      status: status || 'TODO',
      priority: priority || 'MEDIUM'
    });

    res.status(201).json({
      message: 'Tugas berhasil dibuat.',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat tugas.' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { project_id, title, description, assignee, due_date, status, priority } = req.body;

    const task = await Task.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tugas tidak ditemukan.' });
    }

    // Update
    task.project_id = project_id || task.project_id;
    task.title = title || task.title;
    task.description = description || task.description;
    task.assignee = assignee || task.assignee;
    task.due_date = due_date || task.due_date;
    task.status = status || task.status;
    task.priority = priority || task.priority;

    await task.save();

    res.json({
      message: 'Tugas berhasil diperbarui.',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui tugas.' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tugas tidak ditemukan.' });
    }

    await task.destroy();

    res.json({ message: 'Tugas berhasil dihapus.' });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus tugas.' });
  }
};

const toggleTaskStatus = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tugas tidak ditemukan.' });
    }

    // Toggle status
    task.status = task.status === 'DONE' ? 'TODO' : 'DONE';
    await task.save();

    res.json({
      message: `Tugas berhasil ditandai sebagai ${task.status === 'DONE' ? 'Selesai' : 'Belum Selesai'}.`,
      task
    });

  } catch (error) {
    console.error('Toggle task status error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengubah status tugas.' });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: {
        user_id: req.user.id,
        project_id: req.params.projectId
      },
      order: [['due_date', 'ASC']]
    });

    res.json(tasks);

  } catch (error) {
    console.error('Get tasks by project error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil tugas.' });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  getTasksByProject
};