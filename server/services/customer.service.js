import { Customer } from '../models/Customer.js';
import { Enquiry } from '../models/Enquiry.js';
import { SiteSurvey } from '../models/SiteSurvey.js';
import { Order } from '../models/Order.js';
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
  if (phone) {
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '').trim();
    clauses.push({ phone: cleanPhone });
    if (phone.trim() !== cleanPhone) {
      clauses.push({ phone: phone.trim() });
    }
  }
  if (email && email.trim()) {
    clauses.push({ email: email.toLowerCase().trim() });
  }
  if (!clauses.length) return [];
  const filter = { $or: clauses };
  if (excludeId) filter._id = { $ne: excludeId };
  return Customer.find(filter).limit(5);
}

export async function createCustomer(actor, payload, { force } = {}) {
  const cleanName = (payload.fullName || '').trim();
  const cleanPhone = (payload.phone || '').replace(/[\s\-\(\)\+]/g, '').trim();
  const cleanEmail = payload.email ? payload.email.toLowerCase().trim() : undefined;
  const cleanAddress = (payload.address || '').trim();
  const cleanCity = (payload.city || '').trim();
  const cleanState = (payload.state || '').trim();
  const cleanPin = (payload.pinCode || '').trim();

  // Validations
  if (!cleanName || cleanName.length < 2) {
    throw new ApiError(400, 'Customer full name must be at least 2 characters');
  }
  if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 15) {
    throw new ApiError(400, 'Please enter a valid mobile number (10 to 15 digits)');
  }
  if (cleanEmail && !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
    throw new ApiError(400, 'Please enter a valid email address');
  }
  if (!cleanAddress) {
    throw new ApiError(400, 'Address is required');
  }
  if (!cleanCity) {
    throw new ApiError(400, 'City is required');
  }
  if (!cleanState) {
    throw new ApiError(400, 'State is required');
  }
  if (!cleanPin || cleanPin.length < 4) {
    throw new ApiError(400, 'Please enter a valid PIN code');
  }

  // Duplicate Check
  const dupes = await findDuplicates({ phone: cleanPhone, email: cleanEmail });
  if (dupes.length) {
    const isPhone = dupes.some((d) => d.phone === cleanPhone);
    const msg = isPhone
      ? `A customer with phone "${cleanPhone}" already exists (${dupes[0].fullName})`
      : `A customer with email "${cleanEmail}" already exists (${dupes[0].fullName})`;
    throw new ApiError(409, msg, [{ code: 'duplicate', customers: dupes }]);
  }

  try {
    const customer = await Customer.create({
      ...payload,
      fullName: cleanName,
      phone: cleanPhone,
      email: cleanEmail || undefined,
      address: cleanAddress,
      city: cleanCity,
      state: cleanState,
      pinCode: cleanPin,
      createdBy: actor._id,
    });

    await writeAudit({
      actor: actor._id,
      action: 'customer.create',
      entityType: 'Customer',
      entityId: customer._id,
    });

    return customer;
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'phone';
      throw new ApiError(409, `A customer with this ${field} already exists`);
    }
    throw err;
  }
}

export async function getCustomer(id) {
  const customer = await Customer.findById(id);
  if (!customer) throw new ApiError(404, 'Customer not found');
  return customer;
}

export async function updateCustomer(actor, id, payload) {
  const cleanPhone = payload.phone ? payload.phone.replace(/[\s\-\(\)\+]/g, '').trim() : undefined;
  const cleanEmail = payload.email ? payload.email.toLowerCase().trim() : undefined;

  if (cleanPhone || cleanEmail) {
    const dupes = await findDuplicates({
      phone: cleanPhone,
      email: cleanEmail,
      excludeId: id,
    });
    if (dupes.length) {
      const isPhone = dupes.some((d) => d.phone === cleanPhone);
      const msg = isPhone
        ? `Another customer already uses phone "${cleanPhone}"`
        : `Another customer already uses email "${cleanEmail}"`;
      throw new ApiError(409, msg);
    }
  }

  try {
    const updateData = { ...payload };
    if (payload.fullName) updateData.fullName = payload.fullName.trim();
    if (cleanPhone) updateData.phone = cleanPhone;
    if (cleanEmail !== undefined) updateData.email = cleanEmail || undefined;
    if (payload.address) updateData.address = payload.address.trim();
    if (payload.city) updateData.city = payload.city.trim();
    if (payload.state) updateData.state = payload.state.trim();
    if (payload.pinCode) updateData.pinCode = payload.pinCode.trim();

    const customer = await Customer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!customer) throw new ApiError(404, 'Customer not found');

    await writeAudit({
      actor: actor._id,
      action: 'customer.update',
      entityType: 'Customer',
      entityId: customer._id,
    });

    return customer;
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'phone';
      throw new ApiError(409, `Another customer already uses this ${field}`);
    }
    throw err;
  }
}

export async function deleteCustomer(actor, id) {
  const customer = await Customer.findById(id);
  if (!customer) throw new ApiError(404, 'Customer not found');
  const orders = await Order.countDocuments({ customer: id });
  if (orders) {
    throw new ApiError(400, 'Cannot delete a customer who already has orders');
  }
  await Enquiry.deleteMany({ customer: id });
  await SiteSurvey.deleteMany({ customer: id });
  await Customer.findByIdAndDelete(id);
  await writeAudit({
    actor: actor._id,
    action: 'customer.delete',
    entityType: 'Customer',
    entityId: id,
  });
}
