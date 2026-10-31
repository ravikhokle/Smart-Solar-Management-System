import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(null);
  const { data, meta, loading, reload } = useApi(() => api.get('/users', { params: { page } }), [page]);
  const { register, handleSubmit, reset } = useForm();

  return (
    <div>
      <PageHeader title="User management" subtitle="Registration is not public. Only administrators can create accounts." actions={<button className="btn-primary" onClick={() => setOpen(true)}>Create user</button>} />
      <DataTable
        loading={loading}
        rows={data || []}
        page={page}
        total={meta?.total}
        limit={meta?.limit}
        onPage={setPage}
        emptyTitle="No users besides bootstrap may appear yet."
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'email', header: 'Email' },
          { key: 'role', header: 'Role', render: (r) => <Badge>{r.role}</Badge> },
          { key: 'isActive', header: 'Status', render: (r) => <Badge tone={statusTone(r.isActive ? 'active' : 'cancelled')}>{r.isActive ? 'active' : 'inactive'}</Badge> },
          {
            key: 'actions',
            header: '',
            render: (r) => (
              <button className="btn-secondary" onClick={() => setTarget(r)}>{r.isActive ? 'Deactivate' : 'Activate'}</button>
            ),
          },
        ]}
      />
      {open && (
        <Modal title="Create user" onClose={() => setOpen(false)}>
          <form className="grid gap-3" onSubmit={handleSubmit(async (v) => {
            await api.post('/users', v);
            toast('success', 'User created');
            setOpen(false);
            reset();
            reload();
          })}>
            <Field label="Name"><input className="input" required {...register('name')} /></Field>
            <Field label="Email"><input className="input" type="email" required {...register('email')} /></Field>
            <Field label="Phone"><input className="input" {...register('phone')} /></Field>
            <Field label="Password"><input className="input" type="password" minLength={8} required {...register('password')} /></Field>
            <Field label="Role">
              <select className="input" {...register('role')}>
                <option value="sales_executive">Sales executive</option>
                <option value="warehouse_manager">Warehouse manager</option>
                <option value="technician">Technician</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            <button className="btn-primary" type="submit">Create</button>
          </form>
        </Modal>
      )}
      {target && (
        <ConfirmDialog
          title={target.isActive ? 'Deactivate account' : 'Activate account'}
          message={`${target.name} will ${target.isActive ? 'lose' : 'regain'} access immediately.`}
          danger={target.isActive}
          onClose={() => setTarget(null)}
          onConfirm={async () => {
            await api.patch(`/users/${target.id || target._id}/active`, { isActive: !target.isActive });
            toast('success', 'Account updated');
            setTarget(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
