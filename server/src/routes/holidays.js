import express from 'express';
import mongoose from 'mongoose';
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
    const { date, name, type } = req.body;
    if (!date || !name) {
      return res.status(400).json({ message: 'Holiday date and name are required.' });
    }
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({ message: 'Holiday date must be a valid date.' });
    }
    if (type && !['regular', 'special'].includes(type)) {
      return res.status(400).json({ message: 'Holiday type must be regular or special.' });
    }
    const newHoliday = new Holiday(req.body);
    const savedHoliday = await newHoliday.save();
    res.status(201).json(savedHoliday);
  } catch (err) {
    // Duplicate date (unique index) surfaces as a Mongo error; keep it as 400
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/holidays/:id
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid holiday id.' });
    }
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) return res.status(404).json({ message: 'Holiday not found' });
    res.json({ message: 'Holiday deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
