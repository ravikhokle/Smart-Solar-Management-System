import { Customer } from '../models/Customer.js';
import { ApiError } from '../utils/apiError.js';
import { paginate, searchFilter } from '../utils/query.js';
import { writeAudit } from './audit.service.js';

export async function listCustomers({ q, page, limit, city, customerType }) {
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = { ...searchFilter(q, ['fullName', 'phone', 'email']) };
  if (city) filter.city = new RegExp(city, 'i');
  if (customerType) filter.customerType = customerType;
  const [items, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
    Customer.countDocuments(filter),
  ]);
  return { items, meta: { page: p, limit: l, total } };
}

export async function findDuplicates({ phone, email, excludeId }) {
  const clauses = [];
  if (phone) clauses.push({ phone: phone.trim() });
  if (email) clauses.push({ email: email.toLowerCase().trim() });
  if (!clauses.length) return [];
  const filter = { $or: clauses };
  if (excludeId) filter._id = { $ne: excludeId };
  return Customer.find(filter).limit(5);
}

export async function createCustomer(actor, payload, { force } = {}) {
  if (!force) {
    const dupes = await findDuplicates({ phone: payload.phone, email: payload.email });
    if (dupes.length) {
      throw new ApiError(409, 'A customer with this phone or email already exists', [
        { code: 'duplicate', customers: dupes },
      ]);
    }
  }
  const customer = await Customer.create({ ...payload, createdBy: actor._id });
  await writeAudit({
    actor: actor._id,
    action: 'customer.create',
    entityType: 'Customer',
    entityId: customer._id,
  });
  return customer;
}

export async function getCustomer(id) {
  const customer = await Customer.findById(id);
  if (!customer) throw new ApiError(404, 'Customer not found');
  return customer;
}

export async function updateCustomer(actor, id, payload) {
  if (payload.phone || payload.email) {
    const dupes = await findDuplicates({
      phone: payload.phone,
      email: payload.email,
      excludeId: id,
    });
    if (dupes.length) throw new ApiError(409, 'Another customer already uses this phone or email');
  }
  const customer = await Customer.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!customer) throw new ApiError(404, 'Customer not found');
  await writeAudit({
    actor: actor._id,
    action: 'customer.update',
    entityType: 'Customer',
    entityId: customer._id,
  });
  return customer;
}
