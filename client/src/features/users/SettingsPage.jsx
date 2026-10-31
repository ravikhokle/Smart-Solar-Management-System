import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Field from '../../components/common/Field.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';

export default function SettingsPage() {
  const { data, loading } = useApi(() => api.get('/finance/settings'), []);
  const { register, handleSubmit, reset } = useForm();
  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);
  if (loading || !data) return <TableSkeleton />;
  return (
    <div>
      <PageHeader title="Settings" subtitle="Dispatch is blocked until the configured advance percentage is received." />
      <form className="card grid max-w-xl gap-3 p-5" onSubmit={handleSubmit(async (v) => {
        await api.patch('/finance/settings', {
          ...v,
          minAdvancePercentBeforeDispatch: Number(v.minAdvancePercentBeforeDispatch),
          defaultTaxPercent: Number(v.defaultTaxPercent),
          defaultQuotationValidityDays: Number(v.defaultQuotationValidityDays),
          labourHourlyRate: Number(v.labourHourlyRate || 0),
        });
        toast('success', 'Settings saved');
      })}>
        <Field label="Company name"><input className="input" {...register('companyName')} /></Field>
        <Field label="Address"><input className="input" {...register('companyAddress')} /></Field>
        <Field label="Phone"><input className="input" {...register('companyPhone')} /></Field>
        <Field label="Email"><input className="input" {...register('companyEmail')} /></Field>
        <Field label="GST number"><input className="input" {...register('gstNumber')} /></Field>
        <Field label="Min advance % before dispatch"><input className="input" type="number" {...register('minAdvancePercentBeforeDispatch')} /></Field>
        <Field label="Default tax %"><input className="input" type="number" {...register('defaultTaxPercent')} /></Field>
        <Field label="Quotation validity (days)"><input className="input" type="number" {...register('defaultQuotationValidityDays')} /></Field>
        <Field label="Labour hourly rate"><input className="input" type="number" {...register('labourHourlyRate')} /></Field>
        <Field label="Default terms"><textarea className="input" rows={4} {...register('defaultTerms')} /></Field>
        <button className="btn-primary w-fit" type="submit">Save settings</button>
      </form>
    </div>
  );
}
