import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import RowActions from '../../components/common/RowActions.jsx';

export default function TicketsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data, meta, loading, reload } = useApi(() => api.get('/tickets', { params: { page } }), [page]);
  const customers = useApi(() => api.get('/customers', { params: { limit: 100 } }), []);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      serial: '',
      customer: '',
      priority: 'medium',
      description: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      const res = await api.post('/tickets', values);
      toast('success', 'Ticket created successfully');
      setOpen(false);
      reset();
      reload();
      if (res.data?.data?._id) {
        navigate(`/tickets/${res.data.data._id}`);
      }
    } catch (err) {
      // api interceptor
    }
  };

  return (
    <div>
      <PageHeader
        title="Service tickets"
        subtitle="Track customer complaints, warranty repairs, and field technician dispatches."
        actions={<button className="btn-primary" onClick={() => setOpen(true)}>New ticket</button>}
      />
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
          {
            key: 'ticketNumber',
            header: 'Ticket',
            render: (r) => (
              <Link className="font-semibold text-solar-orange hover:underline" to={`/tickets/${r._id}`}>
                {r.ticketNumber}
              </Link>
            ),
          },
          { key: 'customer', header: 'Customer', render: (r) => r.customer?.fullName || '—' },
          { key: 'serial', header: 'Serial', render: (r) => r.serial || '—' },
          {
            key: 'warrantyStatus',
            header: 'Warranty',
            render: (r) => <Badge tone={statusTone(r.warrantyStatus)}>{r.warrantyStatus}</Badge>,
          },
          {
            key: 'status',
            header: 'Status',
            render: (r) => <Badge tone={statusTone(r.status)}>{r.status?.replace(/_/g, ' ')}</Badge>,
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => <RowActions editTo={`/tickets/${r._id}`} />,
          },
        ]}
      />
      {open && (
        <Modal
          title="New service ticket"
          onClose={() => {
            if (!isSubmitting) {
              setOpen(false);
              reset();
            }
          }}
        >
          <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label="Serial number (optional)">
              <input
                className="input uppercase"
                placeholder="Component serial number"
                {...register('serial')}
              />
            </Field>

            <Field label="Customer (if no serial)">
              <select className="input" {...register('customer')}>
                <option value="">Select customer</option>
                {(customers.data || []).map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.fullName} · {c.phone}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Priority">
              <select className="input" {...register('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </Field>

            <Field label="Issue / Complaint description" error={errors.description?.message}>
              <textarea
                className={`input ${errors.description ? 'border-red-500' : ''}`}
                rows={3}
                placeholder="Describe the fault or customer issue in detail..."
                {...register('description', {
                  required: 'Please describe the issue',
                  minLength: { value: 5, message: 'Description must be at least 5 characters' },
                })}
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
                {isSubmitting ? 'Creating ticket...' : 'Create ticket'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
