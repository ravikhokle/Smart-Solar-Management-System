import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';

export default function EnquiryDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useApi(() => api.get(`/enquiries/${id}`), [id]);
  if (loading || !data) return <TableSkeleton />;

  const convert = async () => {
    const res = await api.post(`/enquiries/${id}/convert-survey`);
    toast('success', 'Site survey created');
    navigate(`/surveys/${res.data.data._id}`);
  };

  return (
    <div>
      <PageHeader
        title={`Enquiry · ${data.customer?.fullName}`}
        actions={<button className="btn-primary" onClick={convert}>Convert to site survey</button>}
      />
      <div className="card space-y-2 p-5 text-sm">
        <div>Status <Badge tone={statusTone(data.status)}>{data.status}</Badge></div>
        <div>System {data.systemType} · {data.expectedCapacityKw} kW</div>
        <div>Source {data.source}</div>
        <div>Assigned {data.assignedTo?.name || 'Unassigned'}</div>
        <div>Consumption {data.electricityConsumption || '—'}</div>
        <div>Notes {data.notes || '—'}</div>
        <Link className="text-solar-orange" to={`/customers/${data.customer?._id}`}>Open customer</Link>
      </div>
    </div>
  );
}
