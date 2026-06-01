import React from 'react';
import { formatFCFA } from '@/lib/formatters';

interface MontantFCFAProps {
  montant: number;
  className?: string;
}

export const MontantFCFA: React.FC<MontantFCFAProps> = ({ montant, className = '' }) => {
  return (
    <span className={`font-bold tracking-tight text-slate-800 ${className}`}>
      {formatFCFA(montant)}
    </span>
  );
};
export default MontantFCFA;
