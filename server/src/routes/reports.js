import express from 'express';
import Attendance from '../models/Attendance.js';
import Holiday from '../models/Holiday.js';
import { format, startOfDay, endOfDay, addDays, getWeek } from 'date-fns';

const router = express.Router();

router.get('/dtr', async (req, res) => {
  try {
    const logs = await Attendance.find().sort({ clockIn: 1 });
    const holidays = await Holiday.find();

    // Process logs into daily summary
    const dtrMap = {};

    logs.forEach(log => {
      const dateKey = format(log.clockIn, 'yyyy-MM-dd');

      if (!dtrMap[dateKey]) {
        dtrMap[dateKey] = {
             date: dateKey,
             amIn: null, amOut: null, pmIn: null, pmOut: null, wfhIn: null, wfhOut: null,
             dailyMinutes: 0,
             mode: log.workMode,
             isHoliday: false
        };
      }

      const entry = dtrMap[dateKey];

      // Assign times based on session
      if (log.session === 'AM') {
          entry.amIn = log.clockIn;
          entry.amOut = log.clockOut;
      } else if (log.session === 'PM') {
          entry.pmIn = log.clockIn;
          entry.pmOut = log.clockOut;
      } else if (log.session === 'WFH') {
          entry.wfhIn = log.clockIn;
          entry.wfhOut = log.clockOut;
      }

      if (log.durationMinutes) {
          entry.dailyMinutes += log.durationMinutes;
      }
    });

    // Tag holidays, and add a DTR row for a holiday that has no
    // attendance log that day, so the holiday is not invisible.
    holidays.forEach(h => {
        const hKey = format(h.date, 'yyyy-MM-dd');
        if (dtrMap[hKey]) {
            dtrMap[hKey].isHoliday = true;
            dtrMap[hKey].holidayName = h.name;
        } else {
            dtrMap[hKey] = {
                date: hKey,
                amIn: null, amOut: null, pmIn: null, pmOut: null, wfhIn: null, wfhOut: null,
                dailyMinutes: 0,
                mode: null,
                isHoliday: true,
                holidayName: h.name,
            };
        }
    });

    // Calculate total progress
    let totalMinutes = 0;
    const dtrArray = Object.values(dtrMap)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map(day => {
        if (!day.isHoliday) {
            totalMinutes += day.dailyMinutes;
        }
        day.runningTotalMinutes = totalMinutes;
        return day;
    });

    res.json({
        dtr: dtrArray,
        totalMinutes,
        totalHours: (totalMinutes / 60).toFixed(2),
        requiredHours: 486
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
