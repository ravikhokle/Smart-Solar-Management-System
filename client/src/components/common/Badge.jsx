const styles = {
  success: 'bg-emerald-50 text-solar-success',
  warning: 'bg-amber-50 text-solar-warning',
  error: 'bg-red-50 text-solar-error',
  info: 'bg-solar-grey text-solar-charcoal',
  orange: 'bg-orange-50 text-solar-orange',
};

export default function Badge({ tone = 'info', children }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[tone] || styles.info}`}>
      {String(children).replaceAll('_', ' ')}
    </span>
  );
}

export function statusTone(status) {
  const s = String(status || '');
  if (['approved', 'accepted', 'paid', 'completed', 'active', 'closed', 'available'].includes(s)) return 'success';
  if (['pending', 'partial', 'submitted', 'assigned', 'scheduled', 'in_progress', 'waiting_for_parts'].includes(s))
    return 'warning';
  if (['rejected', 'expired', 'cancelled', 'error', 'overdue', 'not_covered'].includes(s)) return 'error';
  if (['converted', 'dispatched', 'reserved'].includes(s)) return 'orange';
  return 'info';
}
