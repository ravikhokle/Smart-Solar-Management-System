import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { toast } from '../../services/api.js';
import { money } from '../../utils/format.js';
import AuthLayout from '../../layouts/AuthLayout.jsx';

export default function QuotationResponsePage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [quotation, setQuotation] = useState(null);
  const [paymentLink, setPaymentLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    api.get('/public/quotations/respond', { params: { token } })
      .then((res) => setQuotation(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const respond = async (accept) => {
    setResponding(true);
    try {
      const response = await api.post('/public/quotations/respond', { token, accept });
      setQuotation((current) => ({ ...current, approvalStatus: accept ? 'accepted' : 'rejected' }));
      setPaymentLink(response.data?.data?.paymentLink || '');
      toast('success', accept ? 'Quotation accepted' : 'Quotation rejected');
    } finally {
      setResponding(false);
    }
  };

  if (loading) return <AuthLayout title="Quotation">Loading quotation...</AuthLayout>;
  if (!quotation) return <AuthLayout title="Quotation link unavailable">This quotation link is invalid or expired.</AuthLayout>;

  return (
    <AuthLayout title={`Quotation ${quotation.quotationNumber}`} subtitle={`For ${quotation.customerName}`}>
      <div className="space-y-3 text-sm">
        <p>{quotation.systemCapacityKw} kW {quotation.systemType?.replace(/_/g, '-')}</p>
        {quotation.items.map((item, index) => (
          <div key={index} className="flex justify-between border-t border-solar-border pt-2">
            <span>{item.name} × {item.quantity}</span>
            <span>{money(item.quantity * item.unitPrice)}</span>
          </div>
        ))}
        <div className="border-t border-solar-border pt-3 font-semibold">Total {money(quotation.totalAmount)}</div>
        {['draft', 'sent'].includes(quotation.approvalStatus) ? (
          <div className="flex gap-2 pt-3">
            <button className="btn-primary flex-1" disabled={responding} onClick={() => respond(true)}>Accept quotation</button>
            <button className="btn-danger flex-1" disabled={responding} onClick={() => respond(false)}>Reject quotation</button>
          </div>
        ) : (
          <div className="pt-3">
            <p className="font-medium capitalize">Status: {quotation.approvalStatus}</p>
            {paymentLink && (
              <a className="btn-primary mt-3 inline-block" href={paymentLink} target="_blank" rel="noreferrer">
                Pay now
              </a>
            )}
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
