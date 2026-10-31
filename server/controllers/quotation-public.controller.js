import * as svc from '../services/quotation.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';

export const get = asyncHandler(async (req, res) => {
  const quotation = await svc.getQuotationForResponse(req.query.token);
  ok(res, {
    quotationNumber: quotation.quotationNumber,
    customerName: quotation.customer?.fullName,
    systemCapacityKw: quotation.systemCapacityKw,
    systemType: quotation.systemType,
    items: quotation.items,
    subtotal: quotation.subtotal,
    discountAmount: quotation.discountAmount,
    taxAmount: quotation.taxAmount,
    totalAmount: quotation.totalAmount,
    validUntil: quotation.validUntil,
    approvalStatus: quotation.approvalStatus,
    termsAndConditions: quotation.termsAndConditions,
  });
});

export const respond = asyncHandler(async (req, res) => {
  const quotation = await svc.respondToQuotation(
    req.body.token,
    Boolean(req.body.accept),
    req.body.note
  );
  ok(res, {
    approvalStatus: quotation.quotation.approvalStatus,
    orderNumber: quotation.order?.orderNumber,
    paymentLink: quotation.order?.razorpayPaymentLinkUrl,
  }, 'Quotation response recorded');
});
