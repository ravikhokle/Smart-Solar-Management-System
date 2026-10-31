import React from 'react';
import Card from '../common/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  iconBgColor = 'bg-teal-50',
  iconTextColor = 'text-solar-primary',
  className = '',
}) => {
  return (
    <Card className={`relative overflow-hidden ${className}`} hover>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-solar-text-muted tracking-wide uppercase">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-solar-primary tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor} ${iconTextColor} border border-black/5 shadow-xs`}
          >
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-solar-border flex items-center justify-between text-xs">
          {subtitle && <span className="text-solar-text-muted">{subtitle}</span>}
          {trend && (
            <span
              className={`inline-flex items-center font-medium ${
                trendDirection === 'up'
                  ? 'text-solar-secondary'
                  : 'text-solar-warning'
              }`}
            >
              {trendDirection === 'up' ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {trend}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};

export default StatCard;
