import { User, USER_ROLES } from '../models/User.js';
import { Technician } from '../models/Technician.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';
import { createRawToken, hashToken } from '../utils/tokens.js';
import { sendEmail } from './email.service.js';
import { writeAudit } from './audit.service.js';
import { paginate, searchFilter } from '../utils/query.js';

export async function listUsers({ q, role, page, limit, isActive }) {
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = { ...searchFilter(q, ['name', 'email', 'phone']) };
  if (role) filter.role = role;
  if (isActive === 'true' || isActive === 'false') filter.isActive = isActive === 'true';
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
    User.countDocuments(filter),
  ]);
  return { items: items.map((u) => u.toSafeJSON()), meta: { page: p, limit: l, total } };
}

export async function createUser(actor, payload) {
  if (!USER_ROLES.includes(payload.role)) throw new ApiError(400, 'Invalid role');
  const exists = await User.findOne({ email: payload.email.toLowerCase() });
  if (exists) throw new ApiError(409, 'A user with this email already exists');
  const user = await User.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    phone: payload.phone,
    password: payload.password,
    role: payload.role,
    isActive: true,
    emailVerified: !env.emailVerificationEnabled,
  });

  if (payload.role === 'technician') {
    await Technician.create({
      user: user._id,
      name: user.name,
      phone: payload.phone || 'N/A',
      email: user.email,
      skills: payload.skills || [],
    });
  }

  if (env.emailVerificationEnabled) {
    const raw = createRawToken();
    user.emailVerificationToken = hashToken(raw);
    await user.save({ validateBeforeSave: false });
    await sendEmail({
      to: user.email,
      subject: 'Verify your HeliosFlow account',
      title: 'Verify your email',
      body: 'An administrator created your HeliosFlow account. Verify your email to activate sign-in.',
      ctaLabel: 'Verify email',
      ctaUrl: `${env.clientUrl}/verify-email?token=${raw}`,
    });
  } else {
    await sendEmail({
      to: user.email,
      subject: 'Your HeliosFlow account',
      title: 'Account created',
      body: `An administrator created a ${payload.role.replace('_', ' ')} account for you. Sign in with the password they provided, then change it from your profile.`,
      ctaLabel: 'Sign in',
      ctaUrl: `${env.clientUrl}/login`,
    });
  }

  await writeAudit({
    actor: actor._id,
    action: 'user.create',
    entityType: 'User',
    entityId: user._id,
  });
  return user.toSafeJSON();
}

export async function setUserActive(actor, id, isActive) {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'admin' && !isActive) {
    const admins = await User.countDocuments({ role: 'admin', isActive: true });
    if (admins <= 1) throw new ApiError(400, 'Cannot deactivate the last administrator');
  }
  user.isActive = isActive;
  await user.save();
  if (user.role === 'technician') {
    await Technician.findOneAndUpdate(
      { user: user._id },
      { employmentStatus: isActive ? 'active' : 'inactive' }
    );
  }
  await writeAudit({
    actor: actor._id,
    action: isActive ? 'user.activate' : 'user.deactivate',
    entityType: 'User',
    entityId: user._id,
  });
  return user.toSafeJSON();
}

export async function updateUser(actor, id, payload) {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  if (payload.name) user.name = payload.name;
  if (payload.phone !== undefined) user.phone = payload.phone;
  if (payload.role && payload.role !== user.role) {
    if (user.role === 'admin' && payload.role !== 'admin') {
      const admins = await User.countDocuments({ role: 'admin', isActive: true });
      if (admins <= 1) throw new ApiError(400, 'Cannot change the last administrator role');
    }
    user.role = payload.role;
  }
  await user.save();
  await writeAudit({ actor: actor._id, action: 'user.update', entityType: 'User', entityId: user._id });
  return user.toSafeJSON();
}
