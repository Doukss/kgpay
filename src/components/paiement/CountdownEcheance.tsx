import React from 'react';
import { StatutPaiement } from '@/lib/types';

interface CountdownEcheanceProps {
  statut: StatutPaiement;
  jourEcheance: number;
  className?: string;
}

export const CountdownEcheance: React.FC<CountdownEcheanceProps> = ({
  statut,
  jourEcheance,
  className = ''
}) => {
  if (statut === 'paye') {
    return <span className={`text-xs font-semibold text-green-600 ${className}`}>À jour ✓</span>;
  }

  const today = new Date().getDate();
  const diff = jourEcheance - today;

  if (diff > 0) {
    return (
      <span className={`text-xs font-semibold text-blue-600 ${className}`}>
        dans {diff} {diff === 1 ? 'jour' : 'jours'}
      </span>
    );
  } else if (diff === 0) {
    return (
      <span className={`text-xs font-semibold text-orange-500 animate-pulse ${className}`}>
        Aujourd'hui !
      </span>
    );
  } else {
    const retard = Math.abs(diff);
    return (
      <span className={`text-xs font-bold text-red-600 ${className}`}>
        en retard de {retard} {retard === 1 ? 'jour' : 'jours'}
      </span>
    );
  }
};
export default CountdownEcheance;
