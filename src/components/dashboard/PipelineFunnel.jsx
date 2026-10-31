import React from 'react';
import Card from '../common/Card';

const PipelineFunnel = ({ pipeline = [] }) => {
  const totalInPipeline = pipeline.reduce((acc, curr) => acc + (curr.count || 0), 0);

  const colors = [
    'bg-slate-400',
    'bg-blue-500',
    'bg-purple-500',
    'bg-solar-accent',
    'bg-solar-secondary',
    'bg-emerald-500',
    'bg-teal-700',
  ];

  return (
    <Card
      title="Installation Pipeline Status"
      subtitle={`${totalInPipeline} active and completed commercial solar contracts`}
      className="w-full"
    >
      <div className="space-y-3.5 pt-1">
        {pipeline.map((item, idx) => {
          const percentage = totalInPipeline > 0 ? Math.round((item.count / totalInPipeline) * 100) : 0;
          return (
            <div key={item.stage} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-solar-text">{item.stage}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-solar-primary">{item.count}</span>
                  <span className="text-[10px] text-solar-text-muted">({percentage}%)</span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors[idx % colors.length]}`}
                  style={{ width: `${Math.max(percentage, item.count > 0 ? 8 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PipelineFunnel;
