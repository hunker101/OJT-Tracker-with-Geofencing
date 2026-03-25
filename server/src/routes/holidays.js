import express from 'express';
import Holiday from '../models/Holiday.js';

const router = express.Router();

// GET /api/holidays
router.get('/', async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/holidays
router.post('/', async (req, res) => {
  try {
    const newHoliday = new Holiday(req.body);
    const savedHoliday = await newHoliday.save();
    res.status(201).json(savedHoliday);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/holidays/:id
router.delete('/:id', async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) return res.status(404).json({ message: 'Holiday not found' });
    res.json({ message: 'Holiday deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
