import React from 'react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';

const Badge = ({
  children,
  variant = 'default',
  type = 'custom', // 'status', 'priority', or 'custom'
  dot = false,
  className = '',
  size = 'md',
}) => {
  let styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (type === 'status' && STATUS_COLORS[children]) {
    const config = STATUS_COLORS[children];
    styleClasses = `${config.bg} ${config.text} ${config.border}`;
    dotColor = config.dot;
  } else if (type === 'priority' && PRIORITY_COLORS[children]) {
    const config = PRIORITY_COLORS[children];
    styleClasses = `${config.bg} ${config.text}`;
  } else if (variant === 'success') {
    styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (variant === 'warning') {
    styleClasses = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (variant === 'danger') {
    styleClasses = 'bg-red-50 text-red-700 border-red-200';
    dotColor = 'bg-red-500';
  } else if (variant === 'primary') {
    styleClasses = 'bg-teal-50 text-solar-primary border-teal-200';
    dotColor = 'bg-solar-primary';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full ${styleClasses} ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
    >
      {(dot || type === 'status') && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
