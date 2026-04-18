const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(roles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer '))
      ? authHeader.split(' ')[1]
      : req.cookies?.token;

    if (!token) return res.status(401).json({ error: 'Authentication required' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'awadhmed_secret');
      req.user = decoded;
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};
