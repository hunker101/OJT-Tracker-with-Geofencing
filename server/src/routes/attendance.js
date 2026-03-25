import express from 'express';
import Attendance from '../models/Attendance.js';
import { differenceInMinutes } from 'date-fns';

const router = express.Router();

// GET /api/attendance
router.get('/', async (req, res) => {
  try {
    const logs = await Attendance.find().sort({ clockIn: -1 }).populate('siteId');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance/clock-in
router.post('/clock-in', async (req, res) => {
  try {
    const { siteId, workMode, session, location, method } = req.body;
    
    // Check if already clocked in for this session today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const existing = await Attendance.findOne({
      session,
      clockIn: { $gte: startOfDay, $lte: endOfDay }
    });
    
    if (existing) {
      if (!existing.clockOut) {
         return res.status(400).json({ message: `Already clocked in for ${session} session.` });
      }
      return res.status(400).json({ message: `${session} session already completed for today.` });
    }

    const newLog = new Attendance({
      siteId,
      workMode,
      session,
      clockIn: new Date(),
      method,
      location
    });
    
    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/attendance/clock-out
router.post('/clock-out', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const log = await Attendance.findById(sessionId);
    if (!log) return res.status(404).json({ message: 'Session not found' });
    if (log.clockOut) return res.status(400).json({ message: 'Already clocked out' });

    log.clockOut = new Date();
    log.durationMinutes = differenceInMinutes(log.clockOut, log.clockIn);
    
    const updatedLog = await log.save();
    res.json(updatedLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/attendance/manual (Add a full past session manually)
router.post('/manual', async (req, res) => {
  try {
    const { siteId, workMode, session, clockIn, clockOut, lunchDeductMins, note } = req.body;

    if (!clockIn || !clockOut) {
      return res.status(400).json({ message: 'Clock-in and clock-out times are required.' });
    }
    if (!session) {
      return res.status(400).json({ message: 'Session type is required.' });
    }

    const clockInDate  = new Date(clockIn);
    const clockOutDate = new Date(clockOut);

    if (clockOutDate <= clockInDate) {
      return res.status(400).json({ message: 'Clock-out must be after clock-in.' });
    }

    let duration = differenceInMinutes(clockOutDate, clockInDate);

    // Apply lunch break deduction (1hr) — either from client or auto-detect
    const deduct = typeof lunchDeductMins === 'number' ? lunchDeductMins : 0;
    duration = Math.max(duration - deduct, 0);

    const newLog = new Attendance({
      siteId,
      workMode,
      session,
      clockIn: clockInDate,
      clockOut: clockOutDate,
      durationMinutes: duration,
      method: 'manual',
      edited: true,
      editReason: note || 'Manual past entry',
    });

    const saved = await newLog.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/attendance/:id (Manual Edit)
router.patch('/:id', async (req, res) => {
  try {
    const { clockIn, clockOut, editReason } = req.body;
    const log = await Attendance.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Session not found' });

    if (!editReason) return res.status(400).json({ message: 'Edit reason is required' });

    if (clockIn) log.clockIn = new Date(clockIn);
    if (clockOut) {
      log.clockOut = new Date(clockOut);
      log.durationMinutes = differenceInMinutes(log.clockOut, log.clockIn);
    }
    
    log.edited = true;
    log.editReason = editReason;
    log.method = 'manual';

    const updatedLog = await log.save();
    res.json(updatedLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
