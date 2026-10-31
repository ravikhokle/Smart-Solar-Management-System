import { useParams } from 'react-router-dom';
import { useState } from 'react';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import Field from '../../components/common/Field.jsx';
import { money } from '../../utils/format.js';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { data, loading, reload } = useApi(() => api.get(`/inventory/products/${id}`), [id]);
  const moves = useApi(() => api.get('/inventory/movements', { params: { product: id } }), [id]);
  const [qty, setQty] = useState(1);
  const [serials, setSerials] = useState('');

  if (loading || !data) return <TableSkeleton />;

  const receive = async () => {
    await api.post('/inventory/receive', {
      productId: id,
      quantity: Number(qty),
      serials: serials.split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
    });
    toast('success', 'Stock received');
    setSerials('');
    reload();
    moves.reload();
  };

  return (
    <div>
      <PageHeader title={data.name} subtitle={data.sku} />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-2 p-5 text-sm">
          <div>On hand {data.quantityOnHand} · Reserved {data.quantityReserved} · Available {data.availableQuantity}</div>
          <div>Cost {money(data.unitCost)} · Price {money(data.sellingPrice)}</div>
          <div>Warranty {data.warrantyDurationMonths} months from {data.warrantyActivationMilestone}</div>
          <div>Serial tracking {data.requiresSerialNumber ? 'Yes' : 'No'}</div>
        </div>
        <div className="card p-5">
          <h3 className="mb-3 font-semibold">Receive stock</h3>
          <Field label="Quantity"><input className="input" type="number" value={qty} onChange={(e) => setQty(e.target.value)} /></Field>
          {data.requiresSerialNumber && (
            <Field label="Serial numbers (one per unit)">
              <textarea className="input mt-2" rows={4} value={serials} onChange={(e) => setSerials(e.target.value)} />
            </Field>
          )}
          <button className="btn-primary mt-3" onClick={receive}>Record receipt</button>
        </div>
      </div>
      <div className="card mt-4 p-5">
        <h3 className="mb-3 font-semibold">Movement history</h3>
        {!(moves.data || []).length && <p className="text-sm text-solar-muted">No movements yet.</p>}
        {(moves.data || []).map((m) => (
          <div key={m._id} className="flex justify-between border-t border-solar-border py-2 text-sm">
            <span>{m.type}</span>
            <span>{m.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
