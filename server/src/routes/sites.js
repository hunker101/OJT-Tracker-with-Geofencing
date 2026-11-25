import express from 'express';
import mongoose from 'mongoose';
import OJTSite from '../models/OJTSite.js';
import Attendance from '../models/Attendance.js';

const router = express.Router();

function validateSiteBody(body) {
  const { name, location, radius_meters } = body || {};
  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return 'Site name is required.';
  }
  if (location !== undefined) {
    if (typeof location.lat !== 'number' || location.lat < -90 || location.lat > 90) {
      return 'location.lat must be a number from -90 to 90.';
    }
    if (typeof location.lng !== 'number' || location.lng < -180 || location.lng > 180) {
      return 'location.lng must be a number from -180 to 180.';
    }
  }
  if (radius_meters !== undefined) {
    if (typeof radius_meters !== 'number' || !Number.isFinite(radius_meters) || radius_meters <= 0) {
      return 'radius_meters must be a number greater than 0.';
    }
  }
  return null;
}

// GET /api/sites
router.get('/', async (req, res) => {
  try {
    const sites = await OJTSite.find();
    res.json(sites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sites/:id
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid site id.' });
    }
    const site = await OJTSite.findById(req.params.id);
    if (!site) return res.status(404).json({ message: 'Site not found' });
    res.json(site);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sites
router.post('/', async (req, res) => {
  try {
    if (!req.body.name || !req.body.location) {
      return res.status(400).json({ message: 'Site name and location are required.' });
    }
    const error = validateSiteBody(req.body);
    if (error) return res.status(400).json({ message: error });
    const newSite = new OJTSite(req.body);
    const savedSite = await newSite.save();
    res.status(201).json(savedSite);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/sites/:id
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid site id.' });
    }
    const error = validateSiteBody(req.body);
    if (error) return res.status(400).json({ message: error });
    const site = await OJTSite.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!site) return res.status(404).json({ message: 'Site not found' });
    res.json(site);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/sites/:id - blocked if any attendance log references the site
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid site id.' });
    }
    const site = await OJTSite.findById(req.params.id);
    if (!site) return res.status(404).json({ message: 'Site not found' });
    const usedCount = await Attendance.countDocuments({ siteId: site._id });
    if (usedCount > 0) {
      return res.status(400).json({
        message: `Cannot delete ${site.name}: it has ${usedCount} attendance record(s). Delete those records first, or keep the site.`,
      });
    }
    await site.deleteOne();
    res.json({ message: 'Site deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
