import { z } from 'zod';
import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { validate } from '../middleware/validate.middleware.js';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const login = [
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const data = await authService.login(req.body);
    ok(res, data, 'Signed in');
  }),
];

export const me = asyncHandler(async (req, res) => {
  ok(res, req.user.toSafeJSON());
});

export const forgot = [
  validate(z.object({ body: z.object({ email: z.string().email() }) })),
  asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    ok(res, null, 'If an account exists, a reset email has been sent');
  }),
];

export const reset = [
  validate(z.object({ body: z.object({ token: z.string().min(10), password: z.string().min(8) }) })),
  asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body);
    ok(res, null, 'Password updated');
  }),
];

export const verify = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  ok(res, null, 'Email verified');
});

export const changePassword = [
  validate(
    z.object({
      body: z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) }),
    })
  ),
  asyncHandler(async (req, res) => {
    await authService.changePassword(req.user._id, req.body);
    ok(res, null, 'Password changed');
  }),
];

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  ok(res, user, 'Profile updated');
});
