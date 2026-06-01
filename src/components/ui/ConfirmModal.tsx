import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isLoading = false,
  variant = 'primary',
}) => {
  if (!isOpen) return null;

  const colorMap = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
    warning: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500 text-white',
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden transform scale-100 transition-transform duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {variant === 'danger' && <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />}
            {variant === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />}
            <h3 className="font-bold text-slate-800">{title}</h3>
          </div>
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all cursor-pointer flex items-center gap-1.5 ${colorMap[variant]} disabled:opacity-50`}
          >
            {isLoading && (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white shrink-0" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
