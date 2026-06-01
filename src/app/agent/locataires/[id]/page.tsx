'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useKeurGuiStore } from '@/lib/store';
import { formatFCFA, formatPhone } from '@/lib/formatters';
import { StatutBadge } from '@/components/paiement/StatutBadge';
import { CountdownEcheance } from '@/components/paiement/CountdownEcheance';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  User,
  Phone,
  Smartphone,
  Building,
  Calendar,
  DollarSign,
  History,
  Send,
  Plus,
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Info,
  CreditCard,
  MessageSquare,
  ChevronRight,
  AlertTriangle,
  Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LocataireFichePage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const { tenants, payments, reminders, activeAgencyId, addManualPayment, sendReminder } = useKeurGuiStore();

  const [activeTab, setActiveTab] = useState<'apercu' | 'historique' | 'relances'>('apercu');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Form states for Manual Payment Modal
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'wave' | 'orange_money' | 'especes' | 'virement'>('wave');
  const [payRef, setPayRef] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payNote, setPayNote] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Form states for Reminder Modal
  const [selectedScenario, setSelectedScenario] = useState<'j-3' | 'j-1' | 'j+1'>('j-1');
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'whatsapp'>('sms');

  // Find tenant
  const tenant = tenants.find(t => t.id === tenantId && t.agenceId === activeAgencyId);

  // Set initial payment amount equal to rent when opening modal
  useEffect(() => {
    if (tenant) {
      setPayAmount(tenant.loyerMensuel - tenant.montantPayeMoisCourant);
    }
  }, [tenant]);

  if (!tenant) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <EmptyState
          title="Locataire introuvable"
          description="Ce locataire n'existe pas ou n'appartient pas à votre agence."
          actionText="Retour aux locataires"
          onAction={() => router.push('/agent/locataires')}
          icon={<XCircle className="h-10 w-10 text-red-500" />}
        />
      </div>
    );
  }

  // Get payments and reminders for this tenant
  const tenantPayments = payments.filter(p => p.locataireId === tenantId).sort((a, b) => b.mois.localeCompare(a.mois));
  const tenantReminders = reminders.filter(r => r.locataireId === tenantId).sort((a, b) => b.dateEnvoi.localeCompare(a.dateEnvoi));

  const handleManualPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      toast.error('Veuillez saisir un montant supérieur à 0');
      return;
    }

    setIsSubmittingPayment(true);
    setTimeout(() => {
      addManualPayment(tenantId, {
        montantPaye: payAmount,
        operateur: payMethod,
        referenceTransaction: payRef || undefined,
        datePaiement: new Date(payDate).toISOString(),
        note: payNote || undefined
      });
      setIsSubmittingPayment(false);
      setIsPaymentModalOpen(false);
      toast.success('Paiement enregistré avec succès !');
    }, 600);
  };

  const handleManualReminderTrigger = () => {
    const res = sendReminder(tenantId, selectedScenario, selectedChannel);
    if (res.success) {
      toast.success(res.message);
      setIsReminderModalOpen(false);
    } else {
      toast.error(res.message);
    }
  };

  // Progress calculations for partial payments
  const pctPaid = Math.min(100, Math.round((tenant.montantPayeMoisCourant / tenant.loyerMensuel) * 100));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push('/agent/locataires')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux locataires
      </button>

      {/* Header Info Sheet */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-black text-xl shrink-0">
            {tenant.prenom.slice(0, 1)}{tenant.nom.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                {tenant.prenom} {tenant.nom}
              </h1>
              <StatutBadge statut={tenant.statutMoisCourant} />
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1.5">
              <Phone className="h-4 w-4 text-slate-400" />
              {formatPhone(tenant.telephone)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs hover:shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Enregistrer un paiement
          </button>
          {tenant.statutMoisCourant !== 'paye' && (
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-xs hover:shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              Relancer
            </button>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 flex gap-6 select-none">
        {[
          { id: 'apercu', label: 'Aperçu', icon: <Info className="h-4.5 w-4.5" /> },
          { id: 'historique', label: 'Historique des paiements', icon: <History className="h-4.5 w-4.5" /> },
          { id: 'relances', label: 'Relances envoyées', icon: <MessageSquare className="h-4.5 w-4.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        
        {/* TAB 1: Overview */}
        {activeTab === 'apercu' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Lease details card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm md:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400">
                Informations du bail
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div className="flex gap-3">
                  <Building className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Désignation du bien</span>
                    <span className="font-bold text-slate-800">{tenant.bienDesignation}</span>
                    <span className="block text-xs text-slate-500">{tenant.quartier}, Dakar</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <DollarSign className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Montant du loyer</span>
                    <span className="font-bold text-slate-850">{formatFCFA(tenant.loyerMensuel)} / mois</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Échéance de paiement</span>
                    <span className="font-semibold text-slate-700">Chaque {tenant.jourEcheance} du mois</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Date d'entrée dans les lieux</span>
                    <span className="font-semibold text-slate-700">{new Date(tenant.dateDebutBail).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Smartphone className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Mode de paiement préféré</span>
                    <span className="font-semibold text-slate-700 capitalize">{tenant.operateurPrefere.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <FileText className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Caution encaissée</span>
                    <span className="font-semibold text-slate-700">{tenant.montantCaution ? formatFCFA(tenant.montantCaution) : 'Aucune'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rent status indicators */}
            <div className="space-y-4">
              {/* Payment status this month */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400">
                  Loyer de Juin 2026
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-slate-500">Payé ce mois-ci</span>
                    <span className="font-black text-slate-800">
                      {formatFCFA(tenant.montantPayeMoisCourant)} / {formatFCFA(tenant.loyerMensuel)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        tenant.statutMoisCourant === 'paye' ? 'bg-green-600' : 'bg-orange-500'
                      }`}
                      style={{ width: `${pctPaid}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-right text-slate-400 font-bold">{pctPaid}% complété</div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Échéance</span>
                  <CountdownEcheance statut={tenant.statutMoisCourant} jourEcheance={tenant.jourEcheance} />
                </div>
              </div>

              {/* Arrears card if exists */}
              {tenant.arrieresCumules > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-xs space-y-2">
                  <div className="flex gap-2 text-red-700 items-center">
                    <AlertTriangle className="h-4.5 w-4.5" />
                    <span className="font-bold text-sm">Arriérés cumulés</span>
                  </div>
                  <h4 className="text-2xl font-black text-red-600 tracking-tight">{formatFCFA(tenant.arrieresCumules)}</h4>
                  <p className="text-[11px] text-red-700 leading-normal">
                    Ce montant correspond à {Math.round(tenant.arrieresCumules / tenant.loyerMensuel)} loyer(s) mensuel(s) impayé(s) des mois précédents.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: Payments History */}
        {activeTab === 'historique' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {tenantPayments.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Inbox className="h-8 w-8 mb-2 mx-auto" />
                <p className="text-sm">Aucun paiement enregistré pour ce locataire.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-250 text-slate-500 font-semibold text-xs uppercase">
                      <th className="px-6 py-4">Mois de facturation</th>
                      <th className="px-6 py-4">Loyer attendu</th>
                      <th className="px-6 py-4">Montant payé</th>
                      <th className="px-6 py-4">Date de transaction</th>
                      <th className="px-6 py-4">Mode</th>
                      <th className="px-6 py-4">Référence</th>
                      <th className="px-6 py-4 text-right">Reçu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {tenantPayments.map((p) => {
                      const isComplete = p.montantPaye >= p.montantAttendu;
                      const textClass = isComplete 
                        ? 'text-green-700 font-bold bg-green-50/50' 
                        : p.montantPaye > 0 
                          ? 'text-orange-700 font-bold bg-orange-50/40' 
                          : 'text-red-700 font-bold bg-red-50/40';

                      return (
                        <tr key={p.id} className={`hover:bg-slate-50/30 transition-colors ${textClass}`}>
                          <td className="px-6 py-4 font-bold capitalize">
                            {new Date(p.mois + '-02').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-slate-800">{formatFCFA(p.montantAttendu)}</td>
                          <td className="px-6 py-4 text-slate-800 font-bold">{formatFCFA(p.montantPaye)}</td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {p.datePaiement ? new Date(p.datePaiement).toLocaleDateString('fr-FR') : '—'}
                          </td>
                          <td className="px-6 py-4 capitalize text-slate-600 text-xs">
                            {p.operateur.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-400">{p.referenceTransaction || '—'}</td>
                          <td className="px-6 py-4 text-right">
                            {isComplete ? (
                              <button
                                onClick={() => toast.success('Reçu PDF en cours de téléchargement (Simulé)')}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                                title="Reçu PDF"
                              >
                                <FileText className="h-4.5 w-4.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-red-500 font-bold">Impayé</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Reminders Timeline */}
        {activeTab === 'relances' && (
          <div className="space-y-6">
            {/* Quick manual alert box */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Déclencher une relance manuelle immédiate</h4>
                <p className="text-xs text-slate-500 mt-0.5">Envoyer un SMS ou un message WhatsApp personnalisé.</p>
              </div>
              <button
                onClick={() => setIsReminderModalOpen(true)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                Déclencher
              </button>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400 mb-6">
                Journal des relances
              </h3>

              {tenantReminders.length === 0 ? (
                <div className="text-center text-slate-400 py-6">
                  <Inbox className="h-8 w-8 mb-2 mx-auto" />
                  <p className="text-sm">Aucune relance n'a encore été envoyée à ce locataire.</p>
                </div>
              ) : (
                <div className="relative pl-6 border-l border-slate-200 space-y-6 ml-2 select-none">
                  {tenantReminders.map((rel) => {
                    const isSuccess = rel.statutEnvoi === 'envoye';
                    return (
                      <div key={rel.id} className="relative">
                        {/* Bullet point icon */}
                        <span className={`absolute -left-[31px] top-1 h-5 w-5 rounded-full border border-white flex items-center justify-center ${
                          isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {isSuccess ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        </span>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">
                              Relance {rel.type.toUpperCase()} • {rel.canal.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(rel.dateEnvoi).toLocaleDateString('fr-FR')} à {new Date(rel.dateEnvoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs font-mono text-slate-600 leading-normal max-w-2xl">
                            {rel.message}
                          </div>
                          {!isSuccess && (
                            <div className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                              <span>Échec d'envoi (Numéro ou quota invalide)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL: REGISTER MANUAL PAYMENT */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-slide-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Enregistrer un paiement manuel</h3>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleManualPaymentSubmit}>
              <div className="p-6 space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Montant payé (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mode de paiement *</label>
                  <select
                    value={payMethod}
                    onChange={(e: any) => setPayMethod(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="wave">Wave</option>
                    <option value="orange_money">Orange Money</option>
                    <option value="especes">Espèces</option>
                    <option value="virement">Virement bancaire</option>
                  </select>
                </div>

                {/* Ref */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Référence de transaction (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="ex: WV-8822-1200"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date de paiement *</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes / Remarques</label>
                  <textarea
                    rows={2}
                    placeholder="Versement en espèces, justificatif remis..."
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingPayment && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />}
                  Confirmer le paiement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRIGGER MANUAL REMINDER */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-slide-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Déclencher une relance manuelle</h3>
              <button 
                onClick={() => setIsReminderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Type / Scenario */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Modèle de message *</label>
                <select
                  value={selectedScenario}
                  onChange={(e: any) => setSelectedScenario(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="j-3">Rappel doux (J-3)</option>
                  <option value="j-1">Rappel d'échéance (J-1)</option>
                  <option value="j+1">Retard urgent (J+1)</option>
                </select>
              </div>

              {/* Canal / Channel */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Canal d'expédition *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'sms', label: 'SMS 📱' },
                    { id: 'whatsapp', label: 'WhatsApp 💬' }
                  ].map(ch => (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChannel(ch.id as any)}
                      className={`py-2 px-3 text-xs font-bold border rounded-lg transition-colors cursor-pointer ${
                        selectedChannel === ch.id
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-xs text-orange-800 leading-normal flex gap-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  Ce message sera envoyé directement au numéro <strong>{formatPhone(tenant.telephone)}</strong>. 
                  Vous pourrez suivre son statut dans l'onglet des relances.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleManualReminderTrigger}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Envoyer la relance
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
