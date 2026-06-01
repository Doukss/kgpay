'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useKeurGuiStore } from '@/lib/store';
import { formatFCFA, formatPhone } from '@/lib/formatters';
import { PlanAbonnement } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton, TableSkeleton } from '@/components/ui/LoadingSpinner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatutBadge } from '@/components/paiement/StatutBadge';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Users,
  MessageSquare,
  Activity,
  AlertTriangle,
  Award,
  Trash2,
  Send,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperadminTenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agencyId = params.id as string;

  const {
    agencies,
    tenants,
    payments,
    plans,
    superadminToggleAgency,
    superadminChangeAgencyPlan,
    deleteTenant // we can also support delete agency if needed
  } = useKeurGuiStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const agency = agencies.find(a => a.id === agencyId);

  if (!agency) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <EmptyState
          title="Agence introuvable"
          description="Cette agence n'existe pas ou a été supprimée de la plateforme."
          actionText="Retour aux agences"
          onAction={() => router.push('/superadmin/tenants')}
          icon={<XCircle className="h-10 w-10 text-red-500" />}
        />
      </div>
    );
  }

  // Get tenants of this agency
  const agencyTenants = tenants.filter(t => t.agenceId === agencyId);

  // Volume processed this month
  const volumeProcessed = payments
    .filter(p => {
      const t = tenants.find(ten => ten.id === p.locataireId);
      return t?.agenceId === agencyId && (p.statut === 'paye' || p.statut === 'partiel');
    })
    .reduce((acc, curr) => acc + curr.montantPaye, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'actif': return <Badge variant="success">Actif</Badge>;
      case 'essai': return <Badge variant="primary">Essai</Badge>;
      default: return <Badge variant="danger">Suspendu</Badge>;
    }
  };

  const handleToggle = () => {
    superadminToggleAgency(agencyId);
    toast.success(`Statut de l'agence changé avec succès.`);
  };

  const handleContact = () => {
    toast.success(`Messagerie ouverte pour contacter : ${agency.nom}`);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    toast.success(`L'agence ${agency.nom} a été supprimée de la plateforme.`);
    router.push('/superadmin/tenants');
  };

  const handlePlanChange = (planId: PlanAbonnement) => {
    superadminChangeAgencyPlan(agencyId, planId);
    toast.success(`Forfait de l'agence mis à jour vers : ${planId.toUpperCase()}`);
    setIsPlanModalOpen(false);
  };

  // Mock activity logs for this agency
  const activityLogs = [
    { text: 'Connexion de l\'agent (Horizon Admin)', date: 'il y a 2 heures', type: 'info' },
    { text: 'Relances automatiques SMS envoyées (J-3)', date: 'hier, 08:00', type: 'success' },
    { text: 'Paiement reçu via Wave de Moussa Diallo', date: '19 Juin 2026, 12:50', type: 'success' },
    { text: 'Configuration de l\'intégration WhatsApp modifiée', date: '15 Juin 2026, 11:30', type: 'info' },
    { text: 'Échec de délivrabilité SMS pour le numéro +221767890123', date: '06 Juin 2026, 08:35', type: 'warning' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <CardSkeleton />
        <TableSkeleton rows={3} cols={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Back button */}
      <button
        onClick={() => router.push('/superadmin/tenants')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux agences
      </button>

      {/* Header Profile */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-black text-xl shrink-0">
            {agency.nom.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{agency.nom}</h1>
              {getStatusBadge(agency.statut)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              ID Agence: {agency.id}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="px-3.5 py-2 border border-slate-250 hover:bg-slate-50 text-slate-650 text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Award className="h-4 w-4 text-blue-650" />
            Changer de plan
          </button>
          
          <button
            onClick={handleToggle}
            className={`px-3.5 py-2 border text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              agency.statut === 'suspendu' 
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
            }`}
          >
            {agency.statut === 'suspendu' ? (
              <>
                <ToggleRight className="h-4.5 w-4.5 shrink-0" />
                Réactiver
              </>
            ) : (
              <>
                <ToggleLeft className="h-4.5 w-4.5 shrink-0" />
                Suspendre
              </>
            )}
          </button>

          <button
            onClick={handleContact}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            Message
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all cursor-pointer shrink-0"
            title="Supprimer l'agence"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card & Plans */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5 md:col-span-2">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
            Fiche agence
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm leading-relaxed">
            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Adresse email</span>
                <span className="font-semibold text-slate-700">{agency.email}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Téléphone</span>
                <span className="font-semibold text-slate-700">{agency.telephone}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Calendar className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Date d'inscription</span>
                <span className="font-semibold text-slate-700">{new Date(agency.dateInscription).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Building2 className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Adresse physique</span>
                <span className="font-semibold text-slate-700">{agency.adresse}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 my-4" />

          {/* Stats info box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-center">
              <span className="text-[9px] uppercase font-bold text-slate-450 block">Locataires</span>
              <span className="font-bold text-slate-800 text-lg block mt-1">{agencyTenants.length} / {agency.quotaLocataires}</span>
            </div>
            <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-center">
              <span className="text-[9px] uppercase font-bold text-slate-450 block">SMS Envoyés</span>
              <span className="font-bold text-slate-800 text-lg block mt-1">{agency.nbSmsEnvoyesMois} / {agency.quotaSms === null ? '∞' : agency.quotaSms}</span>
            </div>
            <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-center">
              <span className="text-[9px] uppercase font-bold text-slate-450 block">Délivrabilité</span>
              <span className="font-black text-green-600 text-lg block mt-1">98.4%</span>
            </div>
            <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-center">
              <span className="text-[9px] uppercase font-bold text-slate-450 block">Loyers ce mois</span>
              <span className="font-bold text-slate-800 text-lg block mt-1 truncate">{formatFCFA(volumeProcessed)}</span>
            </div>
          </div>
        </div>

        {/* Renew and Contract summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
              Contrat SaaS
            </h3>
            
            <div className="mt-4 space-y-3 text-xs leading-normal">
              <div className="flex justify-between">
                <span className="text-slate-450">Forfait actif :</span>
                <span className="font-bold text-slate-700 capitalize">{agency.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Frais d'abonnement :</span>
                <span className="font-bold text-slate-850">{formatFCFA(agency.mrrContribution)} / mois</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Prochain prélèvement :</span>
                <span className="font-semibold text-slate-700">{new Date(agency.dateRenouvellement).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          {/* Quota warning tag */}
          {agencyTenants.length >= agency.quotaLocataires && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-[10px] rounded-lg leading-normal flex gap-1.5 items-start">
              <AlertTriangle className="h-4.5 w-4.5 text-red-650 shrink-0" />
              <p>Cette agence a atteint son quota de locataires. Ses formulaires de création sont bloqués.</p>
            </div>
          )}
        </div>

      </div>

      {/* Tenants list of this Agency (Read-only) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
            Locataires gérés par l'agence ({agencyTenants.length})
          </h3>
        </div>

        {agencyTenants.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Inbox className="h-8 w-8 mb-2 mx-auto" />
            <p className="text-sm">Aucun locataire enregistré pour cette agence.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                  <th className="px-6 py-3.5">Nom complet</th>
                  <th className="px-6 py-3.5">Bien</th>
                  <th className="px-6 py-3.5">Quartier</th>
                  <th className="px-6 py-3.5">Loyer mensuel</th>
                  <th className="px-6 py-3.5">Statut mois</th>
                  <th className="px-6 py-3.5 text-right">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {agencyTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-800">{t.prenom} {t.nom}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{formatPhone(t.telephone)}</div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{t.bienDesignation}</td>
                    <td className="px-6 py-3.5 text-slate-500">{t.quartier}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">{formatFCFA(t.loyerMensuel)}</td>
                    <td className="px-6 py-3.5">
                      <StatutBadge statut={t.statutMoisCourant} />
                    </td>
                    <td className="px-6 py-3.5 text-right text-xs text-slate-550">
                      {new Date(t.dateCreation).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Logs (Super Admin view) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400 mb-4">
          Journal d'activité de l'agence
        </h3>

        <div className="space-y-4 select-none">
          {activityLogs.map((log, idx) => {
            const dotColor = log.type === 'success' ? 'bg-green-500' : log.type === 'warning' ? 'bg-red-500' : 'bg-blue-500';
            return (
              <div key={idx} className="flex gap-3 text-xs items-center">
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${dotColor}`} />
                <p className="flex-1 text-slate-650">{log.text}</p>
                <span className="text-slate-400">{log.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: CHANGE PLAN (SUPER ADMIN ADMIN OVERLAY) */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden animate-slide-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Modifier l'abonnement de : {agency.nom}</h3>
              <button 
                onClick={() => setIsPlanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Sélectionnez le nouveau forfait pour cette agence. Les quotas de locataires et de SMS seront immédiatement recalculés.
              </p>

              <div className="space-y-2">
                {plans.map((pl) => {
                  const isActive = agency.plan === pl.id;
                  return (
                    <button
                      key={pl.id}
                      onClick={() => handlePlanChange(pl.id)}
                      className={`w-full p-4 border rounded-xl text-left transition-all duration-150 flex justify-between items-center cursor-pointer ${
                        isActive 
                          ? 'border-blue-600 bg-blue-50/20 text-blue-800' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <span className="font-bold block text-sm capitalize">{pl.nom}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Limite : {pl.quotaLocataires} locataires • {pl.quotaSms === null ? 'SMS Illimités' : `${pl.quotaSms} SMS/mois`}
                        </span>
                      </div>
                      <span className="font-black text-sm">{formatFCFA(pl.prixMensuel)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL CONFIRMATION */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer définitivement l'agence"
        message={`Attention, vous allez radier l'agence "${agency.nom}" de la plateforme. Cette action supprimera tous ses locataires, ses relances programmées et son historique de facturation. Cette opération est irréversible.`}
        confirmText="Supprimer définitivement"
        variant="danger"
      />

    </div>
  );
}
