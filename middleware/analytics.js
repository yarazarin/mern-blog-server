const geoip = require('geoip-lite');
const Visit = require('../models/Visit');

const logVisit = async (req, res, next) => {
  // Only log GET requests, and not /auth routes, and not API routes that are internal
  if (req.method === 'GET' && !req.path.startsWith('/auth') && !req.path.includes('/api/')) {
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // Clean IP (remove ::ffff: for IPv4)
    let cleanIp = ip ? ip.replace(/^::ffff:/, '') : 'unknown';

    if (cleanIp !== 'unknown') {
      let geo = null;
      let displayCountry = null;
      let displayRegion = null;
      let displayCity = null;

      if (cleanIp === '127.0.0.1' || cleanIp === '::1') {
        // Localhost - use sample data for testing
        displayCountry = 'Local Development';
        displayRegion = 'Test';
        displayCity = 'Test City';
      } else {
        geo = geoip.lookup(cleanIp);
        displayCountry = geo ? geo.country : null;
        displayRegion = geo ? geo.region : null;
        displayCity = geo ? geo.city : null;
      }

      const visit = new Visit({
        ip: cleanIp,
        country: displayCountry,
        region: displayRegion,
        city: displayCity,
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
