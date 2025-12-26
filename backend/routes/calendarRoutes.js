// routes/calendarRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getCalendarEvents, 
  getEventsByDate, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  getUpcomingEvents
} = require('../controllers/calendarController');
const { authenticate } = require('../middleware/auth');
const { checkLicense } = require('../middleware/license');
const { checkAddon } = require('../middleware/addons');

// Semua route calendar membutuhkan plus_advance addon aktif
router.use(authenticate, checkLicense, checkAddon('plus_advance'));

router.get('/', getCalendarEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/date/:date', getEventsByDate);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;