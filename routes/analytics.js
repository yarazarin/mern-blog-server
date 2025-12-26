const express = require('express');
const Visit = require('../models/Visit');
const auth = require('../middleware/auth');

const router = express.Router();

// Get views per date
router.get('/views', auth, async (req, res) => {
  try {
    const { start, end } = req.query;
    let match = {};

    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }

    const views = await Visit.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json(views);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get country breakdown
router.get('/countries', auth, async (req, res) => {
  try {
    const { start, end } = req.query;
    let match = { country: { $ne: null } };

    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }

    const countries = await Visit.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(countries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get total views
router.get('/total', auth, async (req, res) => {
  try {
    const { start, end } = req.query;
    let match = {};

    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }

    const total = await Visit.countDocuments(match);
    res.json({ total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent visits
router.get('/recent', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const visits = await Visit.find().sort({ date: -1 }).limit(limit).select('-_id ip country city date path');
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
