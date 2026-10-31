import { Technician } from '../models/Technician.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { paginate, searchFilter } from '../utils/query.js';
import { createUser } from './user.service.js';

export async function listTechnicians({ q, availability, page, limit }) {
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = { ...searchFilter(q, ['name', 'phone', 'email']) };
  if (availability) filter.availability = availability;
  const [items, total] = await Promise.all([
    Technician.find(filter).populate('user', 'isActive role email').sort({ name: 1 }).skip(skip).limit(l),
    Technician.countDocuments(filter),
  ]);
  return { items, meta: { page: p, limit: l, total } };
}

export async function getTechnician(id) {
  const tech = await Technician.findById(id).populate('user');
  if (!tech) throw new ApiError(404, 'Technician not found');
  return tech;
}

export async function createTechnician(actor, payload) {
  if (payload.userId) {
    const user = await User.findById(payload.userId);
    if (!user) throw new ApiError(404, 'User not found');
    const exists = await Technician.findOne({ user: user._id });
    if (exists) throw new ApiError(409, 'Technician profile already exists for this user');
    return Technician.create({
      user: user._id,
      name: payload.name || user.name,
      phone: payload.phone || user.phone,
      email: payload.email || user.email,
      skills: payload.skills || [],
      availability: payload.availability || 'available',
    });
  }
  const user = await createUser(actor, {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    role: 'technician',
    skills: payload.skills,
  });
  return Technician.findOne({ user: user.id });
}

export async function updateTechnician(id, payload) {
  const tech = await Technician.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!tech) throw new ApiError(404, 'Technician not found');
  return tech;
}
