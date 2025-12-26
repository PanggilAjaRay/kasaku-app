// controllers/projectController.js
const { Project, Task, Client } = require('../models');
const { v4: uuidv4 } = require('uuid');

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.json(projects);
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ error: 'Gagal mengambil data proyek.' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [
        { model: Task },
        { model: Client } // Include client info if needed
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan.' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Gagal mengambil data proyek.' });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, client_id, client_name, status, due_date, budget } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nama proyek wajib diisi.' });
    }

    const project = await Project.create({
      id: `P-${Date.now()}`, // Simple ID generation
      user_id: req.user.id,
      name,
      client_id,
      client_name,
      status: status || 'PLANNING',
      progress: 0,
      due_date,
      budget: budget || 0
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Gagal membuat proyek.' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, client_id, client_name, status, progress, due_date, budget } = req.body;

    const project = await Project.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan.' });
    }

    project.name = name || project.name;
    project.client_id = client_id || project.client_id;
    project.client_name = client_name || project.client_name;
    project.status = status || project.status;
    project.progress = progress !== undefined ? progress : project.progress;
    project.due_date = due_date || project.due_date;
    project.budget = budget || project.budget;

    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Gagal memperbarui proyek.' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan.' });
    }

    await project.destroy();

    res.json({ message: 'Proyek berhasil dihapus.' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Gagal menghapus proyek.' });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
