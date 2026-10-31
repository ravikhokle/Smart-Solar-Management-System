import authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 400, 'Please provide name, email, and password');
    }
    const result = await authService.register({ name, email, password, role, phone });
    return sendSuccess(res, 201, 'User registered successfully', result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password');
    }
    const result = await authService.login({ email, password });
    return sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    return sendError(res, 401, error.message);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id || req.user._id);
    return sendSuccess(res, 200, 'Current user profile retrieved', user);
  } catch (error) {
    next(error);
  }
};
