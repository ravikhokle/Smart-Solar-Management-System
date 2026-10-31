export default function Field({ label, children, error, hint }) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-solar-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-solar-error font-medium">{error}</span>}
    </label>
  );
}
