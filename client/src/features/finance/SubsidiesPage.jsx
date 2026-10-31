import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import { money } from '../../utils/format.js';

export default function SubsidiesPage() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data, meta, loading, reload } = useApi(() => api.get('/finance/subsidies', { params: { page } }), [page]);
  const customers = useApi(() => api.get('/customers', { params: { limit: 100 } }), []);
  const orders = useApi(() => api.get('/orders', { params: { limit: 100 } }), []);
  const { register, handleSubmit, reset } = useForm();

  return (
    <div>
      <PageHeader
        title="Subsidy tracking"
        subtitle="Manual tracking only. There is no government API in this MVP."
        actions={<button className="btn-primary" onClick={() => setOpen(true)}>Add application</button>}
      />
      <DataTable
        loading={loading}
        rows={data || []}
        page={page}
        total={meta?.total}
        limit={meta?.limit}
        onPage={setPage}
        emptyTitle="No subsidy applications yet."
        columns={[
          { key: 'customer', header: 'Customer', render: (r) => r.customer?.fullName },
          { key: 'order', header: 'Order', render: (r) => r.order?.orderNumber || '—' },
          { key: 'applicationStatus', header: 'Status', render: (r) => <Badge tone={statusTone(r.applicationStatus)}>{r.applicationStatus}</Badge> },
          { key: 'subsidyAmount', header: 'Amount', render: (r) => money(r.subsidyAmount) },
        ]}
      />
      {open && (
        <Modal title="Subsidy application" onClose={() => setOpen(false)}>
          <form className="grid gap-3" onSubmit={handleSubmit(async (v) => {
            await api.post('/finance/subsidies', {
              ...v,
              eligible: v.eligible === 'true',
              subsidyAmount: Number(v.subsidyAmount || 0),
              documentsRequired: String(v.documentsRequired || '').split(',').map((s) => s.trim()).filter(Boolean),
            });
            toast('success', 'Subsidy application saved');
            setOpen(false);
            reset();
            reload();
          })}>
            <Field label="Customer">
              <select className="input" required {...register('customer')}>
                <option value="">Select</option>
                {(customers.data || []).map((c) => <option key={c._id} value={c._id}>{c.fullName}</option>)}
              </select>
            </Field>
            <Field label="Order">
              <select className="input" {...register('order')}>
                <option value="">None</option>
                {(orders.data || []).map((o) => <option key={o._id} value={o._id}>{o.orderNumber}</option>)}
              </select>
            </Field>
            <Field label="Eligible">
              <select className="input" {...register('eligible')}><option value="true">Yes</option><option value="false">No</option></select>
            </Field>
            <Field label="Application status">
              <select className="input" {...register('applicationStatus')}>
                {['not_started', 'draft', 'submitted', 'under_review', 'approved', 'rejected'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Subsidy amount"><input className="input" type="number" {...register('subsidyAmount')} /></Field>
            <Field label="Documents required"><input className="input" {...register('documentsRequired')} /></Field>
            <Field label="Remarks"><textarea className="input" {...register('remarks')} /></Field>
            <button className="btn-primary" type="submit">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
