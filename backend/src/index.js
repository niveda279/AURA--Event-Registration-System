import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import authRouter from './routes/auth.js';
import eventsRouter from './routes/events.js';
import registrationsRouter from './routes/registrations.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize database
initDb();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static assets (event images, etc.) from backend 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/registrations', registrationsRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Event Registration backend is healthy.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
