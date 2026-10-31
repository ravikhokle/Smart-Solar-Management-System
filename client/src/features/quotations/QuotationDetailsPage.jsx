import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api, { toast, downloadFile } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import { money } from '../../utils/format.js';
import Field from '../../components/common/Field.jsx';

export default function QuotationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, reload } = useApi(() => api.get(`/quotations/${id}`), [id]);
  const products = useApi(() => api.get('/inventory/products', { params: { limit: 100 } }), []);
  const [items, setItems] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(18);

  if (loading || !data) return <TableSkeleton />;
  const rows = items || data.items || [];

  const addRow = () => setItems([...rows, { product: '', name: '', quantity: 1, unitPrice: 0 }]);
  const save = async () => {
    await api.patch(`/quotations/${id}`, {
      items: rows.map((r) => ({
        product: r.product?._id || r.product || undefined,
        name: r.name,
        quantity: Number(r.quantity),
        unitPrice: Number(r.unitPrice),
      })),
      discountAmount: Number(discount || data.discountAmount),
      taxPercent: Number(tax || data.taxPercent),
    });
    toast('success', 'Quotation updated');
    reload();
  };

  return (
    <div>
      <PageHeader
        title={data.quotationNumber}
        subtitle={`${data.customer?.fullName} · ${data.systemCapacityKw} kW ${data.systemType}`}
        actions={
          <>
            <Badge tone={statusTone(data.approvalStatus)}>{data.approvalStatus}</Badge>
            <button className="btn-secondary" onClick={() => downloadFile(`/quotations/${id}/pdf`, `${data.quotationNumber}.pdf`)}>Download PDF</button>
          </>
        }
      />
      <div className="card overflow-x-auto p-4">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left text-solar-muted"><th className="p-2">Item</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr></thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-solar-border">
                <td className="p-2">
                  <select
                    className="input"
                    value={row.product?._id || row.product || ''}
                    onChange={(e) => {
                      const p = (products.data || []).find((x) => x._id === e.target.value);
                      const next = [...rows];
                      next[i] = { ...row, product: e.target.value, name: p?.name, unitPrice: p?.sellingPrice || 0 };
                      setItems(next);
                    }}
                  >
                    <option value="">{row.name || 'Select product'}</option>
                    {(products.data || []).map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </td>
                <td><input className="input w-20" type="number" value={row.quantity} onChange={(e) => { const n = [...rows]; n[i] = { ...row, quantity: e.target.value }; setItems(n); }} /></td>
                <td><input className="input w-28" type="number" value={row.unitPrice} onChange={(e) => { const n = [...rows]; n[i] = { ...row, unitPrice: e.target.value }; setItems(n); }} /></td>
                <td>{money(Number(row.quantity) * Number(row.unitPrice))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn-secondary mt-3" type="button" onClick={addRow}>Add component</button>
        <div className="mt-4 grid max-w-sm gap-2">
          <Field label="Discount"><input className="input" defaultValue={data.discountAmount} onChange={(e) => setDiscount(e.target.value)} /></Field>
          <Field label="Tax %"><input className="input" defaultValue={data.taxPercent} onChange={(e) => setTax(e.target.value)} /></Field>
          <div>Subtotal {money(data.subtotal)}</div>
          <div className="font-semibold">Total {money(data.totalAmount)}</div>
        </div>
        {['draft', 'sent'].includes(data.approvalStatus) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={save}>Save BOM</button>
            <button className="btn-secondary" onClick={async () => { await api.post(`/quotations/${id}/send`); toast('success', 'Quotation sent'); reload(); }}>Send</button>
            <button className="btn-primary" onClick={async () => { await api.post(`/quotations/${id}/decision`, { accept: true }); toast('success', 'Quotation accepted'); reload(); }}>Accept</button>
            <button className="btn-danger" onClick={async () => { await api.post(`/quotations/${id}/decision`, { accept: false }); toast('success', 'Quotation rejected'); reload(); }}>Reject</button>
          </div>
        )}
        {data.approvalStatus === 'accepted' && (
          <button
            className="btn-primary mt-4"
            onClick={async () => {
              const res = await api.post('/orders', { quotationId: id });
              toast('success', 'Order created');
              navigate(`/orders/${res.data.data._id}`);
            }}
          >
            Convert to order
          </button>
        )}
      </div>
    </div>
  );
}
