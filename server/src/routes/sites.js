import express from 'express';
import OJTSite from '../models/OJTSite.js';

const router = express.Router();

// GET /api/sites
router.get('/', async (req, res) => {
  try {
    const sites = await OJTSite.find();
    res.json(sites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sites
router.post('/', async (req, res) => {
  try {
    const newSite = new OJTSite(req.body);
    const savedSite = await newSite.save();
    res.status(201).json(savedSite);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
