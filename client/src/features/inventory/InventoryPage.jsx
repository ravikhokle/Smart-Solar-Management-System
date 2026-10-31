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
import { money } from '../../utils/format.js';

const KINDS = [
  'solar_panel',
  'inverter',
  'battery',
  'mounting',
  'dc_cable',
  'ac_cable',
  'switch',
  'protection',
  'connector',
  'earthing',
  'other',
];

export default function InventoryPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { data, meta, loading, reload } = useApi(() => api.get('/inventory/products', { params: { q, page } }), [q, page]);
  const cats = useApi(() => api.get('/inventory/categories'), []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      kind: 'solar_panel',
      brand: '',
      model: '',
      unitCost: '',
      sellingPrice: '',
      quantityOnHand: '0',
      minStockLevel: '5',
      warrantyDurationMonths: 12,
      warrantyActivationMilestone: 'installation',
      requiresSerialNumber: false,
      description: '',
    },
  });

  const catForm = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        sku: values.sku.trim().toUpperCase(),
        unitCost: Number(values.unitCost),
        sellingPrice: Number(values.sellingPrice),
        quantityOnHand: Number(values.quantityOnHand || 0),
        minStockLevel: Number(values.minStockLevel || 0),
        warrantyDurationMonths: Number(values.warrantyDurationMonths || 0),
        requiresSerialNumber: Boolean(values.requiresSerialNumber === 'true' || values.requiresSerialNumber === true),
      };
      if (editing) {
        await api.patch(`/inventory/products/${editing._id}`, payload);
        toast('success', 'Product updated successfully');
      } else {
        await api.post('/inventory/products', payload);
        toast('success', 'Product created successfully');
      }
      setOpen(false);
      setEditing(null);
      reset();
      reload();
    } catch (err) {
      // api interceptor
    }
  };

  const startEdit = (product) => {
    setEditing(product);
    reset({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category?._id || product.category || '',
      kind: product.kind || 'other',
      brand: product.brand || '',
      model: product.model || '',
      unitCost: product.unitCost ?? '',
      sellingPrice: product.sellingPrice ?? '',
      quantityOnHand: product.quantityOnHand ?? 0,
      minStockLevel: product.minStockLevel ?? 0,
      warrantyDurationMonths: product.warrantyDurationMonths ?? 0,
      warrantyActivationMilestone: product.warrantyActivationMilestone || 'installation',
      requiresSerialNumber: String(Boolean(product.requiresSerialNumber)),
      description: product.description || '',
    });
    setOpen(true);
  };

  const deleteProduct = async () => {
    try {
      await api.delete(`/inventory/products/${deleteTarget._id}`);
      toast('success', 'Product deleted successfully');
      setDeleteTarget(null);
      reload();
    } catch (err) {
      // api interceptor displays the backend error
    }
  };

  const onCatSubmit = async (values) => {
    try {
      const response = await api.post('/inventory/categories', values);
      toast('success', 'Category created successfully');
      setCatOpen(false);
      catForm.reset();
      await cats.reload();
      const category = response.data?.data;
      if (category?._id) {
        setValue('category', category._id, { shouldDirty: true });
      }
    } catch (err) {
      // api interceptor
    }
  };

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Manage solar modules, inverters, batteries, and hardware components."
        actions={
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setCatOpen(true)}>
              Add category
            </button>
            <button className="btn-primary" onClick={() => setOpen(true)}>
              Add product
            </button>
          </div>
        }
      />
      <input
        className="input mb-4 max-w-sm"
        placeholder="Search SKU, name or brand..."
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(1);
        }}
      />
      <DataTable
        loading={loading}
        rows={data || []}
        page={page}
        total={meta?.total}
        limit={meta?.limit}
        onPage={setPage}
        emptyTitle="No products yet."
        emptyAction={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            Add your first product
          </button>
        }
        columns={[
          {
            key: 'name',
            header: 'Product',
            render: (r) => (
              <Link className="font-semibold text-solar-orange hover:underline" to={`/inventory/${r._id}`}>
                {r.name}
              </Link>
            ),
          },
          { key: 'sku', header: 'SKU' },
          {
            key: 'kind',
            header: 'Kind',
            render: (r) => <span className="capitalize">{r.kind?.replace(/_/g, ' ')}</span>,
          },
          { key: 'quantityOnHand', header: 'Total stock' },
          { key: 'availableQuantity', header: 'Available' },
          { key: 'sellingPrice', header: 'Selling price', render: (r) => money(r.sellingPrice) },
          {
            key: 'stock',
            header: 'Stock status',
            render: (r) => (r.isLowStock ? <Badge tone="warning">Low stock</Badge> : <Badge tone="success">In stock</Badge>),
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => (
              <RowActions onEdit={() => startEdit(r)} onDelete={() => setDeleteTarget(r)} />
            ),
          },
        ]}
      />
      {open && (
        <Modal
          title={editing ? 'Edit product' : 'New product'}
          wide
          onClose={() => {
            if (!isSubmitting) {
              setOpen(false);
              setEditing(null);
              reset();
            }
          }}
        >
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label="Product name" error={errors.name?.message}>
              <input
                className={`input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g. 540W Mono PERC Solar Panel"
                {...register('name', { required: 'Product name is required' })}
              />
            </Field>

            <Field label="SKU code" error={errors.sku?.message}>
              <input
                className={`input uppercase ${errors.sku ? 'border-red-500' : ''}`}
                placeholder="e.g. SP-540-MONO"
                {...register('sku', {
                  required: 'SKU code is required',
                  minLength: { value: 3, message: 'SKU must be at least 3 characters' },
                })}
              />
            </Field>

            <Field label="Category">
              <div className="flex gap-2">
                <select className="input min-w-0 flex-1" {...register('category')}>
                  <option value="">None (Uncategorized)</option>
                  {(cats.data || []).map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-secondary shrink-0 whitespace-nowrap"
                  onClick={() => setCatOpen(true)}
                >
                  + New
                </button>
              </div>
            </Field>

            <Field label="Kind">
              <select className="input" {...register('kind')}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Brand / Manufacturer">
              <input className="input" placeholder="e.g. Tata Power / Havells" {...register('brand')} />
            </Field>

            <Field label="Model">
              <input className="input" placeholder="e.g. TP-540-X" {...register('model')} />
            </Field>

            <Field label="Unit cost (₹)" error={errors.unitCost?.message}>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`input ${errors.unitCost ? 'border-red-500' : ''}`}
                placeholder="Purchase cost"
                {...register('unitCost', {
                  required: 'Unit cost is required',
                  min: { value: 0, message: 'Cost cannot be negative' },
                })}
              />
            </Field>

            <Field label="Selling price (₹)" error={errors.sellingPrice?.message}>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`input ${errors.sellingPrice ? 'border-red-500' : ''}`}
                placeholder="Customer price"
                {...register('sellingPrice', {
                  required: 'Selling price is required',
                  min: { value: 0, message: 'Price cannot be negative' },
                })}
              />
            </Field>

            <Field label="Total stock quantity" error={errors.quantityOnHand?.message}>
              <input
                type="number"
                min="0"
                step="1"
                className={`input ${errors.quantityOnHand ? 'border-red-500' : ''}`}
                placeholder="0"
                {...register('quantityOnHand', {
                  required: 'Total stock quantity is required',
                  min: { value: 0, message: 'Stock cannot be negative' },
                  valueAsNumber: true,
                })}
              />
            </Field>

            <Field label="Minimum stock warning level">
              <input type="number" min="0" className="input" placeholder="5" {...register('minStockLevel')} />
            </Field>

            <Field label="Warranty (months)">
              <input type="number" min="0" className="input" placeholder="12" {...register('warrantyDurationMonths')} />
            </Field>

            <Field label="Warranty milestone">
              <select className="input" {...register('warrantyActivationMilestone')}>
                <option value="installation">On installation completion</option>
                <option value="dispatch">On order dispatch</option>
              </select>
            </Field>

            <Field label="Serial number tracking">
              <select className="input" {...register('requiresSerialNumber')}>
                <option value="false">No (Bulk hardware)</option>
                <option value="true">Yes (Individual serial required)</option>
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Description">
                <textarea className="input" rows={2} placeholder="Technical specifications or notes..." {...register('description')} />
              </Field>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="btn-secondary"
                disabled={isSubmitting}
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                  reset();
                }}
              >
                Cancel
              </button>
              <button className="btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving product...' : editing ? 'Save changes' : 'Save product'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {catOpen && (
        <Modal
          title="New category"
          onClose={() => {
            if (!catForm.formState.isSubmitting) {
              setCatOpen(false);
              catForm.reset();
            }
          }}
        >
          <form className="grid gap-3" onSubmit={catForm.handleSubmit(onCatSubmit)} noValidate>
            <Field label="Category name" error={catForm.formState.errors.name?.message}>
              <input
                className={`input ${catForm.formState.errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g. Solar Modules"
                {...catForm.register('name', { required: 'Category name is required' })}
              />
            </Field>
            <Field label="Description">
              <input className="input" placeholder="Optional category description" {...catForm.register('description')} />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="btn-secondary"
                disabled={catForm.formState.isSubmitting}
                onClick={() => {
                  setCatOpen(false);
                  catForm.reset();
                }}
              >
                Cancel
              </button>
              <button className="btn-primary" type="submit" disabled={catForm.formState.isSubmitting}>
                {catForm.formState.isSubmitting ? 'Saving category...' : 'Save category'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete product?"
          message={`${deleteTarget.name} will be permanently deleted. Products with reserved stock cannot be deleted.`}
          confirmLabel="Delete product"
          danger
          onClose={() => setDeleteTarget(null)}
          onConfirm={deleteProduct}
        />
      )}
    </div>
  );
}
