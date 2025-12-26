// controllers/calendarController.js
const { CalendarEvent, Invoice, Task, Client, Project } = require('../models');
const { Op } = require('sequelize');

const getCalendarEvents = async (req, res) => {
  try {
    const { start_date, end_date, type } = req.query;
    
    const whereClause = { user_id: req.user.id };
    
    if (start_date && end_date) {
      whereClause.date = {
        [Op.between]: [start_date, end_date]
      };
    }
    
    if (type) whereClause.type = type;

    // Custom events
    const customEvents = await CalendarEvent.findAll({
      where: whereClause,
      order: [['date', 'ASC'], ['start_time', 'ASC']]
    });

    // Invoices due
    const today = new Date().toISOString().split('T')[0];
    const invoiceEvents = await Invoice.findAll({
      where: {
        user_id: req.user.id,
        status: { [Op.in]: ['PENDING', 'DRAFT'] },
        due_date: { [Op.gte]: today }
      },
      attributes: ['id', 'due_date', 'customer_name', 'total_amount', 'status'],
      order: [['due_date', 'ASC']]
    });

    // Tasks due
    const taskEvents = await Task.findAll({
      where: {
        user_id: req.user.id,
        status: { [Op.ne]: 'DONE' },
        due_date: { [Op.not]: null }
      },
      attributes: ['id', 'due_date', 'title', 'assignee', 'status', 'priority'],
      order: [['due_date', 'ASC']]
    });

    // Format events
    const events = [
      ...customEvents.map(event => ({
        id: event.id,
        date: event.date,
        title: event.title,
        type: event.type,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time,
        source: 'custom'
      })),
      ...invoiceEvents.map(inv => ({
        id: inv.id,
        date: inv.due_date,
        title: `Invoice #${inv.id} Due - ${inv.customer_name}`,
        type: 'INVOICE',
        amount: inv.total_amount,
        status: inv.status,
        source: 'invoice'
      })),
      ...taskEvents.map(task => ({
        id: task.id,
        date: task.due_date,
        title: `Task: ${task.title}`,
        type: 'TASK',
        assignee: task.assignee,
        priority: task.priority,
        source: 'task'
      }))
    ];

    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(events);

  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data kalender.' });
  }
};

const getEventsByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const customEvents = await CalendarEvent.findAll({
      where: {
        user_id: req.user.id,
        date: date
      }
    });

    const invoicesDue = await Invoice.findAll({
      where: {
        user_id: req.user.id,
        due_date: date,
        status: { [Op.in]: ['PENDING', 'DRAFT'] }
      }
    });

    const tasksDue = await Task.findAll({
      where: {
        user_id: req.user.id,
        due_date: date,
        status: { [Op.ne]: 'DONE' }
      }
    });

    res.json({
      date,
      custom_events: customEvents,
      invoices_due: invoicesDue,
      tasks_due: tasksDue
    });

  } catch (error) {
    console.error('Get events by date error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil acara.' });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, date, type, description, start_time, end_time } = req.body;

    // Validasi
    if (!title || !date || !type) {
      return res.status(400).json({ error: 'Judul, tanggal, dan tipe wajib diisi.' });
    }

    const event = await CalendarEvent.create({
      user_id: req.user.id,
      title,
      date,
      type,
      description: description || '',
      start_time: start_time || null,
      end_time: end_time || null
    });

    res.status(201).json({
      message: 'Acara berhasil dibuat.',
      event
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat acara.' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { title, date, type, description, start_time, end_time } = req.body;

    const event = await CalendarEvent.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Acara tidak ditemukan.' });
    }

    // Update
    event.title = title || event.title;
    event.date = date || event.date;
    event.type = type || event.type;
    event.description = description || event.description;
    event.start_time = start_time || event.start_time;
    event.end_time = end_time || event.end_time;

    await event.save();

    res.json({
      message: 'Acara berhasil diperbarui.',
      event
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui acara.' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Acara tidak ditemukan.' });
    }

    await event.destroy();

    res.json({ message: 'Acara berhasil dihapus.' });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus acara.' });
  }
};

const getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    // Custom events
    const customEvents = await CalendarEvent.findAll({
      where: {
        user_id: req.user.id,
        date: {
          [Op.between]: [today, nextWeekStr]
        }
      },
      order: [['date', 'ASC']],
      limit: 10
    });

    // Invoices due soon
    const invoicesDue = await Invoice.findAll({
      where: {
        user_id: req.user.id,
        status: { [Op.in]: ['PENDING', 'DRAFT'] },
        due_date: {
          [Op.between]: [today, nextWeekStr]
        }
      },
      order: [['due_date', 'ASC']],
      limit: 10
    });

    // Tasks due soon
    const tasksDue = await Task.findAll({
      where: {
        user_id: req.user.id,
        status: { [Op.ne]: 'DONE' },
        due_date: {
          [Op.between]: [today, nextWeekStr]
        }
      },
      order: [['due_date', 'ASC']],
      limit: 10
    });

    res.json({
      custom_events: customEvents,
      invoices_due: invoicesDue,
      tasks_due: tasksDue
    });

  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil acara mendatang.' });
  }
};

module.exports = {
  getCalendarEvents,
  getEventsByDate,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents
};