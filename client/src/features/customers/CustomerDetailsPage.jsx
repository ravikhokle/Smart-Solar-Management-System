import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Field from '../../components/common/Field.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const { data, loading, reload } = useApi(() => api.get(`/customers/${id}`), [id]);
  const { register, handleSubmit, reset } = useForm();
  useEffect(() => {
    if (data?.customer) reset(data.customer);
  }, [data, reset]);

  if (loading || !data) return <TableSkeleton />;
  const onSubmit = async (values) => {
    await api.patch(`/customers/${id}`, values);
    toast('success', 'Customer updated');
    reload();
  };

  return (
    <div>
      <PageHeader title={data.customer.fullName} subtitle={data.customer.phone} />
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="card grid gap-3 p-5" onSubmit={handleSubmit(onSubmit)}>
          {['fullName', 'phone', 'email', 'address', 'city', 'state', 'pinCode', 'notes'].map((f) => (
            <Field key={f} label={f}>
              <input className="input" {...register(f)} />
            </Field>
          ))}
          <button className="btn-primary w-fit" type="submit">
            Save changes
          </button>
        </form>
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 font-semibold">Enquiries</h3>
            {!data.enquiries.length && <p className="text-sm text-solar-muted">No enquiries yet.</p>}
            {data.enquiries.map((e) => (
              <Link key={e._id} to={`/enquiries/${e._id}`} className="mb-2 flex justify-between text-sm">
                <span>{e.systemType} {e.expectedCapacityKw} kW</span>
                <Badge tone={statusTone(e.status)}>{e.status}</Badge>
              </Link>
            ))}
          </div>
          <div className="card p-5">
            <h3 className="mb-3 font-semibold">Orders</h3>
            {!data.orders.length && <p className="text-sm text-solar-muted">No orders yet.</p>}
            {data.orders.map((o) => (
              <Link key={o._id} to={`/orders/${o._id}`} className="mb-2 block text-sm text-solar-orange">
                {o.orderNumber}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
