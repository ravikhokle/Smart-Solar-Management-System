import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Expense } from '../models/Expense.js';
import { Customer } from '../models/Customer.js';
import { Enquiry } from '../models/Enquiry.js';
import { SiteSurvey } from '../models/SiteSurvey.js';
import { Quotation } from '../models/Quotation.js';
import { Installation } from '../models/Installation.js';
import { Warranty } from '../models/Warranty.js';
import { ServiceTicket } from '../models/ServiceTicket.js';
import { SubsidyApplication } from '../models/SubsidyApplication.js';
import { getSettings } from '../models/Setting.js';
import { paginate } from '../utils/query.js';
import { lowStock } from './inventory.service.js';

function startOf(period) {
  const d = new Date();
  if (period === 'week') {
    const day = d.getDay();
    d.setDate(d.getDate() - day);
  } else {
    d.setDate(1);
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function createExpense(actor, payload) {
  return Expense.create({ ...payload, recordedBy: actor._id });
}

export async function listExpenses({ page, limit, order }) {
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = {};
  if (order) filter.order = order;
  const [items, total] = await Promise.all([
    Expense.find(filter).populate('order', 'orderNumber').sort({ expenseDate: -1 }).skip(skip).limit(l),
    Expense.countDocuments(filter),
  ]);
  return { items, meta: { page: p, limit: l, total } };
}

export async function dashboard() {
  const [
    totalCustomers,
    totalEnquiries,
    pendingSurveys,
    approvedQuotations,
    activeOrders,
    completedInstallations,
    pendingInstallations,
    activeWarranties,
    openTickets,
    payments,
    expenses,
    recentEnquiries,
    upcomingInstallations,
    pendingPaymentOrders,
    recentTickets,
    low,
  ] = await Promise.all([
    Customer.countDocuments(),
    Enquiry.countDocuments(),
    SiteSurvey.countDocuments({ approvalStatus: { $in: ['draft', 'submitted'] } }),
    Quotation.countDocuments({ approvalStatus: 'accepted' }),
    Order.countDocuments({ installationStatus: { $nin: ['completed', 'cancelled'] } }),
    Installation.countDocuments({ status: 'completed' }),
    Installation.countDocuments({ status: { $in: ['scheduled', 'assigned', 'in_progress', 'on_hold'] } }),
    Warranty.countDocuments({ status: 'active' }),
    ServiceTicket.countDocuments({ status: { $nin: ['closed'] } }),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    Enquiry.find().populate('customer', 'fullName phone').sort({ createdAt: -1 }).limit(6),
    Installation.find({
      status: { $in: ['scheduled', 'assigned'] },
      scheduledDate: { $gte: new Date() },
    })
      .populate('customer', 'fullName')
      .populate('order', 'orderNumber')
      .sort({ scheduledDate: 1 })
      .limit(6),
    Order.find({ paymentStatus: { $in: ['pending', 'partial'] } })
      .populate('customer', 'fullName')
      .sort({ createdAt: -1 })
      .limit(6),
    ServiceTicket.find().populate('customer', 'fullName').sort({ createdAt: -1 }).limit(6),
    lowStock(),
  ]);

  const revenue = payments[0]?.total || 0;
  const expenseTotal = expenses[0]?.total || 0;
  const orders = await Order.find().select('orderAmount costSnapshot installationStatus');
  const estimatedProfit = orders.reduce((sum, o) => sum + (o.orderAmount - (o.costSnapshot || 0)), 0) - expenseTotal;
  const finalizedOrders = orders.filter((o) => o.installationStatus === 'completed');
  const finalizedProfit =
    finalizedOrders.reduce((sum, o) => sum + (o.orderAmount - (o.costSnapshot || 0)), 0) - expenseTotal;

  const pendingPaymentsAgg = await Order.aggregate([
    { $match: { paymentStatus: { $in: ['pending', 'partial'] } } },
    { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$orderAmount' } } },
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  const monthlyRevenue = await Payment.aggregate([
    { $match: { paymentDate: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { y: { $year: '$paymentDate' }, m: { $month: '$paymentDate' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ]);
  const monthlyExpenses = await Expense.aggregate([
    { $match: { expenseDate: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { y: { $year: '$expenseDate' }, m: { $month: '$expenseDate' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ]);

  const installationByStatus = await Installation.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  return {
    kpis: {
      totalCustomers,
      totalEnquiries,
      pendingSiteSurveys: pendingSurveys,
      approvedQuotations,
      activeOrders,
      pendingPayments: pendingPaymentsAgg[0]?.count || 0,
      completedInstallations,
      pendingInstallations,
      activeWarranties,
      openServiceTickets: openTickets,
      totalRevenue: revenue,
      expenses: expenseTotal,
      estimatedProfit,
      finalizedProfit,
    },
    charts: {
      monthlyRevenue,
      monthlyExpenses,
      installationByStatus,
    },
    recentEnquiries,
    upcomingInstallations,
    pendingPaymentOrders,
    lowStock: low,
    recentTickets,
  };
}

export async function directorReport() {
  const settings = await getSettings();
  const weekStart = startOf('week');
  const monthStart = startOf('month');
  const [weekPay, monthPay, weekExp, monthExp, installations] = await Promise.all([
    Payment.aggregate([
      { $match: { paymentDate: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { paymentDate: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { expenseDate: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { expenseDate: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Installation.find()
      .populate('order', 'orderNumber orderAmount costSnapshot')
      .populate('customer', 'fullName')
      .populate('technicians', 'name'),
  ]);

  const withProfit = [];
  for (const inst of installations) {
    const order = inst.order;
    if (!order) continue;
    const extra = await Expense.aggregate([
      { $match: { order: order._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const labour = (inst.labourHours || 0) * (settings.labourHourlyRate || 0);
    const profit = order.orderAmount - (order.costSnapshot || 0) - (extra[0]?.total || 0) - labour;
    withProfit.push({
      installation: inst,
      estimatedProfit: profit,
      finalized: inst.status === 'completed',
    });
  }

  const hours = await Installation.aggregate([
    { $unwind: '$technicians' },
    { $group: { _id: '$technicians', hours: { $sum: '$labourHours' } } },
  ]);

  const outstanding = await Order.find({ paymentStatus: { $in: ['pending', 'partial'] } }).populate(
    'customer',
    'fullName phone'
  );
  const subsidies = await SubsidyApplication.find()
    .populate('customer', 'fullName')
    .populate('order', 'orderNumber')
    .sort({ createdAt: -1 });

  return {
    weekly: { revenue: weekPay[0]?.total || 0, expenses: weekExp[0]?.total || 0 },
    monthly: { revenue: monthPay[0]?.total || 0, expenses: monthExp[0]?.total || 0 },
    profitable: withProfit.filter((x) => x.estimatedProfit >= 0 && x.finalized),
    lossMaking: withProfit.filter((x) => x.estimatedProfit < 0 && x.finalized),
    pendingInstallations: installations.filter((i) =>
      ['scheduled', 'assigned', 'in_progress', 'on_hold'].includes(i.status)
    ),
    technicianHours: hours,
    outstandingPayments: outstanding,
    subsidies,
    allInstallations: withProfit,
  };
}
