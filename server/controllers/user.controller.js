import * as userService from '../services/user.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const data = await userService.listUsers(req.query);
  ok(res, data.items, 'Users', data.meta);
});

export const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.user, req.body);
  created(res, user, 'User created');
});

export const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user, req.params.id, req.body);
  ok(res, user, 'User updated');
});

export const setActive = asyncHandler(async (req, res) => {
  const user = await userService.setUserActive(req.user, req.params.id, Boolean(req.body.isActive));
  ok(res, user, user.isActive ? 'User activated' : 'User deactivated');
});

export const remove = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.user, req.params.id);
  res.status(204).send();
});
