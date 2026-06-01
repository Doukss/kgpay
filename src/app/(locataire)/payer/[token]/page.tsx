'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useKeurGuiStore } from '@/lib/store';
import { formatFCFA, formatPhone } from '@/lib/formatters';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Check,
  Smartphone,
  ShieldCheck,
  AlertOctagon,
  FileText,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PayerLoyerPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const { tenants, processOnlinePayment } = useKeurGuiStore();

  const [tenant, setTenant] = useState<any>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'wave' | 'orange_money' | null>(null);
  const [paymentStep, setPaymentStep] = useState<'details' | 'loading' | 'success'>('details');

  // Verify token on mount
  useEffect(() => {
    if (token === 'expire' || !token.endsWith('-token')) {
      setIsValidToken(false);
      return;
    }

    const tenantId = token.replace('-token', '');
    const foundTenant = tenants.find(t => t.id === tenantId);

    if (foundTenant) {
      setTenant(foundTenant);
      setIsValidToken(true);
      // If already paid, skip to success screen
      if (foundTenant.statutMoisCourant === 'paye') {
        setPaymentStep('success');
        setSelectedMethod(foundTenant.operateurPrefere === 'wave' || foundTenant.operateurPrefere === 'orange_money' ? foundTenant.operateurPrefere : 'wave');
      }
    } else {
      setIsValidToken(false);
    }
  }, [token, tenants]);

  if (isValidToken === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <LoadingSpinner />
        <p className="text-xs text-slate-400 mt-2">Chargement du portail de paiement sécurisé...</p>
      </div>
    );
  }

  // Token expired screen
  if (!isValidToken) {
    return (
      <div className="max-w-md w-full mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl p-6 text-center space-y-6">
        <div className="h-14 w-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-100 shadow-xs">
          <AlertOctagon className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-800">Lien de paiement expiré</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Ce lien de paiement unique a expiré ou est invalide. Veuillez contacter votre agence ou votre bailleur pour obtenir un nouveau lien de règlement.
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="h-4.5 w-4.5 text-slate-400" />
          <span>KeurGui Pay • Paiement sécurisé</span>
        </div>
      </div>
    );
  }

  const handlePayClick = (method: 'wave' | 'orange_money') => {
    setSelectedMethod(method);
    setIsConfirmOpen(true);
  };

  const handleConfirmPayment = () => {
    setIsConfirmOpen(false);
    setPaymentStep('loading');

    // Simulate 2s payment processing delay
    setTimeout(() => {
      processOnlinePayment(tenant.id, selectedMethod!);
      setPaymentStep('success');
      toast.success('Paiement reçu avec succès !');
    }, 2000);
  };

  // Date maths
  const today = new Date().getDate();
  const isOverdue = tenant.statutMoisCourant === 'en_retard' || (tenant.statutMoisCourant === 'partiel' && today > tenant.jourEcheance);
  const daysDiff = Math.abs(tenant.jourEcheance - today);
  const currentMonthLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      
      {/* Header logo */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-11 w-11 rounded-xl bg-blue-600 items-center justify-center text-white shadow-md">
          <span className="font-black text-lg tracking-tight">K</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <span>Paiement sécurisé 🔒</span>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden">
        
        {/* STEP 1: Details and Payment triggers */}
        {paymentStep === 'details' && (
          <div className="p-6 space-y-6">
            {/* Salutations */}
            <div>
              <h2 className="text-lg font-bold text-slate-800">Bonjour {tenant.prenom} {tenant.nom},</h2>
              <p className="text-xs text-slate-500 mt-1">Vous êtes invité à régler le loyer de votre logement :</p>
            </div>

            {/* Invoice box */}
            <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Désignation de la facture</span>
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                Loyer — {tenant.bienDesignation} ({tenant.quartier})
              </p>
              <p className="text-xs text-slate-500 capitalize">{currentMonthLabel}</p>

              <div className="border-t border-slate-200/60 pt-3 flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Montant à régler</span>
                <span className="text-2xl font-black text-slate-800 tracking-tight">
                  {formatFCFA(tenant.loyerMensuel - tenant.montantPayeMoisCourant)}
                </span>
              </div>
            </div>

            {/* Overdue alert */}
            <div className="flex justify-between items-center text-xs p-3 rounded-lg border bg-slate-50/50">
              <span className="text-slate-500 font-medium">Échéance de paiement :</span>
              {isOverdue ? (
                <span className="bg-red-50 text-red-700 px-2 py-0.5 border border-red-100 rounded-md font-bold">
                  En retard de {daysDiff} jours
                </span>
              ) : (
                <span className="bg-green-50 text-green-700 px-2 py-0.5 border border-green-100 rounded-md font-bold">
                  Dans les temps (le {tenant.jourEcheance})
                </span>
              )}
            </div>

            {/* Payment buttons */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sélectionnez un mode de règlement</span>
              
              {/* Wave */}
              <button
                onClick={() => handlePayClick('wave')}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition-all cursor-pointer border border-yellow-500/40"
              >
                <span className="text-base">💛</span>
                Payer avec Wave
              </button>

              {/* Orange Money */}
              <button
                onClick={() => handlePayClick('orange_money')}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition-all cursor-pointer border border-orange-600/40"
              >
                <span className="text-base">🧡</span>
                Payer avec Orange Money
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Processing Spinner */}
        {paymentStep === 'loading' && (
          <div className="p-8 text-center space-y-6 py-16 animate-pulse">
            <LoadingSpinner />
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800">Transaction en cours</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Veuillez valider le paiement sur l'invite push USSD envoyée sur votre téléphone lié à <strong>{formatPhone(tenant.telephone)}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Success invoice display */}
        {paymentStep === 'success' && (
          <div className="p-6 text-center space-y-6">
            
            {/* Green Checkmark */}
            <div className="h-16 w-16 bg-green-100 text-green-600 border border-green-200 rounded-full flex items-center justify-center mx-auto shadow-xs animate-scale-up">
              <Check className="h-10 w-10 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-800">Paiement reçu !</h2>
              <p className="text-xs text-slate-400">Merci, votre loyer est désormais à jour.</p>
            </div>

            {/* Recipt details */}
            <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase font-bold text-[9px]">Locataire :</span>
                <span className="font-bold text-slate-700">{tenant.prenom} {tenant.nom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase font-bold text-[9px]">Loyer mensuel :</span>
                <span className="font-black text-slate-800">{formatFCFA(tenant.loyerMensuel)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase font-bold text-[9px]">Mode de règlement :</span>
                <span className="font-bold text-slate-700 capitalize">{selectedMethod?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase font-bold text-[9px]">Date de versement :</span>
                <span className="font-semibold text-slate-600">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-left text-[11px] text-blue-800 leading-normal flex gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <p>Votre reçu de quittance de loyer a également été expédié par message sur WhatsApp 💬.</p>
            </div>

            <button
              onClick={() => toast.success('Reçu de quittance PDF téléchargé (Simulé).')}
              className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <FileText className="h-4.5 w-4.5 text-slate-500" />
              Télécharger le reçu PDF
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden animate-slide-in">
            <div className="p-6 text-center space-y-4">
              <span className="text-3xl block">
                {selectedMethod === 'wave' ? '💛' : '🧡'}
              </span>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 text-sm">Confirmer la demande de paiement</h3>
                <p className="text-xs text-slate-600 leading-normal">
                  Vous allez valider un paiement de <strong>{formatFCFA(tenant.loyerMensuel - tenant.montantPayeMoisCourant)}</strong> via <strong>{selectedMethod === 'wave' ? 'Wave' : 'Orange Money'}</strong>.
                </p>
                <p className="text-[10px] text-slate-400">
                  Un push USSD ou un SMS interactif vous demandant de taper votre code secret sera envoyé sur votre numéro {formatPhone(tenant.telephone)}.
                </p>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex gap-2 select-none">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmPayment}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <div className="text-center text-xs text-slate-400">
        Propulsé par KeurGui Pay • Paiement 100% Sécurisé
      </div>
    </div>
  );
}
