import React from 'react';
import { SunMedium } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = SunMedium,
  title = 'No records found',
  description = 'Get started by creating your first entry or adjust your search filters.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/70 ${className}`}
    >
      <div className="w-14 h-14 mb-4 rounded-2xl bg-teal-50 flex items-center justify-center text-solar-primary border border-teal-100 shadow-sm">
        <Icon className="w-7 h-7 text-solar-secondary" />
      </div>
      <h3 className="text-base font-bold text-solar-text">{title}</h3>
      <p className="mt-1.5 text-xs text-solar-text-muted max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
