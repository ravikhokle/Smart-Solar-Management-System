import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import { d } from '../../utils/format.js';

export default function EnquiriesPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data, meta, loading, reload } = useApi(
    () => api.get('/enquiries', { params: { q, status, page } }),
    [q, status, page]
  );
  const customers = useApi(() => api.get('/customers', { params: { limit: 100 } }), []);
  const users = useApi(() => api.get('/users/assignable').catch(() => ({ data: { data: [] } })), []);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (values) => {
    await api.post('/enquiries', { ...values, expectedCapacityKw: Number(values.expectedCapacityKw) });
    toast('success', 'Enquiry created');
    setOpen(false);
    reset();
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Enquiries"
        actions={<button className="btn-primary" onClick={() => setOpen(true)}>New enquiry</button>}
      />
      <div className="mb-4 flex gap-2">
        <input className="input max-w-xs" placeholder="Search customer" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['new', 'assigned', 'in_progress', 'survey_requested', 'converted', 'lost', 'closed'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <DataTable
        loading={loading}
        rows={data || []}
        page={page}
        total={meta?.total}
        limit={meta?.limit}
        onPage={setPage}
        emptyTitle="No enquiries yet."
        emptyAction={<button className="btn-primary" onClick={() => setOpen(true)}>Create an enquiry</button>}
        columns={[
          { key: 'customer', header: 'Customer', render: (r) => <Link className="text-solar-orange" to={`/enquiries/${r._id}`}>{r.customer?.fullName}</Link> },
          { key: 'systemType', header: 'System' },
          { key: 'expectedCapacityKw', header: 'kW' },
          { key: 'status', header: 'Status', render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: 'enquiryDate', header: 'Date', render: (r) => d(r.enquiryDate) },
        ]}
      />
      {open && (
        <Modal title="New enquiry" onClose={() => setOpen(false)}>
          <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
            <Field label="Customer">
              <select className="input" required {...register('customer')}>
                <option value="">Select</option>
                {(customers.data || []).map((c) => (
                  <option key={c._id} value={c._id}>{c.fullName} · {c.phone}</option>
                ))}
              </select>
            </Field>
            <Field label="System type">
              <select className="input" {...register('systemType')}>
                <option value="on_grid">On-Grid</option>
                <option value="off_grid">Off-Grid</option>
              </select>
            </Field>
            <Field label="Expected capacity kW">
              <select className="input" {...register('expectedCapacityKw')}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Electricity consumption">
              <textarea className="input" {...register('electricityConsumption')} />
            </Field>
            <Field label="Source">
              <select className="input" {...register('source')}>
                {['website', 'referral', 'walk_in', 'phone', 'campaign', 'other'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Assign sales executive">
              <select className="input" {...register('assignedTo')}>
                <option value="">Unassigned</option>
                {(users.data || []).filter((u) => ['admin', 'sales_executive'].includes(u.role)).map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Notes"><textarea className="input" {...register('notes')} /></Field>
            <button className="btn-primary" type="submit">Save enquiry</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
