export function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function paginate({ page = 1, limit = 10 } = {}) {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 20));
  return { page: p, limit: l, skip: (p - 1) * l };
}

export function searchFilter(q, fields) {
  if (!q) return {};
  const rx = new RegExp(escapeRegex(q).trim(), 'i');
  return { $or: fields.map((field) => ({ [field]: rx })) };
}
