export const formatFCFA = (amount: number): string => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
    .replace('XOF', 'FCFA')
    .replace('F CFA', 'FCFA')
    .replace('F CFA', 'FCFA');
};

export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/\s+/g, '');
  if (!cleaned.startsWith('+221')) {
    if (cleaned.length === 9) {
      cleaned = '+221' + cleaned;
    } else if (cleaned.startsWith('221') && cleaned.length === 12) {
      cleaned = '+' + cleaned;
    }
  }
  return cleaned.replace(/(\+221)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
};
