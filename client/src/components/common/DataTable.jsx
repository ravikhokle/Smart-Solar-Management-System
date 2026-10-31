import EmptyState from './EmptyState.jsx';
import { TableSkeleton } from './Skeleton.jsx';

export default function DataTable({
  columns,
  rows,
  loading,
  emptyTitle,
  emptyDescription,
  emptyAction,
  page,
  total,
  limit,
  onPage,
}) {
  if (loading) return <TableSkeleton />;
  if (!rows?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }
  const pages = Math.max(1, Math.ceil((total || rows.length) / (limit || 20)));
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-solar-cream text-solar-muted">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-medium">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id || row.id || JSON.stringify(row)} className="border-t border-solar-border hover:bg-solar-cream/50">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 align-middle">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onPage && (
        <div className="flex items-center justify-between border-t border-solar-border px-4 py-3 text-sm text-solar-muted">
          <span>
            Page {page} of {pages} · {total || 0} records
          </span>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
              Previous
            </button>
            <button className="btn-secondary" disabled={page >= pages} onClick={() => onPage(page + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
