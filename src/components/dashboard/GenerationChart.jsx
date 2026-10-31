import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Card from '../common/Card';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-solar-primary text-white p-3 rounded-xl shadow-xl text-xs border border-white/10 space-y-1">
        <p className="font-bold text-teal-200 border-b border-white/10 pb-1">{label} 2026</p>
        <p className="flex items-center justify-between gap-4">
          <span className="text-teal-300">Actual Generation:</span>
          <span className="font-semibold">{payload[0]?.value} MWh</span>
        </p>
        <p className="flex items-center justify-between gap-4">
          <span className="text-solar-accent">Target Benchmark:</span>
          <span className="font-semibold">{payload[1]?.value} MWh</span>
        </p>
      </div>
    );
  }
  return null;
};

const GenerationChart = ({ data = [] }) => {
  return (
    <Card
      title="Solar Energy Generation vs Forecast"
      subtitle="Monthly power output performance across all deployed client microgrids"
      className="w-full"
    >
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A36A" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#16A36A" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F4B740" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F4B740" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              tickLine={false}
              stroke="#6B7280"
              fontSize={11}
              dy={5}
            />
            <YAxis
              tickLine={false}
              stroke="#6B7280"
              fontSize={11}
              unit="M"
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
            />
            <Area
              type="monotone"
              dataKey="actualMWh"
              name="Actual Power (MWh)"
              stroke="#16A36A"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorActual)"
            />
            <Area
              type="monotone"
              dataKey="targetMWh"
              name="Planned Target (MWh)"
              stroke="#F4B740"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorTarget)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default GenerationChart;
