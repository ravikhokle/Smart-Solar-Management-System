import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { sendEmail } from './email.service.js';

export async function notifyUsers({ userIds, title, body, type = 'info', link = '', email }) {
  const ids = (userIds || []).filter(Boolean);
  if (!ids.length) return;
  await Notification.insertMany(ids.map((user) => ({ user, title, body, type, link })));
  if (email) {
    const users = await User.find({ _id: { $in: ids } }).select('email');
    await Promise.all(
      users.map((u) =>
        sendEmail({
          to: u.email,
          subject: title,
          title,
          body,
          ctaUrl: email.ctaUrl,
          ctaLabel: email.ctaLabel,
        })
      )
    );
  }
}

export async function notifyRole(role, payload) {
  const users = await User.find({ role, isActive: true }).select('_id');
  await notifyUsers({ userIds: users.map((u) => u._id), ...payload });
}
