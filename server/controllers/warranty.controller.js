import * as svc from '../services/warranty.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { streamPdf, drawKeyValues } from '../services/pdf.service.js';

export const list = asyncHandler(async (req, res) => {
  const data = await svc.listWarranties(req.query);
  ok(res, data.items, 'Warranties', data.meta);
});

export const get = asyncHandler(async (req, res) => {
  ok(res, await svc.getWarranty(req.params.id));
});

export const certificate = asyncHandler(async (req, res) => {
  const w = await svc.getWarranty(req.params.id);
  await streamPdf(res, `${w.certificateNumber || 'warranty'}.pdf`, (doc) => {
    doc.moveDown(3);
    doc.fontSize(18).text('Warranty certificate');
    doc.moveDown();
    drawKeyValues(doc, [
      ['Certificate', w.certificateNumber || 'Pending activation'],
      ['Customer', w.customer?.fullName],
      ['Product', w.product?.name],
      ['Serial', w.serial || '—'],
      ['Duration (months)', w.durationMonths],
      ['Start', w.startDate ? new Date(w.startDate).toLocaleDateString() : 'Pending'],
      ['Expiry', w.expiryDate ? new Date(w.expiryDate).toLocaleDateString() : 'Pending'],
      ['Status', w.status],
    ]);
  });
});
