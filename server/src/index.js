import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

import attendanceRoutes from './routes/attendance.js';
import siteRoutes from './routes/sites.js';
import holidayRoutes from './routes/holidays.js';
import reportRoutes from './routes/reports.js';

dotenv.config();

const app = express();

// Middleware: CORS is restricted to the local Vite dev server by default,
// or to CORS_ORIGIN when set, instead of allowing any origin.
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler for unknown /api routes (JSON, not an HTML page)
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler: return JSON instead of crashing / hanging
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
