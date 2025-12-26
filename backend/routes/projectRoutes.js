// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');
const { checkLicense } = require('../middleware/license');
// Assuming projects need plus_advance? Or maybe part of basic for now. Let's make it basic/plus.
// If it requires plus_advance:
// const { checkAddon } = require('../middleware/addons');
// router.use(authenticate, checkLicense, checkAddon('plus_advance'));

// For now basic auth and license
router.use(authenticate, checkLicense);

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
