import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Field from '../../components/common/Field.jsx';
import Badge from '../../components/common/Badge.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import RowActions from '../../components/common/RowActions.jsx';

export default function CustomersPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { data, meta, loading, reload } = useApi(() => api.get('/customers', { params: { q, page } }), [q, page]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      customerType: 'residential',
      notes: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await api.post('/customers', values);
      toast('success', 'Customer created successfully');
      setOpen(false);
      reset();
      reload();
    } catch (err) {
      // api interceptor will automatically toast backend error message (e.g., 409 conflict)
    }
  };

  const onDelete = async () => {
    try {
      await api.delete(`/customers/${deleteTarget._id}`);
      toast('success', 'Customer deleted successfully');
      setDeleteTarget(null);
      reload();
    } catch (err) {
      // api interceptor displays the backend error
    }
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Search by name, phone or email."
        actions={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            Add customer
          </button>
        }
      />
      <input
        className="input mb-4 max-w-sm"
        placeholder="Search customers..."
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(1);
        }}
      />
      <DataTable
        loading={loading}
        rows={data || []}
        total={meta?.total}
        page={page}
        limit={meta?.limit || 20}
        onPage={setPage}
        emptyTitle="No customers yet."
        emptyDescription="Add your first customer to start the enquiry workflow."
        emptyAction={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            Add your first customer
          </button>
        }
        columns={[
          {
            key: 'fullName',
            header: 'Name',
            render: (r) => (
              <Link className="font-semibold text-solar-orange hover:underline" to={`/customers/${r._id}`}>
                {r.fullName}
              </Link>
            ),
          },
          { key: 'phone', header: 'Phone' },
          { key: 'email', header: 'Email' },
          { key: 'city', header: 'City' },
          {
            key: 'customerType',
            header: 'Type',
            render: (r) => <Badge>{r.customerType}</Badge>,
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <RowActions editTo={`/customers/${r._id}`} onDelete={() => setDeleteTarget(r)} />
            ),
          },
        ]}
      />
      {open && (
        <Modal
          title="New customer"
          onClose={() => {
            if (!isSubmitting) {
              setOpen(false);
              reset();
            }
          }}
        >
          <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label="Full name" error={errors.fullName?.message}>
              <input
                className={`input ${errors.fullName ? 'border-red-500' : ''}`}
                placeholder="e.g. Rahul Sharma"
                {...register('fullName', {
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Phone number" error={errors.phone?.message}>
                <input
                  type="tel"
                  maxLength={10}
                  className={`input ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="10-digit mobile number"
                  {...register('phone', {
                    required: '10-digit phone number is required',
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
                  placeholder="name@example.com (optional)"
                  {...register('email', {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
              </Field>
            </div>

            <Field label="Street address" error={errors.address?.message}>
              <input
                className={`input ${errors.address ? 'border-red-500' : ''}`}
                placeholder="Plot/Flat no, Street"
                {...register('address', {
                  required: 'Street address is required',
                })}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="City" error={errors.city?.message}>
                <input
                  className={`input ${errors.city ? 'border-red-500' : ''}`}
                  placeholder="City"
                  {...register('city', {
                    required: 'City is required',
                  })}
                />
              </Field>

              <Field label="State" error={errors.state?.message}>
                <input
                  className={`input ${errors.state ? 'border-red-500' : ''}`}
                  placeholder="State"
                  {...register('state', {
                    required: 'State is required',
                  })}
                />
              </Field>

              <Field label="PIN code" error={errors.pinCode?.message}>
                <input
                  maxLength={6}
                  className={`input ${errors.pinCode ? 'border-red-500' : ''}`}
                  placeholder="6-digit PIN"
                  {...register('pinCode', {
                    required: 'PIN code is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Enter a valid 6-digit PIN code',
                    },
                  })}
                />
              </Field>
            </div>

            <Field label="Customer type">
              <select className="input" {...register('customerType')}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
              </select>
            </Field>

            <Field label="Notes">
              <textarea
                className="input"
                rows={3}
                placeholder="Any special customer requirements or instructions..."
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
                {isSubmitting ? 'Saving customer...' : 'Save customer'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete customer?"
          message={`This will permanently delete ${deleteTarget.fullName} and its enquiries and site surveys. Customers with orders cannot be deleted.`}
          confirmLabel="Delete customer"
          danger
          onClose={() => setDeleteTarget(null)}
          onConfirm={onDelete}
        />
      )}
    </div>
  );
}
