import * as svc from '../services/quotation.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/response.js';
import { streamPdf, drawKeyValues, drawTable, money } from '../services/pdf.service.js';

export const list = asyncHandler(async (req, res) => {
  const data = await svc.listQuotations(req.query);
  ok(res, data.items, 'Quotations', data.meta);
});

export const create = asyncHandler(async (req, res) => {
  created(res, await svc.createQuotation(req.user, req.body), 'Quotation created');
});

export const get = asyncHandler(async (req, res) => {
  ok(res, await svc.getQuotation(req.params.id));
});

export const update = asyncHandler(async (req, res) => {
  ok(res, await svc.updateQuotation(req.user, req.params.id, req.body), 'Quotation updated');
});

export const send = asyncHandler(async (req, res) => {
  ok(res, await svc.sendQuotation(req.user, req.params.id), 'Quotation sent');
});

export const decide = asyncHandler(async (req, res) => {
  ok(res, await svc.decideQuotation(req.user, req.params.id, req.body), 'Quotation updated');
});

export const templates = asyncHandler(async (req, res) => {
  ok(res, await svc.listTemplates());
});

export const saveTemplate = asyncHandler(async (req, res) => {
  created(res, await svc.saveTemplate(req.user, req.body), 'Template saved');
});

export const pdf = asyncHandler(async (req, res) => {
  const q = await svc.getQuotation(req.params.id);
  await streamPdf(res, `${q.quotationNumber}.pdf`, (doc, settings) => {
    doc.moveDown(3);
    doc.fillColor('#29343A').fontSize(18).text(`Quotation ${q.quotationNumber}`);
    doc.moveDown();
    drawKeyValues(doc, [
      ['Customer', q.customer?.fullName],
      ['Phone', q.customer?.phone],
      ['System', `${q.systemCapacityKw} kW ${q.systemType?.replace('_', '-')}`],
      ['Valid until', q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '—'],
      ['Status', q.approvalStatus],
    ]);
    doc.moveDown();
    drawTable(
      doc,
      ['Item', 'Qty', 'Unit', 'Amount'],
      q.items.map((i) => [i.name, i.quantity, money(i.unitPrice), money(i.quantity * i.unitPrice)])
    );
    doc.moveDown();
    drawKeyValues(doc, [
      ['Subtotal', money(q.subtotal)],
      ['Discount', money(q.discountAmount)],
      ['Tax', money(q.taxAmount)],
      ['Total', money(q.totalAmount)],
    ]);
    doc.moveDown();
    doc.fontSize(9).fillColor('#7C817F').text(q.termsAndConditions || settings.defaultTerms);
  });
});
