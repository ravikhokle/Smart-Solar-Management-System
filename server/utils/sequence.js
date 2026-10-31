import { Counter } from '../models/Counter.js';

export async function nextNumber(prefix, session) {
  const year = new Date().getFullYear();
  const key = `${prefix}-${year}`;
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, session }
  );
  return `${prefix}-${year}-${String(doc.seq).padStart(4, '0')}`;
}
