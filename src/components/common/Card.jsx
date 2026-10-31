import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = 'p-5',
  headerClassName = 'px-5 py-4 border-b border-solar-border',
  hover = false,
  ...props
}) => {
  return (
    <div
      className={`bg-solar-surface rounded-xl border border-solar-border shadow-card transition-all duration-200 ${
        hover ? 'hover:shadow-card-hover hover:border-slate-300' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className={`flex items-center justify-between ${headerClassName}`}>
          <div>
            {title && (
              <h3 className="text-base font-semibold text-solar-text leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-solar-text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
};

export default Card;
