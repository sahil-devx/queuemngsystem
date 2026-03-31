function requireRole(...roles) {
  const allowed = roles.flat();

  return function roleGuard(req, res, next) {
    const userRole = req.user?.role;
    if (!userRole) return res.status(401).json({ message: 'Unauthorized' });

    if (!allowed.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }

    return next();
  };
}

module.exports = { requireRole };

