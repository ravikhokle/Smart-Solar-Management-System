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
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'sales_executive',
    },
  });

  const onSubmit = async (values) => {
    try {
      await api.post('/users', values);
      toast('success', 'User account created successfully');
      setOpen(false);
      reset();
      reload();
    } catch (err) {
      // api interceptor will display toast
    }
  };

  return (
    <div>
      <PageHeader
        title="User management"
        subtitle="Registration is not public. Only administrators can create accounts."
        actions={<button className="btn-primary" onClick={() => setOpen(true)}>Create user</button>}
      />
      <DataTable
        loading={loading}
        rows={data || []}
        page={page}
        total={meta?.total}
        limit={meta?.limit}
        onPage={setPage}
        emptyTitle="No users yet."
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'email', header: 'Email' },
          { key: 'role', header: 'Role', render: (r) => <Badge>{r.role?.replace(/_/g, ' ')}</Badge> },
          {
            key: 'isActive',
            header: 'Status',
            render: (r) => (
              <Badge tone={statusTone(r.isActive ? 'active' : 'cancelled')}>
                {r.isActive ? 'active' : 'inactive'}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: '',
            render: (r) => (
              <button className="btn-secondary text-xs" onClick={() => setTarget(r)}>
                {r.isActive ? 'Deactivate' : 'Activate'}
              </button>
            ),
          },
        ]}
      />
      {open && (
        <Modal
          title="Create user"
          onClose={() => {
            if (!isSubmitting) {
              setOpen(false);
              reset();
            }
          }}
        >
          <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label="Full name" error={errors.name?.message}>
              <input
                className={`input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g. Ramesh Patel"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
              />
            </Field>

            <Field label="Email" error={errors.email?.message}>
              <input
                type="email"
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="ramesh@company.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
              />
            </Field>

            <Field label="Phone number (optional)" error={errors.phone?.message}>
              <input
                type="tel"
                maxLength={10}
                className={`input ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="10-digit mobile number"
                {...register('phone', {
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Enter a valid 10-digit Indian mobile number',
                  },
                })}
              />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <input
                type="password"
                className={`input ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Minimum 8 characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                })}
              />
            </Field>

            <Field label="Role">
              <select className="input" {...register('role')}>
                <option value="sales_executive">Sales executive</option>
                <option value="warehouse_manager">Warehouse manager</option>
                <option value="technician">Technician</option>
                <option value="admin">Admin</option>
              </select>
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
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </div>
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
            try {
              await api.patch(`/users/${target.id || target._id}/active`, { isActive: !target.isActive });
              toast('success', 'Account status updated');
              setTarget(null);
              reload();
            } catch (err) {
              // api interceptor
            }
          }}
        />
      )}
    </div>
  );
}
