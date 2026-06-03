import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// POST /api/registrations - Register current user for an event
router.post('/', authenticateToken, (req, res) => {
  try {
    const { event_id } = req.body;
    const userId = req.user.id;

    if (!event_id) {
      return res.status(400).json({ error: 'Event ID is required.' });
    }

    // 1. Get event details and current confirmed registration count
    const event = query.get(
      `SELECT e.*, COUNT(CASE WHEN r.status = 'confirmed' THEN r.id END) as registered_count
       FROM events e
       LEFT JOIN registrations r ON e.id = r.event_id
       WHERE e.id = ?
       GROUP BY e.id`,
      [event_id]
    );

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (event.registered_count >= event.capacity) {
      return res.status(400).json({ error: 'This event is already at full capacity.' });
    }

    // 2. Check if already registered
    const existingReg = query.get(
      "SELECT id, status FROM registrations WHERE user_id = ? AND event_id = ?",
      [userId, event_id]
    );

    if (existingReg) {
      if (existingReg.status === 'confirmed') {
        return res.status(400).json({ error: 'You are already registered for this event.' });
      } else {
        // If they cancelled previously, re-confirm it
        query.run(
          "UPDATE registrations SET status = 'confirmed', registered_at = ? WHERE id = ?",
          [new Date().toISOString(), existingReg.id]
        );
        return res.json({ message: 'Registration confirmed successfully.', registrationId: existingReg.id });
      }
    }

    // 3. Create new registration
    const result = query.run(
      `INSERT INTO registrations (user_id, event_id, registered_at, status)
       VALUES (?, ?, ?, 'confirmed')`,
      [userId, event_id, new Date().toISOString()]
    );

    res.status(201).json({
      message: 'Successfully registered for the event!',
      registrationId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Failed to process event registration.' });
  }
});

// GET /api/registrations/my - Get registrations for the logged-in user
router.get('/my', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT r.id as registration_id, r.registered_at, r.status,
             e.id as event_id, e.title, e.description, e.date, e.time, e.location, e.category, e.image_url, e.capacity,
             COUNT(CASE WHEN all_r.status = 'confirmed' THEN all_r.id END) as registered_count
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      LEFT JOIN registrations all_r ON e.id = all_r.event_id
      WHERE r.user_id = ? AND r.status = 'confirmed'
      GROUP BY r.id
      ORDER BY e.date ASC
    `;
    const registrations = query.all(sql, [userId]);
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Failed to retrieve registrations.' });
  }
});

// DELETE /api/registrations/:id - Cancel a registration
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const regId = req.params.id;
    const userId = req.user.id;

    // Check registration existence and ownership
    const reg = query.get('SELECT * FROM registrations WHERE id = ?', [regId]);

    if (!reg) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    if (reg.user_id !== userId) {
      return res.status(403).json({ error: 'You are not authorized to cancel this registration.' });
    }

    query.run('DELETE FROM registrations WHERE id = ?', [regId]);

    res.json({ message: 'Registration cancelled successfully.' });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ error: 'Failed to cancel registration.' });
  }
});

// GET /api/registrations/event/:eventId - Get registrants for an event (Organizers only)
router.get('/event/:eventId', authenticateToken, requireRole('organizer'), (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.id;

    // 1. Verify event belongs to this organizer
    const event = query.get('SELECT id, organizer_id FROM events WHERE id = ?', [eventId]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (event.organizer_id !== userId) {
      return res.status(403).json({ error: 'You do not own this event.' });
    }

    // 2. Fetch registrant list
    const sql = `
      SELECT r.id as registration_id, r.registered_at, r.status,
             u.id as user_id, u.name, u.email
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = ? AND r.status = 'confirmed'
      ORDER BY r.registered_at DESC
    `;
    const registrants = query.all(sql, [eventId]);
    res.json(registrants);
  } catch (error) {
    console.error('Error fetching event registrants:', error);
    res.status(500).json({ error: 'Failed to retrieve registrant list.' });
  }
});

export default router;
