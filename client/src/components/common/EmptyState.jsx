export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-solar-border bg-white px-6 py-16 text-center">
      <h3 className="text-base font-semibold text-solar-charcoal">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-solar-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
