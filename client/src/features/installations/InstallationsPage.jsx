import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import { dt } from '../../utils/format.js';

export default function InstallationsPage() {
  const [params] = useSearchParams();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(Boolean(params.get('order')));
  const { data, meta, loading, reload } = useApi(() => api.get('/installations', { params: { page } }), [page]);
  const orders = useApi(() => api.get('/orders', { params: { limit: 100 } }), []);
  const techs = useApi(() => api.get('/installations/technicians', { params: { limit: 100 } }), []);
  const { register, handleSubmit } = useForm({ defaultValues: { order: params.get('order') || '' } });

  return (
    <div>
      <PageHeader title="Installation schedule" actions={<button className="btn-primary" onClick={() => setOpen(true)}>Schedule</button>} />
      <DataTable
        loading={loading}
        rows={data || []}
        page={page}
        total={meta?.total}
        limit={meta?.limit}
        onPage={setPage}
        emptyTitle="No installation records yet."
        emptyAction={<button className="btn-primary" onClick={() => setOpen(true)}>Schedule installation</button>}
        columns={[
          { key: 'customer', header: 'Customer', render: (r) => <Link className="text-solar-orange" to={`/installations/${r._id}`}>{r.customer?.fullName}</Link> },
          { key: 'order', header: 'Order', render: (r) => r.order?.orderNumber },
          { key: 'scheduledDate', header: 'When', render: (r) => dt(r.scheduledDate) },
          { key: 'status', header: 'Status', render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
        ]}
      />
      {open && (
        <Modal title="Schedule installation" onClose={() => setOpen(false)}>
          <form className="grid gap-3" onSubmit={handleSubmit(async (v) => {
            const selected = Array.isArray(v.technicians) ? v.technicians : [v.technicians].filter(Boolean);
            const res = await api.post('/installations', { ...v, technicians: selected });
            toast('success', 'Installation scheduled');
            setOpen(false);
            reload();
            window.location.href = `/installations/${res.data.data._id}`;
          })}>
            <Field label="Order">
              <select className="input" required {...register('order')}>
                <option value="">Select</option>
                {(orders.data || []).map((o) => <option key={o._id} value={o._id}>{o.orderNumber} · {o.customer?.fullName}</option>)}
              </select>
            </Field>
            <Field label="Scheduled date"><input className="input" type="datetime-local" required {...register('scheduledDate')} /></Field>
            <Field label="Technicians">
              <select className="input h-28" multiple {...register('technicians')}>
                {(techs.data || []).map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Notes"><textarea className="input" {...register('notes')} /></Field>
            <button className="btn-primary" type="submit">Schedule</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
