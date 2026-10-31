import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApi } from '../../hooks/useApi.js';
import api from '../../services/api.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import { money, dt } from '../../utils/format.js';
import Skeleton from '../../components/common/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { useSelector } from 'react-redux';

const KPI = [
  ['Total customers', 'totalCustomers', '/customers'],
  ['Total enquiries', 'totalEnquiries', '/enquiries'],
  ['Pending site surveys', 'pendingSiteSurveys', '/surveys'],
  ['Approved quotations', 'approvedQuotations', '/quotations'],
  ['Active orders', 'activeOrders', '/orders'],
  ['Pending payments', 'pendingPayments', '/payments'],
  ['Completed installations', 'completedInstallations', '/installations'],
  ['Pending installations', 'pendingInstallations', '/installations'],
  ['Active warranties', 'activeWarranties', '/warranties'],
  ['Open service tickets', 'openServiceTickets', '/tickets'],
  ['Total revenue', 'totalRevenue', '/finance', true],
  ['Expenses', 'expenses', '/finance', true],
  ['Estimated profit', 'estimatedProfit', '/finance', true],
];

export default function DashboardPage() {
  const user = useSelector((s) => s.auth.user);
  const { data, loading } = useApi(() => api.get('/finance/dashboard'), []);
  if (loading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }
  const k = data.kpis;
  const isTechnician = user?.role === 'technician';
  const visibleKpis = isTechnician
    ? [
        ['Assigned installations', 'assignedInstallations', '/installations'],
        ['Pending installations', 'pendingInstallations', '/installations'],
        ['Completed installations', 'completedInstallations', '/installations'],
        ['Open service tickets', 'openServiceTickets', '/tickets'],
      ]
    : KPI;
  const revenue = (data.charts?.monthlyRevenue || []).map((r) => ({
    name: `${r._id.m}/${r._id.y}`,
    revenue: r.total,
  }));
  const expense = (data.charts?.monthlyExpenses || []).map((r) => ({
    name: `${r._id.m}/${r._id.y}`,
    expenses: r.total,
  }));
  const merged = {};
  revenue.forEach((r) => (merged[r.name] = { name: r.name, revenue: r.revenue, expenses: 0 }));
  expense.forEach((r) => (merged[r.name] = { ...(merged[r.name] || { name: r.name, revenue: 0 }), expenses: r.expenses }));
  const chartRows = Object.values(merged);
  const pie = (data.charts?.installationByStatus || []).map((s) => ({ name: s._id, value: s.count }));
  const colors = ['#F47C45', '#29343A', '#D99A35', '#23865B', '#7C817F', '#D9534F'];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Live figures from MongoDB. Empty modules stay empty until you add records." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visibleKpis.map(([label, key, to, isMoney]) => (
          <Link key={key} to={to} className="card p-4">
            <div className="text-xs uppercase tracking-wide text-solar-muted">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{isMoney ? money(k[key]) : k[key] || 0}</div>
          </Link>
        ))}
      </div>
      {!isTechnician && <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h3 className="mb-3 font-semibold">Revenue and expenses</h3>
          {chartRows.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartRows}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#F47C45" />
                <Bar dataKey="expenses" fill="#29343A" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No financial records yet." />
          )}
        </div>
        <div className="card p-4">
          <h3 className="mb-3 font-semibold">Installation status</h3>
          {pie.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {pie.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No installation records yet." />
          )}
        </div>
      </div>}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ListCard title="Recent enquiries" rows={data.recentEnquiries} empty="No enquiries yet." to={(r) => `/enquiries/${r._id}`} text={(r) => r.customer?.fullName || 'Enquiry'} sub={(r) => dt(r.createdAt)} />
        <ListCard title="Upcoming installations" rows={data.upcomingInstallations} empty="No upcoming installations." to={(r) => `/installations/${r._id}`} text={(r) => r.customer?.fullName} sub={(r) => dt(r.scheduledDate)} />
        <ListCard title="Pending payments" rows={data.pendingPaymentOrders} empty="No pending payments." to={(r) => `/orders/${r._id}`} text={(r) => r.customer?.fullName} sub={(r) => r.orderNumber} />
        <ListCard title="Low-stock products" rows={data.lowStock} empty="No low-stock products." to={(r) => `/inventory/${r._id}`} text={(r) => r.name} sub={(r) => `Available ${r.availableQuantity}`} />
        <ListCard title="Recent service complaints" rows={data.recentTickets} empty="No service tickets yet." to={(r) => `/tickets/${r._id}`} text={(r) => r.ticketNumber} sub={(r) => r.customer?.fullName} />
      </div>
    </div>
  );
}

function ListCard({ title, rows, empty, to, text, sub }) {
  return (
    <div className="card p-4">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {!rows?.length ? (
        <p className="text-sm text-solar-muted">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r._id}>
              <Link to={to(r)} className="flex items-center justify-between text-sm hover:text-solar-orange">
                <span>{text(r)}</span>
                <span className="text-solar-muted">{sub(r)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
