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

export default function CustomersPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data, meta, loading, reload } = useApi(() => api.get('/customers', { params: { q, page } }), [q, page]);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (values) => {
    try {
      await api.post('/customers', values);
      toast('success', 'Customer created');
      setOpen(false);
      reset();
      reload();
    } catch (err) {
      if (err.response?.status === 409) {
        const go = window.confirm('A similar customer already exists. Create anyway?');
        if (go) {
          await api.post('/customers', { ...values, force: true });
          toast('success', 'Customer created');
          setOpen(false);
          reload();
        }
      }
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
      <input className="input mb-4 max-w-sm" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
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
          { key: 'fullName', header: 'Name', render: (r) => <Link className="text-solar-orange" to={`/customers/${r._id}`}>{r.fullName}</Link> },
          { key: 'phone', header: 'Phone' },
          { key: 'email', header: 'Email' },
          { key: 'city', header: 'City' },
          { key: 'customerType', header: 'Type', render: (r) => <Badge>{r.customerType}</Badge> },
        ]}
      />
      {open && (
        <Modal title="New customer" onClose={() => setOpen(false)}>
          <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
            {['fullName', 'phone', 'email', 'address', 'city', 'state', 'pinCode'].map((f) => (
              <Field key={f} label={f}>
                <input className="input" required={f !== 'email'} {...register(f)} />
              </Field>
            ))}
            <Field label="Customer type">
              <select className="input" {...register('customerType')}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
              </select>
            </Field>
            <Field label="Notes">
              <textarea className="input" rows={3} {...register('notes')} />
            </Field>
            <button className="btn-primary" type="submit">
              Save customer
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
