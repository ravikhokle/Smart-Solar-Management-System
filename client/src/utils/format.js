export function money(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(n || 0));
}

export function dt(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export function d(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

export function label(value) {
  return String(value || '—').replaceAll('_', ' ');
}
