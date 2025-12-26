const express = require('express');
const Visit = require('../models/Visit');
const auth = require('../middleware/auth');

const router = express.Router();

// Get views per date (excluding current admin's IP)
router.get('/views', auth, async (req, res) => {
  try {
    const { start, end } = req.query;

    // Get current admin's IP to exclude
    const adminIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                    req.headers['x-real-ip'] ||
                    req.headers['x-client-ip'] ||
                    req.ip ||
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress ||
                    (req.connection.socket ? req.connection.socket.remoteAddress : null);

    const cleanAdminIp = adminIp ? adminIp.replace(/^::ffff:/, '') : null;
    let match = cleanAdminIp ? { ip: { $ne: cleanAdminIp } } : {};

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

// Get country breakdown (excluding current admin's IP)
router.get('/countries', auth, async (req, res) => {
  try {
    const { start, end } = req.query;

    // Get current admin's IP to exclude
    const adminIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                    req.headers['x-real-ip'] ||
                    req.headers['x-client-ip'] ||
                    req.ip ||
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress ||
                    (req.connection.socket ? req.connection.socket.remoteAddress : null);

    const cleanAdminIp = adminIp ? adminIp.replace(/^::ffff:/, '') : null;
    let match = cleanAdminIp ? { ip: { $ne: cleanAdminIp }, country: { $ne: null } } : { country: { $ne: null } };

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

// Get total views (excluding current admin's IP)
router.get('/total', auth, async (req, res) => {
  try {
    const { start, end } = req.query;

    // Get current admin's IP to exclude
    const adminIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                    req.headers['x-real-ip'] ||
                    req.headers['x-client-ip'] ||
                    req.ip ||
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress ||
                    (req.connection.socket ? req.connection.socket.remoteAddress : null);

    const cleanAdminIp = adminIp ? adminIp.replace(/^::ffff:/, '') : null;
    let match = cleanAdminIp ? { ip: { $ne: cleanAdminIp } } : {};

    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }

    const total = await Visit.countDocuments(match);
    res.json({ total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent visits (excluding current admin's IP)
router.get('/recent', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get current admin's IP to exclude
    const adminIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                    req.headers['x-real-ip'] ||
                    req.headers['x-client-ip'] ||
                    req.ip ||
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress ||
                    (req.connection.socket ? req.connection.socket.remoteAddress : null);

    const cleanAdminIp = adminIp ? adminIp.replace(/^::ffff:/, '') : null;
    const query = cleanAdminIp ? { ip: { $ne: cleanAdminIp } } : {};

    const visits = await Visit.find(query).sort({ date: -1 }).limit(limit).select('-_id ip country city date path');
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get device type breakdown (excluding current admin's IP)
router.get('/devices', auth, async (req, res) => {
  try {
    const { start, end } = req.query;

    // Get current admin's IP to exclude
    const adminIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                    req.headers['x-real-ip'] ||
                    req.headers['x-client-ip'] ||
                    req.ip ||
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress ||
                    (req.connection.socket ? req.connection.socket.remoteAddress : null);

    const cleanAdminIp = adminIp ? adminIp.replace(/^::ffff:/, '') : null;
    let match = cleanAdminIp ? { ip: { $ne: cleanAdminIp } } : {};

    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }

    // Get visits with userAgent
    const visits = await Visit.find(match).select('userAgent');

    // Process device types in JavaScript
    const deviceCounts = {};

    visits.forEach(visit => {
      const userAgent = visit.userAgent || '';
      let device = 'Other';

      if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
        device = 'Mobile';
      } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        device = 'Tablet';
      } else if (userAgent.includes('Windows') || userAgent.includes('Mac') || userAgent.includes('Linux')) {
        device = 'Desktop';
      }

      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    // Convert to array format expected by client
    const devices = Object.entries(deviceCounts)
      .map(([device, count]) => ({ _id: device, count }))
      .sort((a, b) => b.count - a.count);

    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all visits with pagination (excluding current admin's IP)
router.get('/all-visits', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Get current admin's IP to exclude from results
    const adminIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                    req.headers['x-real-ip'] ||
                    req.headers['x-client-ip'] ||
                    req.ip ||
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress ||
                    (req.connection.socket ? req.connection.socket.remoteAddress : null);

    const cleanAdminIp = adminIp ? adminIp.replace(/^::ffff:/, '') : null;

    // Build query to exclude admin IP
    const query = cleanAdminIp ? { ip: { $ne: cleanAdminIp } } : {};

    const visits = await Visit.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .select('-_id ip country region city date path userAgent referrer');

    const total = await Visit.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      visits,
      pagination: {
        currentPage: page,
        totalPages,
        totalVisits: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
