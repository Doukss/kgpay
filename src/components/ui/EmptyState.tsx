import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-xl border border-slate-200 shadow-sm max-w-md mx-auto my-6">
      <div className="p-4 rounded-full bg-slate-50 text-slate-400 mb-4 shrink-0">
        {icon || <Inbox className="h-10 w-10 text-slate-400" />}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-xs">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
