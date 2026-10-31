import { Sun } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-solar-cream px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-solar-charcoal text-solar-orange">
            <Sun />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-wide">HELIOSFLOW</div>
            <div className="text-xs text-solar-muted">Solar installation operations</div>
          </div>
        </div>
        <div className="card p-8">
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-solar-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
