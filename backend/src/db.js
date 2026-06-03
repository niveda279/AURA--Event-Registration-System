import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../events.db');
const db = new DatabaseSync(dbPath);

// Initialize database schema
export function initDb() {
  // Create Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'organizer'))
    )
  `);

  // Create Events Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      category TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      image_url TEXT,
      organizer_id INTEGER NOT NULL,
      FOREIGN KEY(organizer_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create Registrations Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      registered_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'cancelled')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
      UNIQUE(user_id, event_id)
    )
  `);

  // Seed initial data if tables are empty
  seedData();
}

function seedData() {
  // Check if users table is empty
  const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const userCount = userCountStmt.get().count;

  if (userCount === 0) {
    console.log('Seeding initial database tables...');

    // 1. Seed Users
    const insertUser = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    );

    const organizerPassword = bcrypt.hashSync('admin123', 10);
    const userPassword = bcrypt.hashSync('user123', 10);

    insertUser.run('Alex Mercer (Organizer)', 'organizer@eventreg.com', organizerPassword, 'organizer');
    insertUser.run('Sarah Connor', 'user@eventreg.com', userPassword, 'user');
    insertUser.run('John Doe', 'john@eventreg.com', userPassword, 'user');

    // Retrieve the organizer ID
    const organizerIdStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    const organizerId = organizerIdStmt.get('organizer@eventreg.com').id;
    const sarahId = organizerIdStmt.get('user@eventreg.com').id;
    const johnId = organizerIdStmt.get('john@eventreg.com').id;

    // 2. Seed Events
    const insertEvent = db.prepare(`
      INSERT INTO events (title, description, date, time, location, category, capacity, image_url, organizer_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // We will place beautiful local static relative urls, which we'll configure
    insertEvent.run(
      'Next-Gen Tech Summit 2026',
      'Dive deep into the future of Agentic AI, decentralized computing, and quantum interfaces. Featuring keynotes from industry pioneers, interactive coding labs, and networking sessions in our high-tech atrium.',
      '2026-07-15',
      '09:00',
      'Silicon Valley Convention Center, Hall B',
      'Tech',
      120,
      '/assets/events/tech_summit.png',
      organizerId
    );

    insertEvent.run(
      'Neon Dreams Synthwave Concert',
      'Experience an unforgettable night of retro-futuristic beats, pulsating neon light shows, and heavy synth basslines. Featuring live performances by RetroGlow, CyberPulse, and special guest DJ Sunset Grid.',
      '2026-08-20',
      '20:00',
      'The Grid Live Music Arena, Los Angeles',
      'Music',
      50, // smaller capacity for urgency
      '/assets/events/synthwave_concert.png',
      organizerId
    );

    insertEvent.run(
      'Immersive Digital Art Exhibition',
      'Walk through walls of living light and sound. This exhibition merges virtual reality, projection mapping, and neural art models to create dynamic environments that react to your movements and biometrics.',
      '2026-06-25',
      '14:00',
      'Luminosity Gallery, New York',
      'Art',
      80,
      '/assets/events/digital_art.png',
      organizerId
    );

    insertEvent.run(
      'Gourmet Street Food Festival',
      'Savor the tastes of 30+ award-winning artisanal food trucks and street vendors from around the globe. Live cooking showdowns, custom spice blenders, craft beer gardens, and visual workshops.',
      '2026-09-12',
      '11:00',
      'Waterfront Park Pavilion, Seattle',
      'Food',
      200,
      '/assets/events/food_festival.png',
      organizerId
    );

    insertEvent.run(
      'Global Design Hackathon',
      'Collaborate with designers, artists, and front-end developers in a 36-hour sprint to redesign standard public services for accessibility and high-aesthetic usability. Prizes total $15,000.',
      '2026-10-05',
      '08:30',
      'Co-Lab Innovation Center, Chicago',
      'Design',
      150,
      '/assets/events/design_hackathon.png',
      organizerId
    );

    // 3. Seed some initial registrations
    const insertReg = db.prepare(`
      INSERT INTO registrations (user_id, event_id, registered_at, status)
      VALUES (?, ?, ?, ?)
    `);

    // Let's get the event IDs
    const eventsStmt = db.prepare('SELECT id, title FROM events');
    const eventsList = eventsStmt.all();

    const techEvent = eventsList.find(e => e.title.includes('Tech'));
    const artEvent = eventsList.find(e => e.title.includes('Art'));

    if (techEvent) {
      insertReg.run(sarahId, techEvent.id, new Date().toISOString(), 'confirmed');
      insertReg.run(johnId, techEvent.id, new Date().toISOString(), 'confirmed');
    }
    if (artEvent) {
      insertReg.run(sarahId, artEvent.id, new Date().toISOString(), 'confirmed');
    }

    console.log('Database seeded successfully!');
  }
}

// Database helper functions
export const query = {
  all: (sql, params = []) => {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },
  get: (sql, params = []) => {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  },
  run: (sql, params = []) => {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  }
};
