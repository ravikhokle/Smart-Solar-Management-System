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
import { money } from '../../utils/format.js';

const KINDS = ['solar_panel', 'inverter', 'battery', 'mounting', 'dc_cable', 'ac_cable', 'switch', 'protection', 'connector', 'earthing', 'other'];

export default function InventoryPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const { data, meta, loading, reload } = useApi(() => api.get('/inventory/products', { params: { q, page } }), [q, page]);
  const cats = useApi(() => api.get('/inventory/categories'), []);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { warrantyDurationMonths: 12, warrantyActivationMilestone: 'installation', requiresSerialNumber: false },
  });
  const catForm = useForm();

  const onSubmit = async (values) => {
    await api.post('/inventory/products', {
      ...values,
      unitCost: Number(values.unitCost),
      sellingPrice: Number(values.sellingPrice),
      minStockLevel: Number(values.minStockLevel || 0),
      warrantyDurationMonths: Number(values.warrantyDurationMonths),
      requiresSerialNumber: Boolean(values.requiresSerialNumber),
    });
    toast('success', 'Product created');
    setOpen(false);
    reset();
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Inventory"
        actions={
          <>
            <button className="btn-secondary" onClick={() => setCatOpen(true)}>Add category</button>
            <button className="btn-primary" onClick={() => setOpen(true)}>Add product</button>
          </>
        }
      />
      <input className="input mb-4 max-w-sm" placeholder="Search SKU or name" value={q} onChange={(e) => setQ(e.target.value)} />
      <DataTable
        loading={loading}
        rows={data || []}
        page={page}
        total={meta?.total}
        limit={meta?.limit}
        onPage={setPage}
        emptyTitle="No products yet."
        emptyAction={<button className="btn-primary" onClick={() => setOpen(true)}>Add your first product</button>}
        columns={[
          { key: 'name', header: 'Product', render: (r) => <Link className="text-solar-orange" to={`/inventory/${r._id}`}>{r.name}</Link> },
          { key: 'sku', header: 'SKU' },
          { key: 'kind', header: 'Kind' },
          { key: 'availableQuantity', header: 'Available' },
          { key: 'sellingPrice', header: 'Price', render: (r) => money(r.sellingPrice) },
          { key: 'stock', header: 'Stock', render: (r) => (r.isLowStock ? <Badge tone="warning">Low</Badge> : <Badge tone="success">OK</Badge>) },
        ]}
      />
      {open && (
        <Modal title="New product" wide onClose={() => setOpen(false)}>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <Field label="Name"><input className="input" required {...register('name')} /></Field>
            <Field label="SKU"><input className="input" required {...register('sku')} /></Field>
            <Field label="Category">
              <select className="input" {...register('category')}>
                <option value="">None</option>
                {(cats.data || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Kind">
              <select className="input" {...register('kind')}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
            </Field>
            <Field label="Brand"><input className="input" {...register('brand')} /></Field>
            <Field label="Model"><input className="input" {...register('model')} /></Field>
            <Field label="Unit cost"><input className="input" type="number" required {...register('unitCost')} /></Field>
            <Field label="Selling price"><input className="input" type="number" required {...register('sellingPrice')} /></Field>
            <Field label="Min stock"><input className="input" type="number" {...register('minStockLevel')} /></Field>
            <Field label="Warranty months"><input className="input" type="number" {...register('warrantyDurationMonths')} /></Field>
            <Field label="Warranty starts">
              <select className="input" {...register('warrantyActivationMilestone')}>
                <option value="installation">On installation</option>
                <option value="dispatch">On dispatch</option>
              </select>
            </Field>
            <Field label="Serial tracking">
              <select className="input" {...register('requiresSerialNumber')}>
                <option value="">No</option>
                <option value="true">Yes</option>
              </select>
            </Field>
            <div className="md:col-span-2"><Field label="Description"><textarea className="input" {...register('description')} /></Field></div>
            <button className="btn-primary md:col-span-2" type="submit">Save product</button>
          </form>
        </Modal>
      )}
      {catOpen && (
        <Modal title="New category" onClose={() => setCatOpen(false)}>
          <form className="grid gap-3" onSubmit={catForm.handleSubmit(async (v) => {
            await api.post('/inventory/categories', v);
            toast('success', 'Category created');
            setCatOpen(false);
            cats.reload();
          })}>
            <Field label="Name"><input className="input" required {...catForm.register('name')} /></Field>
            <Field label="Description"><input className="input" {...catForm.register('description')} /></Field>
            <button className="btn-primary" type="submit">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
