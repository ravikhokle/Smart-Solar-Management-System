import crypto from 'crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

function assertConfigured() {
  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    throw new ApiError(
      503,
      'Razorpay payment links are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
    );
  }
  if (env.razorpay.mode !== 'test' || !env.razorpay.keyId.startsWith('rzp_test_')) {
    throw new ApiError(503, 'Only Razorpay test mode is enabled for this environment.');
  }
}

export async function createPaymentLink({ order, customer }) {
  assertConfigured();
  const auth = Buffer.from(`${env.razorpay.keyId}:${env.razorpay.keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(Number(order.orderAmount) * 100),
      currency: 'INR',
      accept_partial: false,
      description: `Solar order ${order.orderNumber}`,
      customer: {
        name: customer.fullName,
        email: customer.email,
        contact: customer.phone || undefined,
      },
      notify: { sms: false, email: false },
      reminder_enable: true,
      notes: { orderId: String(order._id), orderNumber: order.orderNumber },
    }),
  });
  const body = await response.json();
  if (!response.ok || !body.id || !body.short_url) {
    throw new ApiError(502, `Razorpay payment link creation failed: ${body.error?.description || 'Unknown error'}`);
  }
  return { id: body.id, url: body.short_url };
}

export async function getPaymentLinkPayments(paymentLinkId) {
  assertConfigured();
  const auth = Buffer.from(`${env.razorpay.keyId}:${env.razorpay.keySecret}`).toString('base64');
  const linkResponse = await fetch(
    `https://api.razorpay.com/v1/payment_links/${encodeURIComponent(paymentLinkId)}`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  const link = await linkResponse.json();
  if (!linkResponse.ok) {
    throw new ApiError(502, `Razorpay payment-link lookup failed: ${link.error?.description || 'Unknown error'}`);
  }
  return { link, payments: link.payments || [] };
}

export function verifyWebhookSignature(rawBody, signature) {
  if (!env.razorpay.webhookSecret || !signature) return false;
  const expected = crypto.createHmac('sha256', env.razorpay.webhookSecret).update(rawBody).digest('hex');
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
