import express from 'express';
import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import OJTSite from '../models/OJTSite.js';
import { getDistance } from '../utils/haversine.js';
import { differenceInMinutes } from 'date-fns';

const router = express.Router();

const WORK_MODES = ['onsite', 'wfh'];
const SESSIONS = ['AM', 'PM', 'WFH'];

function isValidLat(lat) {
  return typeof lat === 'number' && Number.isFinite(lat) && lat >= -90 && lat <= 90;
}
function isValidLng(lng) {
  return typeof lng === 'number' && Number.isFinite(lng) && lng >= -180 && lng <= 180;
}
function isValidLocation(location) {
  return location && isValidLat(location.lat) && isValidLng(location.lng);
}

// GET /api/attendance
router.get('/', async (req, res) => {
  try {
    const logs = await Attendance.find().sort({ clockIn: -1 }).populate('siteId');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attendance/active - today's open log (no clockOut), or null.
// Used after a page refresh so auto clock-out on leaving the geofence
// can still find the session that was started before the reload.
router.get('/active', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const log = await Attendance.findOne({
      clockOut: { $exists: false },
      clockIn: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ clockIn: -1 })
      .populate('siteId');
    // Also match logs where clockOut is explicitly null
    const openLog =
      log ||
      (await Attendance.findOne({
        clockOut: null,
        clockIn: { $gte: startOfDay, $lte: endOfDay },
      })
        .sort({ clockIn: -1 })
        .populate('siteId'));
    res.json(openLog || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance/clock-in
router.post('/clock-in', async (req, res) => {
  try {
    const { siteId, workMode, session, location, method } = req.body;

    if (!workMode || !WORK_MODES.includes(workMode)) {
      return res.status(400).json({ message: 'workMode must be onsite or wfh.' });
    }
    if (!session || !SESSIONS.includes(session)) {
      return res.status(400).json({ message: 'session must be AM, PM or WFH.' });
    }
    if (method && !['auto', 'manual'].includes(method)) {
      return res.status(400).json({ message: 'method must be auto or manual.' });
    }

    // Server-side geofence check (Fix 1): for onsite work the server,
    // not just the browser, must verify the user is inside the site radius.
    if (workMode === 'onsite') {
      if (!siteId || !mongoose.Types.ObjectId.isValid(siteId)) {
        return res.status(400).json({ message: 'siteId is required for onsite clock-in.' });
      }
      if (!isValidLocation(location)) {
        return res
          .status(400)
          .json({ message: 'A valid location (lat -90 to 90, lng -180 to 180) is required for onsite clock-in.' });
      }
      const site = await OJTSite.findById(siteId);
      if (!site) return res.status(404).json({ message: 'OJT site not found.' });
      const radius = site.radius_meters || 150;
      const distance = getDistance(location.lat, location.lng, site.location.lat, site.location.lng);
      if (distance > radius) {
        return res.status(403).json({
          message: `You are outside the geofence. You are ${Math.round(distance)}m from ${site.name}, but the allowed radius is ${radius}m.`,
          distanceMeters: Math.round(distance),
          radiusMeters: radius,
        });
      }
    } else if (siteId && !mongoose.Types.ObjectId.isValid(siteId)) {
      return res.status(400).json({ message: 'siteId is not a valid id.' });
    }

    // Check if already clocked in for this session today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Attendance.findOne({
      session,
      clockIn: { $gte: startOfDay, $lte: endOfDay },
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
      location,
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

    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'A valid sessionId is required.' });
    }
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
    if (!session || !SESSIONS.includes(session)) {
      return res.status(400).json({ message: 'Session type is required and must be AM, PM or WFH.' });
    }
    if (workMode && !WORK_MODES.includes(workMode)) {
      return res.status(400).json({ message: 'workMode must be onsite or wfh.' });
    }
    if (siteId && !mongoose.Types.ObjectId.isValid(siteId)) {
      return res.status(400).json({ message: 'siteId is not a valid id.' });
    }

    const clockInDate = new Date(clockIn);
    const clockOutDate = new Date(clockOut);

    if (Number.isNaN(clockInDate.getTime()) || Number.isNaN(clockOutDate.getTime())) {
      return res.status(400).json({ message: 'Clock-in and clock-out must be valid dates.' });
    }
    if (clockOutDate <= clockInDate) {
      return res.status(400).json({ message: 'Clock-out must be after clock-in.' });
    }

    let duration = differenceInMinutes(clockOutDate, clockInDate);

    // Apply lunch break deduction (1hr) — either from client or auto-detect
    const deduct = typeof lunchDeductMins === 'number' ? lunchDeductMins : 0;
    if (deduct < 0) return res.status(400).json({ message: 'lunchDeductMins cannot be negative.' });
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid attendance id.' });
    }
    const log = await Attendance.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Session not found' });

    if (!editReason) return res.status(400).json({ message: 'Edit reason is required' });

    if (clockIn) {
      const d = new Date(clockIn);
      if (Number.isNaN(d.getTime())) return res.status(400).json({ message: 'clockIn must be a valid date.' });
      log.clockIn = d;
    }
    if (clockOut) {
      const d = new Date(clockOut);
      if (Number.isNaN(d.getTime())) return res.status(400).json({ message: 'clockOut must be a valid date.' });
      if (d <= log.clockIn) return res.status(400).json({ message: 'Clock-out must be after clock-in.' });
      log.clockOut = d;
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

// DELETE /api/attendance/:id
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid attendance id.' });
    }
    const log = await Attendance.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
