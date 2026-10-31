import * as techSvc from '../services/technician.service.js';
import * as instSvc from '../services/installation.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/response.js';
import { streamPdf, drawKeyValues } from '../services/pdf.service.js';

export const listTechnicians = asyncHandler(async (req, res) => {
  const data = await techSvc.listTechnicians(req.query);
  ok(res, data.items, 'Technicians', data.meta);
});

export const createTechnician = asyncHandler(async (req, res) => {
  created(res, await techSvc.createTechnician(req.user, req.body), 'Technician created');
});

export const getTechnician = asyncHandler(async (req, res) => {
  ok(res, await techSvc.getTechnician(req.params.id));
});

export const updateTechnician = asyncHandler(async (req, res) => {
  ok(res, await techSvc.updateTechnician(req.params.id, req.body), 'Technician updated');
});

export const deleteTechnician = asyncHandler(async (req, res) => {
  await techSvc.deleteTechnician(req.user, req.params.id);
  res.status(204).send();
});

export const listInstallations = asyncHandler(async (req, res) => {
  const data = await instSvc.listInstallations(req.query);
  ok(res, data.items, 'Installations', data.meta);
});

export const getInstallation = asyncHandler(async (req, res) => {
  ok(res, await instSvc.getInstallation(req.params.id));
});

export const schedule = asyncHandler(async (req, res) => {
  created(res, await instSvc.scheduleInstallation(req.user, req.body), 'Installation scheduled');
});

export const updateInstallation = asyncHandler(async (req, res) => {
  ok(
    res,
    await instSvc.updateInstallation(req.user, req.params.id, req.body, req.files),
    'Installation updated'
  );
});

export const reportPdf = asyncHandler(async (req, res) => {
  const inst = await instSvc.getInstallation(req.params.id);
  await streamPdf(res, `installation-${inst._id}.pdf`, (doc) => {
    doc.moveDown(3);
    doc.fontSize(18).text('Installation report');
    doc.moveDown();
    drawKeyValues(doc, [
      ['Order', inst.order?.orderNumber],
      ['Customer', inst.customer?.fullName],
      ['Status', inst.status],
      ['Scheduled', inst.scheduledDate ? new Date(inst.scheduledDate).toLocaleString() : '—'],
      ['Started', inst.startTime ? new Date(inst.startTime).toLocaleString() : '—'],
      ['Completed', inst.completionTime ? new Date(inst.completionTime).toLocaleString() : '—'],
      ['Actual capacity (kW)', inst.actualCapacityKw],
      ['Labour hours', inst.labourHours],
      ['Testing', inst.testingNotes],
      ['Commissioning', inst.commissioningNotes],
      ['Customer confirmation', inst.customerConfirmation?.confirmed ? inst.customerConfirmation.name : 'Pending'],
    ]);
  });
});
