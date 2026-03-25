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

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
