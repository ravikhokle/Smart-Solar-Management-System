export function ok(res, data = null, message = 'Success', meta) {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(200).json(payload);
}

export function created(res, data = null, message = 'Created') {
  return res.status(201).json({ success: true, message, data });
}

export function fail(res, status, message, errors) {
  return res.status(status).json({ success: false, message, errors: errors || [] });
}
