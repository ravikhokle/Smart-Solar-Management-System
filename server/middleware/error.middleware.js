import { ApiError } from '../utils/apiError.js';

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json({
    success: false,
    message: err.message && status !== 500 ? err.message : message,
    errors: err.errors || [],
  });
}
