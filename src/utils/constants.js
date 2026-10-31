export const PROJECT_STATUSES = [
  'Lead',
  'Site Audit',
  'Engineering Design',
  'Permitting',
  'Installation',
  'Commissioning',
  'Completed',
  'Cancelled',
];

export const STATUS_COLORS = {
  Lead: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', dot: 'bg-slate-400' },
  'Site Audit': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  'Engineering Design': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  Permitting: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
  Installation: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', dot: 'bg-solar-secondary' },
  Commissioning: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Completed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', dot: 'bg-green-600' },
  Cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
};

export const PRIORITY_COLORS = {
  Low: { bg: 'bg-slate-100', text: 'text-slate-600' },
  Medium: { bg: 'bg-blue-50', text: 'text-blue-700' },
  High: { bg: 'bg-amber-50', text: 'text-amber-800' },
  Urgent: { bg: 'bg-red-50', text: 'text-red-700' },
};

export const INVENTORY_CATEGORIES = [
  'Solar Panels',
  'Inverters',
  'Batteries',
  'Mounting Systems',
  'Electrical & Wiring',
  'Meters',
];

export const CUSTOMER_TYPES = ['Residential', 'Commercial', 'Industrial'];

export const ROOF_TYPES = [
  'Composite Shingle',
  'Tile',
  'Metal Standing Seam',
  'Flat TPO/EPDM',
  'Ground Mount',
];
