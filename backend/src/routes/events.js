import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/events - Get all events (supports search and category filters)
router.get('/', (req, res) => {
  try {
    const { search, category } = req.query;
    let sql = `
      SELECT e.*, u.name as organizer_name, COUNT(CASE WHEN r.status = 'confirmed' THEN r.id END) as registered_count
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN registrations r ON e.id = r.event_id
    `;
    const params = [];
    const conditions = [];

    if (search) {
      conditions.push('(e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (category && category !== 'All') {
      conditions.push('e.category = ?');
      params.push(category);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY e.id ORDER BY e.date ASC';

    const events = query.all(sql, params);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to retrieve events.' });
  }
});

// GET /api/events/:id - Get event details by ID
router.get('/:id', (req, res) => {
  try {
    const eventId = req.params.id;
    const sql = `
      SELECT e.*, u.name as organizer_name, u.email as organizer_email, COUNT(CASE WHEN r.status = 'confirmed' THEN r.id END) as registered_count
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `;
    const event = query.get(sql, [eventId]);

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ error: 'Failed to retrieve event details.' });
  }
});

// POST /api/events - Create new event (Organizers only)
router.post('/', authenticateToken, requireRole('organizer'), (req, res) => {
  try {
    const { title, description, date, time, location, category, capacity, image_url } = req.body;

    if (!title || !description || !date || !time || !location || !category || !capacity) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const capacityNum = parseInt(capacity, 10);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      return res.status(400).json({ error: 'Capacity must be a positive integer.' });
    }

    const parsedImageUrl = image_url || '/assets/events/default_event.jpg';

    const result = query.run(
      `INSERT INTO events (title, description, date, time, location, category, capacity, image_url, organizer_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, date, time, location, category, capacityNum, parsedImageUrl, req.user.id]
    );

    const newEventId = result.lastInsertRowid;
    const createdEvent = query.get('SELECT * FROM events WHERE id = ?', [newEventId]);

    res.status(201).json(createdEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

// PUT /api/events/:id - Update an event (Organizers only)
router.put('/:id', authenticateToken, requireRole('organizer'), (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, description, date, time, location, category, capacity, image_url } = req.body;

    // Check if event exists and belongs to organizer
    const existingEvent = query.get('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (existingEvent.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to update this event.' });
    }

    if (!title || !description || !date || !time || !location || !category || !capacity) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const capacityNum = parseInt(capacity, 10);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      return res.status(400).json({ error: 'Capacity must be a positive integer.' });
    }

    query.run(
      `UPDATE events
       SET title = ?, description = ?, date = ?, time = ?, location = ?, category = ?, capacity = ?, image_url = ?
       WHERE id = ?`,
      [title, description, date, time, location, category, capacityNum, image_url, eventId]
    );

    const updatedEvent = query.get('SELECT * FROM events WHERE id = ?', [eventId]);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

// DELETE /api/events/:id - Delete an event (Organizers only)
router.delete('/:id', authenticateToken, requireRole('organizer'), (req, res) => {
  try {
    const eventId = req.params.id;

    // Check if event exists and belongs to organizer
    const existingEvent = query.get('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (existingEvent.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to delete this event.' });
    }

    query.run('DELETE FROM events WHERE id = ?', [eventId]);
    res.json({ message: 'Event successfully deleted.' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

export default router;
