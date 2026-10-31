import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import { d } from '../../utils/format.js';

export default function WarrantiesPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, meta, loading } = useApi(() => api.get('/warranties', { params: { q, status, page } }), [q, status, page]);
  return (
    <div>
      <PageHeader title="Warranties" subtitle="Warranties are created automatically from dispatched equipment and completed installations." />
      <div className="mb-4 flex gap-2">
        <input className="input max-w-xs" placeholder="Serial or certificate" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {['pending', 'active', 'expired', 'void'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <DataTable
        loading={loading}
        rows={data || []}
        page={page}
        total={meta?.total}
        limit={meta?.limit}
        onPage={setPage}
        emptyTitle="No warranty records yet."
        emptyDescription="Complete an installation after dispatching its equipment to create warranty records automatically."
        columns={[
          { key: 'serial', header: 'Serial', render: (r) => <Link className="text-solar-orange" to={`/warranties/${r._id}`}>{r.serial || r.certificateNumber || 'Pending'}</Link> },
          { key: 'customer', header: 'Customer', render: (r) => r.customer?.fullName },
          { key: 'product', header: 'Product', render: (r) => r.product?.name },
          { key: 'expiryDate', header: 'Expiry', render: (r) => d(r.expiryDate) },
          { key: 'status', header: 'Status', render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
        ]}
      />
    </div>
  );
}
