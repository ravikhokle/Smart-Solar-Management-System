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
import { money } from '../../utils/format.js';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import RowActions from '../../components/common/RowActions.jsx';

export default function QuotationsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(Boolean(params.get('survey')));
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { data, meta, loading, reload } = useApi(() => api.get('/quotations', { params: { page } }), [page]);
  const surveys = useApi(() => api.get('/surveys', { params: { status: 'approved', limit: 100 } }), []);
  const templates = useApi(() => api.get('/quotations/templates'), []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      survey: params.get('survey') || '',
      templateId: '',
      taxPercent: 18,
      discountAmount: 0,
    },
  });

  const onSubmit = async (values) => {
    try {
      const res = await api.post('/quotations', {
        survey: values.survey,
        templateId: values.templateId || undefined,
        taxPercent: Number(values.taxPercent || 0),
        discountAmount: Number(values.discountAmount || 0),
      });
      toast('success', 'Quotation created successfully');
      setOpen(false);
      reset();
      reload();
      if (res.data?.data?._id) {
        navigate(`/quotations/${res.data.data._id}`);
      }
    } catch (err) {
      // api interceptor
    }
  };

  const deleteQuotation = async () => {
    try {
      await api.delete(`/quotations/${deleteTarget._id}`);
      toast('success', 'Quotation deleted successfully');
      setDeleteTarget(null);
      reload();
    } catch (err) {
      // api interceptor displays the backend error
    }
  };

  return (
    <div>
      <PageHeader
        title="Quotations"
        subtitle="Generate itemized pricing proposals, Bill of Materials, and subsidy discounts."
        actions={<button className="btn-primary" onClick={() => setOpen(true)}>New quotation</button>}
      />
      <DataTable
        loading={loading}
        rows={data || []}
        page={page}
        total={meta?.total}
        limit={meta?.limit}
        onPage={setPage}
        emptyTitle="No quotations yet."
        emptyDescription="Approve a site survey, then generate a quotation with a bill of materials."
        emptyAction={<button className="btn-primary" onClick={() => setOpen(true)}>Generate quotation</button>}
        columns={[
          {
            key: 'quotationNumber',
            header: 'Number',
            render: (r) => (
              <Link className="font-semibold text-solar-orange hover:underline" to={`/quotations/${r._id}`}>
                {r.quotationNumber}
              </Link>
            ),
          },
          { key: 'customer', header: 'Customer', render: (r) => r.customer?.fullName || '—' },
          { key: 'totalAmount', header: 'Total', render: (r) => money(r.totalAmount) },
          {
            key: 'approvalStatus',
            header: 'Status',
            render: (r) => <Badge tone={statusTone(r.approvalStatus)}>{r.approvalStatus?.replace(/_/g, ' ')}</Badge>,
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => <RowActions editTo={`/quotations/${r._id}`} onDelete={() => setDeleteTarget(r)} />,
          },
        ]}
      />
      {open && (
        <Modal
          title="Create quotation"
          onClose={() => {
            if (!isSubmitting) {
              setOpen(false);
              reset();
            }
          }}
        >
          <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label="Approved survey" error={errors.survey?.message}>
              <select
                className={`input ${errors.survey ? 'border-red-500' : ''}`}
                {...register('survey', { required: 'Please select an approved site survey' })}
              >
                <option value="">Select approved survey</option>
                {(surveys.data || []).map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.customer?.fullName} · {s.proposedCapacityKw} kW ({s.systemType})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="System template (optional)">
              <select className="input" {...register('templateId')}>
                <option value="">Custom BOM on details page</option>
                {(templates.data || []).map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} · {t.capacityKw} kW {t.systemType}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="GST / Tax (%)" error={errors.taxPercent?.message}>
                <input
                  className={`input ${errors.taxPercent ? 'border-red-500' : ''}`}
                  type="number"
                  min="0"
                  max="100"
                  {...register('taxPercent', {
                    min: { value: 0, message: 'Tax cannot be negative' },
                    max: { value: 100, message: 'Tax cannot exceed 100%' },
                  })}
                />
              </Field>

              <Field label="Discount amount (₹)" error={errors.discountAmount?.message}>
                <input
                  className={`input ${errors.discountAmount ? 'border-red-500' : ''}`}
                  type="number"
                  min="0"
                  {...register('discountAmount', {
                    min: { value: 0, message: 'Discount cannot be negative' },
                  })}
                />
              </Field>
            </div>

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
                {isSubmitting ? 'Creating quotation...' : 'Create quotation'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete quotation?"
          message={`${deleteTarget.quotationNumber} will be permanently deleted.`}
          confirmLabel="Delete quotation"
          danger
          onClose={() => setDeleteTarget(null)}
          onConfirm={deleteQuotation}
        />
      )}
    </div>
  );
}
