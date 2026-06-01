import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  iconBgColor?: string;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  trend,
  icon,
  iconBgColor = 'bg-blue-50 text-blue-600',
  className = '',
}) => {
  return (
    <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start transition-all duration-200 hover:shadow-md ${className}`}>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <h4 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h4>
        {trend && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            <span className={`font-bold flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '▲' : '▼'} {trend.value}
            </span>
            {trend.label && <span className="text-slate-400">{trend.label}</span>}
          </div>
        )}
      </div>
      {icon && (
        <div className={`p-2.5 rounded-xl ${iconBgColor} shrink-0 flex items-center justify-center`}>
          {icon}
        </div>
      )}
    </div>
  );
};
