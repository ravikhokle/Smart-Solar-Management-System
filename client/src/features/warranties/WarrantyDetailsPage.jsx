import { useParams } from 'react-router-dom';
import api, { downloadFile } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import { d } from '../../utils/format.js';

export default function WarrantyDetailsPage() {
  const { id } = useParams();
  const { data, loading } = useApi(() => api.get(`/warranties/${id}`), [id]);
  if (loading || !data) return <TableSkeleton />;
  return (
    <div>
      <PageHeader
        title={data.certificateNumber || 'Warranty'}
        actions={<button className="btn-secondary" onClick={() => downloadFile(`/warranties/${id}/certificate`, 'warranty.pdf')}>Certificate PDF</button>}
      />
      <div className="card space-y-2 p-5 text-sm">
        <div>Status <Badge tone={statusTone(data.status)}>{data.status}</Badge></div>
        <div>Customer {data.customer?.fullName}</div>
        <div>Product {data.product?.name}</div>
        <div>Serial {data.serial || '—'}</div>
        <div>Duration {data.durationMonths} months from {data.activationMilestone}</div>
        <div>Start {d(data.startDate)} · Expiry {d(data.expiryDate)}</div>
      </div>
    </div>
  );
}
