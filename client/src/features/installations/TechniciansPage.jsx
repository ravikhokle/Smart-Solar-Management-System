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
      skills: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await api.post('/installations/technicians', {
        ...values,
        skills: String(values.skills || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast('success', 'Technician registered successfully');
      setOpen(false);
      reset();
      reload();
    } catch (err) {
      // api interceptor
    }
  };

  return (
    <div>
      <PageHeader
        title="Technicians"
        subtitle="Manage field technicians, electricians, and installation crews."
        actions={<button className="btn-primary" onClick={() => setOpen(true)}>Add technician</button>}
      />
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
          {
            key: 'availability',
            header: 'Availability',
            render: (r) => <Badge tone={statusTone(r.availability)}>{r.availability}</Badge>,
          },
          { key: 'skills', header: 'Skills', render: (r) => (r.skills || []).join(', ') || '—' },
        ]}
      />
      {open && (
        <Modal
          title="New technician"
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
                placeholder="e.g. Suresh Kumar"
                {...register('name', { required: 'Name is required' })}
              />
            </Field>

            <Field label="Phone number" error={errors.phone?.message}>
              <input
                type="tel"
                maxLength={10}
                className={`input ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="10-digit mobile number"
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Enter a valid 10-digit Indian mobile number',
                  },
                })}
              />
            </Field>

            <Field label="Email address" error={errors.email?.message}>
              <input
                type="email"
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="suresh@company.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
              />
            </Field>

            <Field label="Login password" error={errors.password?.message}>
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

            <Field label="Skills (comma-separated)">
              <input
                className="input"
                placeholder="e.g. Solar panel mounting, Inverter wiring, Earthing"
                {...register('skills')}
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
                {isSubmitting ? 'Saving technician...' : 'Save technician'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
