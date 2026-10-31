import * as svc from '../services/finance.service.js';
import * as subsidySvc from '../services/subsidy.service.js';
import { getSettings } from '../models/Setting.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/response.js';
import { streamPdf, drawKeyValues, money } from '../services/pdf.service.js';

export const dashboard = asyncHandler(async (req, res) => {
  ok(res, await svc.dashboard(req.user));
});

export const report = asyncHandler(async (req, res) => {
  ok(res, await svc.directorReport());
});

export const expenses = asyncHandler(async (req, res) => {
  const data = await svc.listExpenses(req.query);
  ok(res, data.items, 'Expenses', data.meta);
});

export const createExpense = asyncHandler(async (req, res) => {
  created(res, await svc.createExpense(req.user, req.body), 'Expense recorded');
});

export const subsidies = asyncHandler(async (req, res) => {
  const data = await subsidySvc.listSubsidies(req.query);
  ok(res, data.items, 'Subsidies', data.meta);
});

export const createSubsidy = asyncHandler(async (req, res) => {
  created(res, await subsidySvc.createSubsidy(req.user, req.body), 'Subsidy application created');
});

export const getSubsidy = asyncHandler(async (req, res) => {
  ok(res, await subsidySvc.getSubsidy(req.params.id));
});

export const updateSubsidy = asyncHandler(async (req, res) => {
  ok(res, await subsidySvc.updateSubsidy(req.params.id, req.body), 'Subsidy updated');
});

export const settings = asyncHandler(async (req, res) => {
  ok(res, await getSettings());
});

export const updateSettings = asyncHandler(async (req, res) => {
  const doc = await getSettings();
  Object.assign(doc, req.body);
  await doc.save();
  ok(res, doc, 'Settings saved');
});

export const notifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  ok(res, items);
});

export const readNotification = asyncHandler(async (req, res) => {
  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  ok(res, item);
});

export const reportCsv = asyncHandler(async (req, res) => {
  const data = await svc.directorReport();
  const lines = [
    ['Order', 'Customer', 'Estimated profit', 'Finalized'].join(','),
    ...data.allInstallations.map((row) =>
      [
        row.installation.order?.orderNumber,
        row.installation.customer?.fullName,
        row.estimatedProfit,
        row.finalized,
      ].join(',')
    ),
  ];
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="director-report.csv"');
  res.send(lines.join('\n'));
});

export const reportPdf = asyncHandler(async (req, res) => {
  const data = await svc.directorReport();
  await streamPdf(res, 'director-report.pdf', (doc) => {
    doc.moveDown(3);
    doc.fontSize(18).text('Director report');
    doc.moveDown();
    drawKeyValues(doc, [
      ['Weekly revenue', money(data.weekly.revenue)],
      ['Weekly expenses', money(data.weekly.expenses)],
      ['Monthly revenue', money(data.monthly.revenue)],
      ['Monthly expenses', money(data.monthly.expenses)],
      ['Profitable installations', data.profitable.length],
      ['Loss-making installations', data.lossMaking.length],
    ]);
  });
});
