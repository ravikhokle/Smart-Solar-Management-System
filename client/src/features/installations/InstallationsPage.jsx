import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import { dt } from '../../utils/format.js';
import RowActions from '../../components/common/RowActions.jsx';

export default function InstallationsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(Boolean(params.get('order')));
  const { data, meta, loading, reload } = useApi(() => api.get('/installations', { params: { page } }), [page]);
  const orders = useApi(() => api.get('/orders', { params: { limit: 100 } }), []);
  const techs = useApi(() => api.get('/installations/technicians', { params: { limit: 100 } }), []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      order: params.get('order') || '',
      scheduledDate: '',
      technicians: [],
      notes: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      const selected = Array.isArray(values.technicians) ? values.technicians : [values.technicians].filter(Boolean);
      const res = await api.post('/installations', { ...values, technicians: selected });
      toast('success', 'Installation scheduled successfully');
      setOpen(false);
      reset();
      reload();
      if (res.data?.data?._id) {
        navigate(`/installations/${res.data.data._id}`);
      }
    } catch (err) {
      // api interceptor
    }
  };

  return (
    <div>
      <PageHeader
        title="Installation schedule"
        subtitle="Schedule and track rooftop solar panel installations and commissioning."
        actions={<button className="btn-primary" onClick={() => setOpen(true)}>Schedule</button>}
      />
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
          {
            key: 'customer',
            header: 'Customer',
            render: (r) => (
              <Link className="font-semibold text-solar-orange hover:underline" to={`/installations/${r._id}`}>
                {r.customer?.fullName || '—'}
              </Link>
            ),
          },
          { key: 'order', header: 'Order', render: (r) => r.order?.orderNumber || '—' },
          { key: 'scheduledDate', header: 'Scheduled date', render: (r) => dt(r.scheduledDate) },
          {
            key: 'status',
            header: 'Status',
            render: (r) => <Badge tone={statusTone(r.status)}>{r.status?.replace(/_/g, ' ')}</Badge>,
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => <RowActions editTo={`/installations/${r._id}`} />,
          },
        ]}
      />
      {open && (
        <Modal
          title="Schedule installation"
          onClose={() => {
            if (!isSubmitting) {
              setOpen(false);
              reset();
            }
          }}
        >
          <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label="Order" error={errors.order?.message}>
              <select
                className={`input ${errors.order ? 'border-red-500' : ''}`}
                {...register('order', { required: 'Please select an order' })}
              >
                <option value="">Select order</option>
                {(orders.data || []).map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.orderNumber} · {o.customer?.fullName}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Scheduled date & time" error={errors.scheduledDate?.message}>
              <input
                className={`input ${errors.scheduledDate ? 'border-red-500' : ''}`}
                type="datetime-local"
                {...register('scheduledDate', { required: 'Please select a scheduled date and time' })}
              />
            </Field>

            <Field label="Assigned technicians" hint="Hold Ctrl / Cmd to select multiple technicians">
              <select className="input h-28" multiple {...register('technicians')}>
                {(techs.data || []).map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.availability})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Notes">
              <textarea
                className="input"
                rows={2}
                placeholder="Access details, gate timings, safety precautions..."
                {...register('notes')}
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="btn-secondary"
                disabled={isSubmitting}
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
              >
                Cancel
              </button>
              <button className="btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
