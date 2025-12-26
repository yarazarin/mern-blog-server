const geoip = require('geoip-lite');
const Visit = require('../models/Visit');

const logVisit = async (req, res, next) => {
  // Only log GET requests, and not /auth routes, and not API routes that are internal
  if (req.method === 'GET' && !req.path.startsWith('/auth') && !req.path.includes('/api/')) {
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // Clean IP (remove ::ffff: for IPv4)
    const cleanIp = ip ? ip.replace(/^::ffff:/, '') : 'unknown';

    if (cleanIp !== 'unknown' && (process.env.NODE_ENV === 'production' || (cleanIp !== '127.0.0.1' && cleanIp !== '::1'))) {
      const geo = geoip.lookup(cleanIp);
      const visit = new Visit({
        ip: cleanIp,
        country: geo ? geo.country : null,
        region: geo ? geo.region : null,
        city: geo ? geo.city : null,
        userAgent: req.get('User-Agent'),
        path: req.path,
        referrer: req.get('Referrer'),
      });
      try {
        await visit.save();
      } catch (error) {
        console.error('Error saving visit:', error);
      }
    }
  }
  next();
};

module.exports = logVisit;
