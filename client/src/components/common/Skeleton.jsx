export default function Skeleton({ className = 'h-4 w-full' }) {
  return <div className={`animate-pulse rounded bg-solar-grey ${className}`} />;
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="card p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
