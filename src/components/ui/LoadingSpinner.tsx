import React from 'react';

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-3 border-slate-100 border-t-blue-600" />
    </div>
  );
};

export const KPISkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-pulse flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div className="h-3 bg-slate-100 rounded w-1/3"></div>
            <div className="h-7 bg-slate-200 rounded w-2/3"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
          </div>
          <div className="h-10 w-10 bg-slate-100 rounded-xl shrink-0"></div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ cols?: number; rows?: number }> = ({ cols = 5, rows = 5 }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-pulse w-full">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex gap-4">
        {Array.from({ length: cols }).map((_, idx) => (
          <div key={idx} className="h-4 bg-slate-200 rounded flex-1"></div>
        ))}
      </div>
      <div className="divide-y divide-slate-150">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div key={cIdx} className="h-4 bg-slate-100 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-3 bg-slate-100 rounded w-2/3"></div>
          <div className="h-3 bg-slate-100 rounded w-1/2"></div>
          <div className="h-8 bg-slate-100 rounded-lg w-full mt-2"></div>
        </div>
      ))}
    </div>
  );
};
