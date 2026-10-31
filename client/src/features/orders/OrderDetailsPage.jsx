import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import Field from '../../components/common/Field.jsx';
import { money } from '../../utils/format.js';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, reload } = useApi(() => api.get(`/orders/${id}`), [id]);
  const serials = useApi(() => api.get('/inventory/serials', { params: { status: 'in_stock', limit: 100 } }), []);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('upi');
  const [ref, setRef] = useState('');
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    if (!data || data.paymentStatus === 'paid' || !data.razorpayPaymentLinkId) return undefined;
    const timer = setInterval(reload, 10000);
    return () => clearInterval(timer);
  }, [data, reload]);

  if (loading || !data) return <TableSkeleton />;

  const recordPay = async () => {
    await api.post('/payments', { order: id, amount: Number(amount), method, transactionReference: ref });
    toast('success', 'Payment recorded');
    setAmount('');
    reload();
  };

  return (
    <div>
      <PageHeader
        title={data.orderNumber}
        subtitle={data.customer?.fullName}
        actions={
          <>
            <Badge tone={statusTone(data.paymentStatus)}>{data.paymentStatus}</Badge>
            <Badge tone={statusTone(data.inventoryStatus)}>{data.inventoryStatus}</Badge>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-2 p-5 text-sm">
          <div>Amount {money(data.orderAmount)}</div>
          <div>Received {money(data.amountReceived)}</div>
          <div>Outstanding {money(data.outstandingBalance)}</div>
          <div>Capacity {data.systemCapacityKw} kW</div>
          <div>Installation {data.installationStatus}</div>
          {data.razorpayPaymentLinkUrl && data.paymentStatus !== 'paid' && (
            <a className="btn-secondary mt-2 inline-block" href={data.razorpayPaymentLinkUrl} target="_blank" rel="noreferrer">
              Open payment link
            </a>
          )}
        </div>
        <div className="card p-5">
          <h3 className="mb-3 font-semibold">Record payment</h3>
          <Field label="Amount"><input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          <Field label="Method">
            <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
              {['upi', 'neft', 'rtgs', 'cash', 'cheque', 'card', 'other'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Reference"><input className="input" value={ref} onChange={(e) => setRef(e.target.value)} /></Field>
          <button className="btn-primary mt-3" onClick={recordPay}>Save payment</button>
        </div>
      </div>
      <div className="card mt-4 p-5">
        <h3 className="mb-3 font-semibold">Inventory</h3>
        {data.inventoryStatus === 'unreserved' && (
          <button className="btn-primary" onClick={async () => { await api.post(`/inventory/orders/${id}/reserve`); toast('success', 'Stock reserved'); reload(); }}>Reserve stock</button>
        )}
        {data.inventoryStatus === 'reserved' && (
          <div>
            {(data.quotation?.items || []).filter((i) => i.product).map((item) => (
              <Field key={item.product} label={`Serials for ${item.name} (${item.quantity})`}>
                <select
                  multiple
                  className="input h-28"
                  onChange={(e) => setAssignments({ ...assignments, [item.product._id || item.product]: [...e.target.selectedOptions].map((o) => o.value) })}
                >
                  {(serials.data || []).filter((s) => String(s.product?._id || s.product) === String(item.product._id || item.product)).map((s) => (
                    <option key={s._id} value={s.serial}>{s.serial}</option>
                  ))}
                </select>
              </Field>
            ))}
            <button
              className="btn-primary mt-3"
              onClick={async () => {
                const serialAssignments = Object.entries(assignments).map(([productId, serialsList]) => ({ productId, serials: serialsList }));
                await api.post(`/inventory/orders/${id}/dispatch`, { serialAssignments });
                toast('success', 'Dispatched');
                reload();
              }}
            >
              Dispatch
            </button>
          </div>
        )}
      </div>
      <div className="card mt-4 p-5">
        <h3 className="mb-3 font-semibold">Payment history</h3>
        {!(data.payments || []).length && <p className="text-sm text-solar-muted">No payments recorded.</p>}
        {(data.payments || []).map((p) => (
          <div key={p._id} className="flex justify-between border-t border-solar-border py-2 text-sm">
            <span>{p.receiptNumber} · {p.method}</span>
            <span>{money(p.amount)}</span>
          </div>
        ))}
      </div>
      <button className="btn-secondary mt-4" onClick={() => navigate(`/installations?order=${id}`)}>Schedule installation</button>
    </div>
  );
}
