import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

function getTransporter() {
  if (!env.smtp.user || !env.smtp.pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

export function wrapEmail({ title, body, ctaLabel, ctaUrl }) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;background:#F7F3E9;font-family:Inter,Arial,sans-serif;color:#29343A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #E6E1D7;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#29343A;color:#FFFFFF;padding:18px 24px;font-weight:700;letter-spacing:0.04em;">HELIOSFLOW</td></tr>
        <tr><td style="padding:28px 24px;">
          <h1 style="margin:0 0 12px;font-size:20px;color:#29343A;">${title}</h1>
          <div style="color:#7C817F;font-size:14px;line-height:1.6;">${body}</div>
          ${
            ctaUrl
              ? `<p style="margin:24px 0 0;"><a href="${ctaUrl}" style="background:#F47C45;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;display:inline-block;">${ctaLabel || 'Open'}</a></p>`
              : ''
          }
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendEmail({ to, subject, title, body, ctaLabel, ctaUrl, attachments = [] }) {
  const tx = getTransporter();
  if (!tx || !to) {
    return { sent: false, reason: 'smtp_not_configured' };
  }
  try {
    await tx.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html: wrapEmail({ title: title || subject, body, ctaLabel, ctaUrl }),
      attachments,
    });
    return { sent: true };
  } catch (err) {
    console.error('Email send failed:', err.message);
    return { sent: false, reason: 'smtp_error' };
  }
}
