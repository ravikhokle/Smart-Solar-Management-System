import { ApiError } from '../utils/apiError.js';

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle MongoDB duplicate key collision (E11000)
  if (err.code === 11000) {
    status = 409;
    const key = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    const val = err.keyValue ? err.keyValue[key] : '';
    message = `A record with this ${key}${val ? ` ("${val}")` : ''} already exists.`;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid format for parameter: ${err.path}`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    status = 400;
    const errors = Object.values(err.errors || {}).map((e) => e.message);
    message = errors.join(', ') || 'Validation error';
  }

  if (status === 500) {
    console.error('Unhandled server error:', err);
    message = 'Internal server error';
  }

  res.status(status).json({
    success: false,
    message,
    errors: err.errors || [],
  });
}
