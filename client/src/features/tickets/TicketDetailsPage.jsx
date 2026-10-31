import { useParams } from 'react-router-dom';
import { useState } from 'react';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import Field from '../../components/common/Field.jsx';
import { money } from '../../utils/format.js';

export default function TicketDetailsPage() {
  const { id } = useParams();
  const { data, loading, reload } = useApi(() => api.get(`/tickets/${id}`), [id]);
  const techs = useApi(() => api.get('/installations/technicians', { params: { limit: 100 } }), []);
  const [labour, setLabour] = useState(0);
  const [partName, setPartName] = useState('');
  const [partPrice, setPartPrice] = useState(0);
  const [confirmName, setConfirmName] = useState('');

  if (loading || !data) return <TableSkeleton />;

  const save = async (payload) => {
    await api.patch(`/tickets/${id}`, payload);
    toast('success', 'Ticket updated');
    reload();
  };

  return (
    <div>
      <PageHeader title={data.ticketNumber} actions={<Badge tone={statusTone(data.status)}>{data.status}</Badge>} />
      <div className="card space-y-2 p-5 text-sm">
        <div>Customer {data.customer?.fullName}</div>
        <div>Product {data.product?.name || '—'}</div>
        <div>Serial {data.serial || '—'}</div>
        <div>Warranty <Badge tone={statusTone(data.warrantyStatus)}>{data.warrantyStatus}</Badge></div>
        <div>Complaint {data.description}</div>
        <div>Billable {data.warrantyStatus === 'covered' ? 'Free (in warranty)' : money(data.billableTotal)}</div>
      </div>
      <div className="card mt-4 grid gap-3 p-5">
        <Field label="Assign technician">
          <select className="input" defaultValue={data.assignedTechnician?._id || ''} onChange={(e) => save({ assignedTechnician: e.target.value, status: 'assigned' })}>
            <option value="">Select</option>
            {(techs.data || []).map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className="input" defaultValue={data.status} onChange={(e) => save({ status: e.target.value })}>
            {['open', 'assigned', 'in_progress', 'waiting_for_parts', 'resolved', 'closed'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        {data.warrantyStatus !== 'covered' && (
          <>
            <Field label="Labour charges"><input className="input" type="number" value={labour} onChange={(e) => setLabour(e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <input className="input" placeholder="Part name" value={partName} onChange={(e) => setPartName(e.target.value)} />
              <input className="input" type="number" placeholder="Price" value={partPrice} onChange={(e) => setPartPrice(e.target.value)} />
            </div>
            <button className="btn-secondary" onClick={() => save({ labourCharges: Number(labour), repairParts: [...(data.repairParts || []), { name: partName, quantity: 1, unitPrice: Number(partPrice) }] })}>Add part / labour</button>
          </>
        )}
        <Field label="Resolution notes"><textarea className="input" defaultValue={data.resolutionNotes} id="res" /></Field>
        <Field label="Customer confirmation name"><input className="input" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} /></Field>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => save({ status: 'resolved', resolutionNotes: document.getElementById('res').value })}>Mark resolved</button>
          <button className="btn-primary" onClick={() => save({ customerConfirmation: { name: confirmName }, status: 'closed', resolutionNotes: document.getElementById('res').value })}>Close after confirmation</button>
        </div>
      </div>
    </div>
  );
}
