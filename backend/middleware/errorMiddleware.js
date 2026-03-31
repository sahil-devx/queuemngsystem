function notFoundHandler(req, res) {
  return res.status(404).json({ message: 'Route not found' });
}

// Basic centralized error handler.
// Keep messages generic in production to avoid leaking internals.
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  const _ = next;
  const status = err?.statusCode || err?.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message || 'Error';

  if (status === 500 && process.env.NODE_ENV !== 'production') {
    return res.status(500).json({ message, error: String(err?.message || err) });
  }

  return res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };

