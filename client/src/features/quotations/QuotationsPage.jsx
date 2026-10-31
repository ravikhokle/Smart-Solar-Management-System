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
import { money } from '../../utils/format.js';

export default function QuotationsPage() {
  const [params] = useSearchParams();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(Boolean(params.get('survey')));
  const { data, meta, loading, reload } = useApi(() => api.get('/quotations', { params: { page } }), [page]);
  const surveys = useApi(() => api.get('/surveys', { params: { status: 'approved', limit: 100 } }), []);
  const templates = useApi(() => api.get('/quotations/templates'), []);
  const { register, handleSubmit } = useForm({
    defaultValues: { survey: params.get('survey') || '', taxPercent: 18 },
  });

  const onSubmit = async (values) => {
    const res = await api.post('/quotations', {
      survey: values.survey,
      templateId: values.templateId || undefined,
      taxPercent: Number(values.taxPercent),
      discountAmount: Number(values.discountAmount || 0),
    });
    toast('success', 'Quotation created');
    setOpen(false);
    reload();
    window.location.href = `/quotations/${res.data.data._id}`;
  };

  return (
    <div>
      <PageHeader
        title="Quotations"
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
          { key: 'quotationNumber', header: 'Number', render: (r) => <Link className="text-solar-orange" to={`/quotations/${r._id}`}>{r.quotationNumber}</Link> },
          { key: 'customer', header: 'Customer', render: (r) => r.customer?.fullName },
          { key: 'totalAmount', header: 'Total', render: (r) => money(r.totalAmount) },
          { key: 'approvalStatus', header: 'Status', render: (r) => <Badge tone={statusTone(r.approvalStatus)}>{r.approvalStatus}</Badge> },
        ]}
      />
      {open && (
        <Modal title="Create quotation" onClose={() => setOpen(false)}>
          <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
            <Field label="Approved survey">
              <select className="input" required {...register('survey')}>
                <option value="">Select</option>
                {(surveys.data || []).map((s) => (
                  <option key={s._id} value={s._id}>{s.customer?.fullName} · {s.proposedCapacityKw} kW</option>
                ))}
              </select>
            </Field>
            <Field label="System template (optional)">
              <select className="input" {...register('templateId')}>
                <option value="">Custom BOM on details page</option>
                {(templates.data || []).map((t) => (
                  <option key={t._id} value={t._id}>{t.name} · {t.capacityKw} kW {t.systemType}</option>
                ))}
              </select>
            </Field>
            <Field label="Tax %"><input className="input" type="number" {...register('taxPercent')} /></Field>
            <Field label="Discount"><input className="input" type="number" {...register('discountAmount')} /></Field>
            <button className="btn-primary" type="submit">Create</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
