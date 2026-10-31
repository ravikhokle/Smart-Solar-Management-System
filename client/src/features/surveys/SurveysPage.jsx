import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import { d } from '../../utils/format.js';

export default function SurveysPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, meta, loading } = useApi(() => api.get('/surveys', { params: { status, page } }), [status, page]);
  return (
    <div>
      <PageHeader title="Site surveys" subtitle="Quotations can be created only after a survey is approved." />
      <select className="input mb-4 max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All</option>
        {['draft', 'submitted', 'approved', 'rejected'].map((s) => <option key={s}>{s}</option>)}
      </select>
      <DataTable
        loading={loading}
        rows={data || []}
        page={page}
        total={meta?.total}
        limit={meta?.limit}
        onPage={setPage}
        emptyTitle="No site surveys yet."
        emptyDescription="Convert an enquiry to create the first survey."
        columns={[
          { key: 'customer', header: 'Customer', render: (r) => <Link className="text-solar-orange" to={`/surveys/${r._id}`}>{r.customer?.fullName}</Link> },
          { key: 'proposedCapacityKw', header: 'kW' },
          { key: 'approvalStatus', header: 'Status', render: (r) => <Badge tone={statusTone(r.approvalStatus)}>{r.approvalStatus}</Badge> },
          { key: 'surveyDate', header: 'Date', render: (r) => d(r.surveyDate) },
        ]}
      />
    </div>
  );
}
