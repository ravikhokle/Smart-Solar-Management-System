import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Field from '../../components/common/Field.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';

export default function SurveyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, reload } = useApi(() => api.get(`/surveys/${id}`), [id]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      roofAreaSqft: '',
      roofDirection: '',
      roofTilt: '',
      cableDistanceM: '',
      roofCondition: '',
      availableSpaceSqft: '',
      proposedCapacityKw: '3',
      systemType: 'on_grid',
      technicalObservations: '',
      surveyDate: '',
      surveyor: '',
    },
  });
  const [files, setFiles] = useState([]);
  const [reject, setReject] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (data) {
      reset({
        roofAreaSqft: data.roofAreaSqft ?? '',
        roofDirection: data.roofDirection ?? '',
        roofTilt: data.roofTilt ?? '',
        cableDistanceM: data.cableDistanceM ?? '',
        roofCondition: data.roofCondition ?? '',
        availableSpaceSqft: data.availableSpaceSqft ?? '',
        proposedCapacityKw: String(data.proposedCapacityKw ?? data.enquiry?.expectedCapacityKw ?? 3),
        systemType: data.systemType || data.enquiry?.systemType || 'on_grid',
        technicalObservations: data.technicalObservations ?? '',
        surveyDate: data.surveyDate ? data.surveyDate.slice(0, 10) : '',
        surveyor: data.surveyor?._id || data.surveyor || '',
      });
    }
  }, [data, reset]);

  if (loading || !data) return <TableSkeleton />;

  const save = async (values, submit) => {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (v !== undefined && v !== null && typeof v !== 'object') fd.append(k, v);
    });
    if (submit) fd.append('submit', 'true');
    files.forEach((f) => fd.append('photographs', f));
    await api.patch(`/surveys/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    toast('success', submit ? 'Survey submitted' : 'Survey saved');
    reload();
  };

  return (
    <div>
      <PageHeader
        title={`Survey · ${data.customer?.fullName}`}
        subtitle={`Enquiry ${data.enquiry?._id || ''}`}
        actions={<Badge tone={statusTone(data.approvalStatus)}>{data.approvalStatus}</Badge>}
      />
      <form className="card grid gap-3 p-5 md:grid-cols-2" onSubmit={handleSubmit((v) => save(v, false))}>
        <Field label="Roof area (sqft)"><input className="input" type="number" {...register('roofAreaSqft')} /></Field>
        <Field label="Roof direction"><input className="input" {...register('roofDirection')} /></Field>
        <Field label="Roof tilt"><input className="input" {...register('roofTilt')} /></Field>
        <Field label="Cable distance (m)"><input className="input" type="number" {...register('cableDistanceM')} /></Field>
        <Field label="Roof condition"><input className="input" {...register('roofCondition')} /></Field>
        <Field label="Available space (sqft)"><input className="input" type="number" {...register('availableSpaceSqft')} /></Field>
        <Field label="Proposed capacity kW">
          <select className="input" {...register('proposedCapacityKw')}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
          </select>
        </Field>
        <Field label="System type">
          <select className="input" {...register('systemType')}>
            <option value="on_grid">On-Grid</option>
            <option value="off_grid">Off-Grid</option>
          </select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Technical observations">
            <textarea className="input" rows={4} {...register('technicalObservations')} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Site photographs">
            <input className="input" type="file" multiple accept="image/*" onChange={(e) => setFiles([...e.target.files])} />
          </Field>
          <div className="mt-3 flex flex-wrap gap-2">
            {(data.photographs || []).map((p) => (
              <img key={p.publicId || p.url} src={p.url} alt="" className="h-24 w-24 rounded-lg object-cover" />
            ))}
          </div>
        </div>
        {data.approvalStatus !== 'approved' && (
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button className="btn-secondary" type="submit">Save draft</button>
            <button className="btn-primary" type="button" onClick={handleSubmit((v) => save(v, true))}>Submit for approval</button>
          </div>
        )}
      </form>
      {data.approvalStatus === 'submitted' && (
        <div className="mt-4 flex gap-2">
          <button
            className="btn-primary"
            onClick={async () => {
              await api.post(`/surveys/${id}/decision`, { approve: true });
              toast('success', 'Survey approved');
              reload();
            }}
          >
            Approve survey
          </button>
          <button className="btn-danger" onClick={() => setReject(true)}>Reject</button>
        </div>
      )}
      {data.approvalStatus === 'approved' && (
        <button className="btn-primary mt-4" onClick={() => navigate(`/quotations?survey=${id}`)}>
          Generate quotation
        </button>
      )}
      {data.rejectionReason && <p className="mt-3 text-sm text-solar-error">{data.rejectionReason}</p>}
      {reject && (
        <ConfirmDialog
          title="Reject survey"
          message="Provide a reason. The survey can be edited and resubmitted."
          danger
          confirmLabel="Reject"
          onClose={() => setReject(false)}
          onConfirm={async () => {
            const typed = window.prompt('Rejection reason', reason);
            if (!typed) return;
            setReason(typed);
            await api.post(`/surveys/${id}/decision`, { approve: false, reason: typed });
            toast('success', 'Survey rejected');
            setReject(false);
            reload();
          }}
        />
      )}
    </div>
  );
}
