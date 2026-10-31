import User from '../models/User.js';
import mongoose from 'mongoose';
import { mockData } from '../utils/seedData.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthService {
  async register({ name, email, password, role, phone }) {
    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email });
      if (existing) {
        throw new Error('A user with this email already exists');
      }
      const user = await User.create({ name, email, password, role, phone });
      const token = user.getSignedJwtToken();
      return { user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }, token };
    } else {
      // In-memory fallback
      const existing = mockData.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        throw new Error('A user with this email already exists');
      }
      const newUser = {
        _id: 'usr_' + Date.now(),
        name,
        email,
        password,
        role: role || 'project_manager',
        phone: phone || '',
        isActive: true,
      };
      mockData.users.push(newUser);
      const token = jwt.sign(
        { id: newUser._id, role: newUser.role, email: newUser.email, name: newUser.name },
        process.env.JWT_SECRET || 'heliosflow_solar_management_jwt_secret_key_2026',
        { expiresIn: '7d' }
      );
      return { user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone }, token };
    }
  }

  async login({ email, password }) {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid email or password');
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }
      const token = user.getSignedJwtToken();
      return { user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }, token };
    } else {
      // Fallback
      const user = mockData.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user || user.password !== password) {
        throw new Error('Invalid email or password (Hint: use admin@heliosflow.com / password123)');
      }
      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email, name: user.name },
        process.env.JWT_SECRET || 'heliosflow_solar_management_jwt_secret_key_2026',
        { expiresIn: '7d' }
      );
      return { user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }, token };
    }
  }

  async getProfile(userId) {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      return user;
    }
    const user = mockData.users.find((u) => u._id === userId || u.email === userId);
    if (!user) {
      return mockData.users[0]; // Default to admin
    }
    return user;
  }
}

export default new AuthService();
