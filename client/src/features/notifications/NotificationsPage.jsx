import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import { dt } from '../../utils/format.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';

export default function NotificationsPage() {
  const { data, loading, reload } = useApi(() => api.get('/finance/notifications'), []);
  if (loading) return <TableSkeleton />;
  return (
    <div>
      <PageHeader title="Notifications" />
      {!data?.length && <EmptyState title="No notifications yet." />}
      <div className="space-y-2">
        {(data || []).map((n) => (
          <button
            key={n._id}
            className={`card w-full p-4 text-left ${n.read ? 'opacity-70' : ''}`}
            onClick={async () => {
              await api.patch(`/finance/notifications/${n._id}/read`);
              toast('success', 'Marked read');
              reload();
            }}
          >
            <div className="font-medium">{n.title}</div>
            <div className="text-sm text-solar-muted">{n.body}</div>
            <div className="mt-1 text-xs text-solar-muted">{dt(n.createdAt)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
