import React from 'react';

interface StatusDotProps {
  status: 'operationnel' | 'degrade' | 'hors_service';
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, className = '' }) => {
  const colorMap = {
    operationnel: 'bg-green-500 shadow-green-500/50',
    degrade: 'bg-orange-500 shadow-orange-500/50',
    hors_service: 'bg-red-500 shadow-red-500/50',
  };

  return (
    <span 
      className={`inline-block h-2.5 w-2.5 rounded-full shadow-sm shrink-0 ${colorMap[status]} ${className}`} 
      title={status === 'operationnel' ? 'Opérationnel' : status === 'degrade' ? 'Dégradé' : 'Hors service'}
    />
  );
};
