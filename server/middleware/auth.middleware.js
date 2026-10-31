import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendError } from '../utils/response.util.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Authentication token missing or invalid');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'heliosflow_solar_management_jwt_secret_key_2026'
    );

    // If User model is working in MongoDB, find user; otherwise use token claims for mock/fallback
    try {
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        return next();
      }
    } catch {
      // Fallback
    }

    req.user = {
      id: decoded.id,
      _id: decoded.id,
      name: decoded.name || 'Demo Solar Admin',
      email: decoded.email || 'admin@heliosflow.com',
      role: decoded.role || 'admin',
    };
    next();
  } catch (error) {
    return sendError(res, 401, 'Not authorized, token validation failed', error.message);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`
      );
    }
    next();
  };
};
