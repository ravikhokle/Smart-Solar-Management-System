import { AuditLog } from '../models/AuditLog.js';

export async function writeAudit({ actor, action, entityType, entityId, metadata, ip }) {
  try {
    await AuditLog.create({ actor, action, entityType, entityId, metadata, ip });
  } catch (err) {
    console.error('Audit log write failed');
  }
}
