import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';

export default function TicketsPage() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data, meta, loading, reload } = useApi(() => api.get('/tickets', { params: { page } }), [page]);
  const customers = useApi(() => api.get('/customers', { params: { limit: 100 } }), []);
  const { register, handleSubmit, reset } = useForm();

  return (
    <div>
      <PageHeader title="Service tickets" actions={<button className="btn-primary" onClick={() => setOpen(true)}>New ticket</button>} />
      <DataTable
        loading={loading}
        rows={data || []}
        page={page}
        total={meta?.total}
        limit={meta?.limit}
        onPage={setPage}
        emptyTitle="No service tickets yet."
        emptyAction={<button className="btn-primary" onClick={() => setOpen(true)}>Open a ticket</button>}
        columns={[
          { key: 'ticketNumber', header: 'Ticket', render: (r) => <Link className="text-solar-orange" to={`/tickets/${r._id}`}>{r.ticketNumber}</Link> },
          { key: 'customer', header: 'Customer', render: (r) => r.customer?.fullName },
          { key: 'serial', header: 'Serial' },
          { key: 'warrantyStatus', header: 'Warranty', render: (r) => <Badge tone={statusTone(r.warrantyStatus)}>{r.warrantyStatus}</Badge> },
          { key: 'status', header: 'Status', render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
        ]}
      />
      {open && (
        <Modal title="New service ticket" onClose={() => setOpen(false)}>
          <form className="grid gap-3" onSubmit={handleSubmit(async (v) => {
            const res = await api.post('/tickets', v);
            toast('success', 'Ticket created');
            setOpen(false);
            reset();
            reload();
            window.location.href = `/tickets/${res.data.data._id}`;
          })}>
            <Field label="Serial number"><input className="input" {...register('serial')} /></Field>
            <Field label="Customer (if no serial)">
              <select className="input" {...register('customer')}>
                <option value="">Select</option>
                {(customers.data || []).map((c) => <option key={c._id} value={c._id}>{c.fullName}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className="input" {...register('priority')}>
                {['low', 'medium', 'high', 'urgent'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Complaint"><textarea className="input" required {...register('description')} /></Field>
            <button className="btn-primary" type="submit">Create ticket</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
