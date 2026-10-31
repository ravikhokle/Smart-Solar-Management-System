import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { signToken, hashToken, createRawToken } from '../utils/tokens.js';
import { sendEmail } from './email.service.js';
import { writeAudit } from './audit.service.js';

export async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.isActive) throw new ApiError(401, 'Invalid email or password');
  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(401, 'Invalid email or password');
  if (env.emailVerificationEnabled && !user.emailVerified) {
    throw new ApiError(403, 'Please verify your email before signing in');
  }
  user.lastLoginAt = new Date();
  await user.save();
  const token = signToken(user);
  await writeAudit({ actor: user._id, action: 'login', entityType: 'User', entityId: user._id });
  return { token, user: user.toSafeJSON() };
}

export async function forgotPassword(email) {
  const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
  if (!user) return { sent: true };
  const raw = createRawToken();
  user.resetPasswordToken = hashToken(raw);
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });
  const url = `${env.clientUrl}/reset-password?token=${raw}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your HeliosFlow password',
    title: 'Password reset',
    body: 'You requested a password reset. This link expires in 60 minutes. If you did not request this, you can ignore the email.',
    ctaLabel: 'Reset password',
    ctaUrl: url,
  });
  return { sent: true };
}

export async function resetPassword({ token, password }) {
  const hashed = hashToken(token);
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpires');
  if (!user) throw new ApiError(400, 'Reset link is invalid or has expired');
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return { reset: true };
}

export async function verifyEmail(token) {
  const hashed = hashToken(token);
  const user = await User.findOne({ emailVerificationToken: hashed }).select('+emailVerificationToken');
  if (!user) throw new ApiError(400, 'Verification link is invalid');
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();
  return { verified: true };
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');
  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw new ApiError(400, 'Current password is incorrect');
  user.password = newPassword;
  await user.save();
}

export async function updateProfile(userId, data) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { name: data.name, phone: data.phone } },
    { new: true, runValidators: true }
  );
  return user.toSafeJSON();
}
