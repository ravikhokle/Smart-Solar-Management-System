import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import { money } from '../../utils/format.js';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import RowActions from '../../components/common/RowActions.jsx';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { data, meta, loading, reload } = useApi(() => api.get('/orders', { params: { page } }), [page]);
  const deleteOrder = async () => {
    try {
      await api.delete(`/orders/${deleteTarget._id}`);
      toast('success', 'Order deleted successfully');
      setDeleteTarget(null);
      reload();
    } catch (err) {
      // api interceptor displays the backend error
    }
  };
  return (
    <div>
      <PageHeader title="Orders" subtitle="Orders are created from accepted quotations." />
      <DataTable
        loading={loading}
        rows={data || []}
        page={page}
        total={meta?.total}
        limit={meta?.limit}
        onPage={setPage}
        emptyTitle="No orders yet."
        emptyDescription="Accept a quotation, then convert it into an order."
        columns={[
          { key: 'orderNumber', header: 'Order', render: (r) => <Link className="text-solar-orange" to={`/orders/${r._id}`}>{r.orderNumber}</Link> },
          { key: 'customer', header: 'Customer', render: (r) => r.customer?.fullName },
          { key: 'orderAmount', header: 'Amount', render: (r) => money(r.orderAmount) },
          { key: 'outstandingBalance', header: 'Outstanding', render: (r) => money(r.outstandingBalance) },
          { key: 'paymentStatus', header: 'Payment', render: (r) => <Badge tone={statusTone(r.paymentStatus)}>{r.paymentStatus}</Badge> },
          { key: 'installationStatus', header: 'Install', render: (r) => <Badge tone={statusTone(r.installationStatus)}>{r.installationStatus}</Badge> },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => <RowActions editTo={`/orders/${r._id}`} onDelete={() => setDeleteTarget(r)} />,
          },
        ]}
      />
      {deleteTarget && (
        <ConfirmDialog
          title="Delete order?"
          message={`${deleteTarget.orderNumber} and its related records will be permanently deleted.`}
          confirmLabel="Delete order"
          danger
          onClose={() => setDeleteTarget(null)}
          onConfirm={deleteOrder}
        />
      )}
    </div>
  );
}
