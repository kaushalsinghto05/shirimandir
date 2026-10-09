/**
 * Centralized Modulith Error Handler
 */
export function errorHandler(err, req, res, next) {
  console.error('[SERVER ERROR]', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}

/**
 * 404 Route Not Found Handler
 */
export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl} - Route not found`
  });
}
