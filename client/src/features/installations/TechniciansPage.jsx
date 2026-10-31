import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';

export default function TechniciansPage() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data, meta, loading, reload } = useApi(() => api.get('/installations/technicians', { params: { page } }), [page]);
  const { register, handleSubmit, reset } = useForm();

  return (
    <div>
      <PageHeader title="Technicians" actions={<button className="btn-primary" onClick={() => setOpen(true)}>Add technician</button>} />
      <DataTable
        loading={loading}
        rows={data || []}
        page={page}
        total={meta?.total}
        limit={meta?.limit}
        onPage={setPage}
        emptyTitle="No technicians yet."
        emptyAction={<button className="btn-primary" onClick={() => setOpen(true)}>Add your first technician</button>}
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'phone', header: 'Phone' },
          { key: 'email', header: 'Email' },
          { key: 'availability', header: 'Availability', render: (r) => <Badge tone={statusTone(r.availability)}>{r.availability}</Badge> },
          { key: 'skills', header: 'Skills', render: (r) => (r.skills || []).join(', ') || '—' },
        ]}
      />
      {open && (
        <Modal title="New technician" onClose={() => setOpen(false)}>
          <form className="grid gap-3" onSubmit={handleSubmit(async (v) => {
            await api.post('/installations/technicians', { ...v, skills: String(v.skills || '').split(',').map((s) => s.trim()).filter(Boolean) });
            toast('success', 'Technician created');
            setOpen(false);
            reset();
            reload();
          })}>
            <Field label="Name"><input className="input" required {...register('name')} /></Field>
            <Field label="Email"><input className="input" type="email" required {...register('email')} /></Field>
            <Field label="Phone"><input className="input" required {...register('phone')} /></Field>
            <Field label="Login password"><input className="input" type="password" minLength={8} required {...register('password')} /></Field>
            <Field label="Skills (comma separated)"><input className="input" {...register('skills')} /></Field>
            <button className="btn-primary" type="submit">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
