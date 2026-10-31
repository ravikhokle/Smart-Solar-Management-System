import api, { downloadFile } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import { money } from '../../utils/format.js';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function ReportsPage() {
  const { data, loading } = useApi(() => api.get('/finance/report'), []);
  if (loading || !data) return <TableSkeleton />;
  return (
    <div>
      <PageHeader
        title="Director reports"
        actions={
          <>
            <button className="btn-secondary" onClick={() => downloadFile('/finance/report.csv', 'director-report.csv')}>Export CSV</button>
            <button className="btn-secondary" onClick={() => downloadFile('/finance/report.pdf', 'director-report.pdf')}>Export PDF</button>
          </>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Weekly revenue" value={money(data.weekly.revenue)} />
        <Stat label="Weekly expenses" value={money(data.weekly.expenses)} />
        <Stat label="Monthly revenue" value={money(data.monthly.revenue)} />
        <Stat label="Monthly expenses" value={money(data.monthly.expenses)} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Block title="Profitable installations" rows={data.profitable} empty="No profitable completed installations yet." />
        <Block title="Loss-making installations" rows={data.lossMaking} empty="No loss-making completed installations." />
        <div className="card p-5">
          <h3 className="mb-3 font-semibold">Outstanding payments</h3>
          {!data.outstandingPayments?.length && <p className="text-sm text-solar-muted">No outstanding payments.</p>}
          {data.outstandingPayments?.map((o) => (
            <div key={o._id} className="flex justify-between text-sm">
              <span>{o.orderNumber} · {o.customer?.fullName}</span>
              <span>{money(o.orderAmount)}</span>
            </div>
          ))}
        </div>
        <div className="card p-5">
          <h3 className="mb-3 font-semibold">Subsidy applications</h3>
          {!data.subsidies?.length && <p className="text-sm text-solar-muted">No subsidy records.</p>}
          {data.subsidies?.map((s) => (
            <div key={s._id} className="flex justify-between text-sm">
              <span>{s.customer?.fullName}</span>
              <span>{s.applicationStatus}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase text-solar-muted">{label}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}

function Block({ title, rows, empty }) {
  return (
    <div className="card p-5">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {!rows?.length ? <EmptyState title={empty} /> : rows.map((r) => (
        <div key={r.installation._id} className="flex justify-between text-sm">
          <span>{r.installation.order?.orderNumber} · {r.installation.customer?.fullName}</span>
          <span>{money(r.estimatedProfit)}</span>
        </div>
      ))}
    </div>
  );
}
