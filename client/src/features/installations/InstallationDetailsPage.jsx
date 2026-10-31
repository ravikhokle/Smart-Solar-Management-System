import { useParams } from 'react-router-dom';
import { useRef, useState } from 'react';
import api, { toast, downloadFile } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import Field from '../../components/common/Field.jsx';
import { dt } from '../../utils/format.js';

export default function InstallationDetailsPage() {
  const { id } = useParams();
  const { data, loading, reload } = useApi(() => api.get(`/installations/${id}`), [id]);
  const [notes, setNotes] = useState('');
  const [capacity, setCapacity] = useState('');
  const [hours, setHours] = useState('');
  const [confirmName, setConfirmName] = useState('');
  const [files, setFiles] = useState([]);
  const canvasRef = useRef(null);

  if (loading || !data) return <TableSkeleton />;

  const patch = async (payload, extraFiles) => {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined) fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
    });
    (extraFiles || files).forEach((f) => fd.append('photographs', f));
    await api.patch(`/installations/${id}`, fd);
    toast('success', 'Installation updated');
    reload();
  };

  const signature = () => canvasRef.current?.toDataURL('image/png');

  return (
    <div>
      <PageHeader
        title={`Installation · ${data.customer?.fullName}`}
        subtitle={data.order?.orderNumber}
        actions={
          <>
            <Badge tone={statusTone(data.status)}>{data.status}</Badge>
            <button className="btn-secondary" onClick={() => downloadFile(`/installations/${id}/report`, 'installation-report.pdf')}>PDF report</button>
          </>
        }
      />
      <div className="card space-y-2 p-5 text-sm">
        <div>Scheduled {dt(data.scheduledDate)}</div>
        <div>Start {dt(data.startTime)} · Complete {dt(data.completionTime)}</div>
        <div>Technicians {(data.technicians || []).map((t) => t.name).join(', ') || '—'}</div>
      </div>
      <div className="card mt-4 grid gap-3 p-5">
        <Field label="Notes"><textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} defaultValue={data.notes} /></Field>
        <Field label="Actual capacity kW"><input className="input" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></Field>
        <Field label="Labour hours"><input className="input" type="number" value={hours} onChange={(e) => setHours(e.target.value)} /></Field>
        <Field label="Testing notes"><textarea className="input" id="testing" defaultValue={data.testingNotes} /></Field>
        <Field label="Commissioning notes"><textarea className="input" id="commissioning" defaultValue={data.commissioningNotes} /></Field>
        <Field label="Photographs"><input className="input" type="file" multiple accept="image/*" onChange={(e) => setFiles([...e.target.files])} /></Field>
        <div className="flex flex-wrap gap-2">
          {(data.photographs || []).map((p) => <img key={p.url} src={p.url} alt="" className="h-20 w-20 rounded object-cover" />)}
        </div>
        <div>
          <div className="label">Customer signature</div>
          <canvas ref={canvasRef} width={360} height={120} className="rounded-lg border border-solar-border bg-white" onMouseDown={(e) => {
            const ctx = canvasRef.current.getContext('2d');
            ctx.strokeStyle = '#29343A';
            const move = (ev) => {
              const r = canvasRef.current.getBoundingClientRect();
              ctx.lineTo(ev.clientX - r.left, ev.clientY - r.top);
              ctx.stroke();
            };
            const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
            const r = canvasRef.current.getBoundingClientRect();
            ctx.beginPath();
            ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', up);
          }} />
          <Field label="Customer name"><input className="input mt-2" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} /></Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => patch({ status: 'in_progress', notes, actualCapacityKw: capacity, labourHours: hours, testingNotes: document.getElementById('testing').value, commissioningNotes: document.getElementById('commissioning').value })}>Start job</button>
          <button className="btn-secondary" onClick={() => patch({ customerConfirmation: { name: confirmName, signatureDataUrl: signature() } })}>Save confirmation</button>
          <button className="btn-primary" onClick={() => patch({ status: 'completed', notes, actualCapacityKw: capacity, labourHours: hours, testingNotes: document.getElementById('testing').value, commissioningNotes: document.getElementById('commissioning').value, customerConfirmation: { name: confirmName, signatureDataUrl: signature() } })}>Complete installation</button>
        </div>
      </div>
    </div>
  );
}
