import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { downloadFile } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import { money, dt } from '../../utils/format.js';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import RowActions from '../../components/common/RowActions.jsx';

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { data, meta, loading, reload } = useApi(() => api.get('/payments', { params: { page } }), [page]);
  const deletePayment = async () => {
    try {
      await api.delete(`/payments/${deleteTarget._id}`);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      // api interceptor displays the backend error
    }
  };
  return (
    <div>
      <PageHeader title="Payments" subtitle="Manual receipts. Outstanding balances are calculated from recorded payments." />
      <DataTable
        loading={loading}
        rows={data || []}
        page={page}
        total={meta?.total}
        limit={meta?.limit}
        onPage={setPage}
        emptyTitle="No payments yet."
        emptyDescription="Record an advance from an order page."
        columns={[
          { key: 'receiptNumber', header: 'Receipt' },
          { key: 'customer', header: 'Customer', render: (r) => r.customer?.fullName },
          { key: 'order', header: 'Order', render: (r) => <Link className="text-solar-orange" to={`/orders/${r.order?._id}`}>{r.order?.orderNumber}</Link> },
          { key: 'amount', header: 'Amount', render: (r) => money(r.amount) },
          { key: 'paymentDate', header: 'Date', render: (r) => dt(r.paymentDate) },
          { key: 'pdf', header: '', render: (r) => <button className="btn-secondary" onClick={() => downloadFile(`/payments/${r._id}/receipt`, `${r.receiptNumber}.pdf`)}>PDF</button> },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => <RowActions editTo={`/orders/${r.order?._id}`} onDelete={() => setDeleteTarget(r)} />,
          },
        ]}
      />
      {deleteTarget && (
        <ConfirmDialog
          title="Delete payment?"
          message={`${deleteTarget.receiptNumber} will be permanently deleted.`}
          confirmLabel="Delete payment"
          danger
          onClose={() => setDeleteTarget(null)}
          onConfirm={deletePayment}
        />
      )}
    </div>
  );
}
