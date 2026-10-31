import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import { d } from '../../utils/format.js';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import RowActions from '../../components/common/RowActions.jsx';

export default function SurveysPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { data, meta, loading, reload } = useApi(() => api.get('/surveys', { params: { status, page } }), [status, page]);
  const deleteSurvey = async () => {
    try {
      await api.delete(`/surveys/${deleteTarget._id}`);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      // api interceptor displays the backend error
    }
  };
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
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => <RowActions editTo={`/surveys/${r._id}`} onDelete={() => setDeleteTarget(r)} />,
          },
        ]}
      />
      {deleteTarget && (
        <ConfirmDialog
          title="Delete site survey?"
          message="This survey will be permanently deleted."
          confirmLabel="Delete survey"
          danger
          onClose={() => setDeleteTarget(null)}
          onConfirm={deleteSurvey}
        />
      )}
    </div>
  );
}
