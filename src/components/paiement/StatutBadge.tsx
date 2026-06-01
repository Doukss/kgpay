import React from 'react';
import { Badge } from '../ui/Badge';
import { StatutPaiement } from '@/lib/types';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle } from 'lucide-react';

interface StatutBadgeProps {
  statut: StatutPaiement;
  className?: string;
}

export const StatutBadge: React.FC<StatutBadgeProps> = ({ statut, className = '' }) => {
  const configs = {
    paye: {
      label: 'Payé',
      variant: 'success' as const,
      icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
    },
    partiel: {
      label: 'Partiel',
      variant: 'warning' as const,
      icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />
    },
    en_attente: {
      label: 'En attente',
      variant: 'primary' as const,
      icon: <Clock className="h-3.5 w-3.5 mr-1 animate-pulse" />
    },
    en_retard: {
      label: 'En retard',
      variant: 'danger' as const,
      icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />
    }
  };

  const current = configs[statut] || configs.en_attente;

  return (
    <Badge variant={current.variant} className={`flex items-center w-fit font-semibold ${className}`}>
      {current.icon}
      <span>{current.label}</span>
    </Badge>
  );
};
