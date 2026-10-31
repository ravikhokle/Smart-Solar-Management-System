import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import { d } from '../../utils/format.js';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import RowActions from '../../components/common/RowActions.jsx';

export default function EnquiriesPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { data, meta, loading, reload } = useApi(
    () => api.get('/enquiries', { params: { q, status, page } }),
    [q, status, page]
  );
  const customers = useApi(() => api.get('/customers', { params: { limit: 100 } }), []);
  const users = useApi(() => api.get('/users/assignable').catch(() => ({ data: { data: [] } })), []);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      customer: '',
      systemType: 'on_grid',
      expectedCapacityKw: '3',
      electricityConsumption: '',
      source: 'walk_in',
      assignedTo: '',
      notes: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await api.post('/enquiries', { ...values, expectedCapacityKw: Number(values.expectedCapacityKw) });
      toast('success', 'Enquiry created successfully');
      setOpen(false);
      reset();
      reload();
    } catch (err) {
      // api interceptor displays toast
    }
  };

  const deleteEnquiry = async () => {
    try {
      await api.delete(`/enquiries/${deleteTarget._id}`);
      toast('success', 'Enquiry deleted successfully');
      setDeleteTarget(null);
      reload();
    } catch (err) {
      // api interceptor displays the backend error
    }
  };

  const convertToSurvey = async (enquiry) => {
    try {
      const response = await api.post(`/enquiries/${enquiry._id}/convert-survey`);
      toast('success', 'Site survey created');
      navigate(`/surveys/${response.data.data._id}`);
    } catch (err) {
      // api interceptor displays the backend error
    }
  };

  return (
    <div>
      <PageHeader
        title="Enquiries"
        actions={<button className="btn-primary" onClick={() => setOpen(true)}>New enquiry</button>}
      />
      <div className="mb-4 flex gap-2">
        <input
          className="input max-w-xs"
          placeholder="Search customer"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="input max-w-xs"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {['new', 'assigned', 'in_progress', 'survey_requested', 'converted', 'lost', 'closed'].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
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
          {
            key: 'customer',
            header: 'Customer',
            render: (r) => (
              <Link className="font-semibold text-solar-orange hover:underline" to={`/enquiries/${r._id}`}>
                {r.customer?.fullName || 'Unknown'}
              </Link>
            ),
          },
          {
            key: 'systemType',
            header: 'System',
            render: (r) => <span className="capitalize">{r.systemType?.replace(/_/g, ' ')}</span>,
          },
          {
            key: 'expectedCapacityKw',
            header: 'Capacity',
            render: (r) => `${r.expectedCapacityKw} kW`,
          },
          {
            key: 'status',
            header: 'Status',
            render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge>,
          },
          { key: 'enquiryDate', header: 'Date', render: (r) => d(r.enquiryDate) },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <div className="flex items-center gap-3 whitespace-nowrap">
                <RowActions editTo={`/enquiries/${r._id}`} onDelete={() => setDeleteTarget(r)} />
                <button
                  type="button"
                  className="text-sm font-medium text-solar-orange hover:underline"
                  onClick={() => convertToSurvey(r)}
                >
                  {['survey_requested', 'converted'].includes(r.status) ? 'Open survey' : 'Site survey'}
                </button>
              </div>
            ),
          },
        ]}
      />
      {open && (
        <Modal
          title="New enquiry"
          onClose={() => {
            if (!isSubmitting) {
              setOpen(false);
              reset();
            }
          }}
        >
          <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label="Customer" error={errors.customer?.message}>
              <select
                className={`input ${errors.customer ? 'border-red-500' : ''}`}
                {...register('customer', { required: 'Please select a customer' })}
              >
                <option value="">Select customer</option>
                {(customers.data || []).map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.fullName} · {c.phone}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="System type">
                <select className="input" {...register('systemType')}>
                  <option value="on_grid">On-Grid</option>
                  <option value="off_grid">Off-Grid</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </Field>

              <Field label="Expected capacity (kW)" error={errors.expectedCapacityKw?.message}>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  className={`input ${errors.expectedCapacityKw ? 'border-red-500' : ''}`}
                  placeholder="e.g. 3"
                  {...register('expectedCapacityKw', {
                    required: 'Capacity is required',
                    min: { value: 0.1, message: 'Must be greater than 0' },
                  })}
                />
              </Field>
            </div>

            <Field label="Electricity consumption">
              <textarea
                className="input"
                rows={2}
                placeholder="Average monthly bill or units consumed (optional)"
                {...register('electricityConsumption')}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Source">
                <select className="input" {...register('source')}>
                  {['walk_in', 'phone', 'website', 'referral', 'campaign', 'other'].map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </Field>

              <Field label="Assign sales executive">
                <select className="input" {...register('assignedTo')}>
                  <option value="">Unassigned</option>
                  {(users.data || [])
                    .filter((u) => ['admin', 'sales_executive'].includes(u.role))
                    .map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                </select>
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                className="input"
                rows={2}
                placeholder="Customer preferences, site notes..."
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
                {isSubmitting ? 'Saving enquiry...' : 'Save enquiry'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete enquiry?"
          message="This enquiry and its related survey data will be permanently deleted."
          confirmLabel="Delete enquiry"
          danger
          onClose={() => setDeleteTarget(null)}
          onConfirm={deleteEnquiry}
        />
      )}
    </div>
  );
}
