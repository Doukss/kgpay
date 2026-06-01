'use client';

import React, { useState, useEffect } from 'react';
import { useKeurGuiStore } from '@/lib/store';
import { formatFCFA } from '@/lib/formatters';
import { PlanAbonnement } from '@/lib/types';
import { CardSkeleton } from '@/components/ui/LoadingSpinner';
import {
  Building,
  CreditCard,
  Bell,
  Cpu,
  Smartphone,
  Save,
  CheckCircle,
  HelpCircle,
  X,
  Key
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ParametresPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'agence' | 'abonnement' | 'notifications' | 'integrations'>('agence');
  
  const { 
    agencies, 
    activeAgencyId, 
    updateAgencySettings,
    superadminChangeAgencyPlan,
    tenants,
    plans
  } = useKeurGuiStore();

  const agency = agencies.find(a => a.id === activeAgencyId) || agencies[0];
  const agencyTenantsCount = tenants.filter(t => t.agenceId === activeAgencyId).length;

  // Local form states
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Modal controls
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [selectedApi, setSelectedApi] = useState<'wave' | 'orange_money' | 'whatsapp' | null>(null);
  const [apiKey, setApiKey] = useState('');
  
  // Mock connection states for gateways
  const [integrations, setIntegrations] = useState({
    wave: true,
    orange_money: false,
    whatsapp: true
  });

  // Mock Notification settings
  const [notifications, setNotifications] = useState({
    onRentReceived: true,
    onSmsFail: true,
    weeklyReport: false,
    dailySummary: true
  });

  // Load agency info into local state
  useEffect(() => {
    if (agency) {
      setNom(agency.nom);
      setEmail(agency.email);
      setTelephone(agency.telephone);
      setAdresse(agency.adresse);
    }
  }, [agency]);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgencySettings(activeAgencyId, { nom, email, telephone, adresse });
    toast.success('Paramètres de l\'agence mis à jour !');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mock logo upload
    if (e.target.files && e.target.files[0]) {
      setLogoPreview(URL.createObjectURL(e.target.files[0]));
      toast.success('Logo mis à jour (Simulé) !');
    }
  };

  const handleChangePlan = (planId: PlanAbonnement) => {
    superadminChangeAgencyPlan(activeAgencyId, planId);
    toast.success(`Votre forfait a été changé avec succès pour le plan ${planId.toUpperCase()} !`);
    setIsPlanModalOpen(false);
  };

  const handleConfigureApi = (api: 'wave' | 'orange_money' | 'whatsapp') => {
    setSelectedApi(api);
    setApiKey(integrations[api] ? '••••••••••••••••••••' : '');
    setIsApiModalOpen(true);
  };

  const handleSaveApi = () => {
    setIntegrations(prev => ({
      ...prev,
      [selectedApi as string]: apiKey.length > 0
    }));
    toast.success(`Intégration ${selectedApi?.toUpperCase().replace('_', ' ')} configurée !`);
    setIsApiModalOpen(false);
  };

  const getPlanDetails = (planId: PlanAbonnement) => {
    return plans.find(p => p.id === planId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Paramètres</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gérez les informations de l'agence, votre abonnement et les passerelles de paiement.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 flex gap-6 select-none overflow-x-auto pb-0.5">
        {[
          { id: 'agence', label: 'Agence', icon: <Building className="h-4.5 w-4.5" /> },
          { id: 'abonnement', label: 'Abonnement', icon: <CreditCard className="h-4.5 w-4.5" /> },
          { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4.5 w-4.5" /> },
          { id: 'integrations', label: 'Intégrations', icon: <Cpu className="h-4.5 w-4.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
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

      {/* Content panels */}
      <div className="space-y-6">

        {/* TAB 1: Agency Editor */}
        {activeTab === 'agence' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400">
                Informations de l'agence
              </h3>

              <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-slate-100 pb-6">
                {/* Logo Uploader */}
                <div className="relative h-20 w-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xl overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <span>{nom.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs font-bold text-slate-700 block">Logo de l'agence</span>
                  <label className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-250 hover:bg-slate-50 text-slate-650 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer">
                    Sélectionner un fichier
                    <input type="file" onChange={handleLogoUpload} className="hidden" accept="image/*" />
                  </label>
                  <p className="text-[10px] text-slate-400">Formats acceptés : PNG, JPG. Taille max : 2Mo.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nom de l'agence *</label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Téléphone *</label>
                  <input
                    type="text"
                    required
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Adresse email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Adresse postale *</label>
                  <input
                    type="text"
                    required
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <Save className="h-4 w-4" />
                Sauvegarder les modifications
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Subscription details */}
        {activeTab === 'abonnement' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div className="sm:col-span-2 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Plan actif</span>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-800 capitalize">{agency.plan}</h3>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Mensuel
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Votre abonnement se renouvelle automatiquement le <strong>{new Date(agency.dateRenouvellement).toLocaleDateString('fr-FR')}</strong> pour un montant de <strong>{formatFCFA(getPlanDetails(agency.plan)?.prixMensuel || 0)}</strong>.
                </p>
              </div>

              <button
                onClick={() => setIsPlanModalOpen(true)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm hover:shadow-md transition-colors cursor-pointer text-center"
              >
                Changer de plan
              </button>
            </div>

            {/* Quota gauges */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400">
                Statistiques d'utilisation ( quotas mensuels )
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Locataires quota */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-xs font-semibold text-slate-500">
                    <span>Nombre de locataires</span>
                    <span className="text-slate-850 font-bold">{agencyTenantsCount} / {agency.quotaLocataires}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        agencyTenantsCount >= agency.quotaLocataires ? 'bg-red-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, (agencyTenantsCount / agency.quotaLocataires) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Limite imposée par le forfait {agency.plan.toUpperCase()}</span>
                </div>

                {/* SMS quota */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-xs font-semibold text-slate-500">
                    <span>SMS envoyés ce mois</span>
                    <span className="text-slate-850 font-bold">{agency.nbSmsEnvoyesMois} / {agency.quotaSms === null ? '∞' : agency.quotaSms}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-600 transition-all"
                      style={{ width: `${agency.quotaSms === null ? 40 : Math.min(100, (agency.nbSmsEnvoyesMois / agency.quotaSms) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Relances directes sur téléphones sénégalais</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Notifications settings */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400">
              Paramètres des notifications (Agent)
            </h3>

            <div className="divide-y divide-slate-100 space-y-4">
              {[
                { 
                  id: 'onRentReceived', 
                  label: 'Notification à la réception d\'un loyer', 
                  desc: 'Recevoir une alerte instantanée quand un locataire paie son loyer en ligne.' 
                },
                { 
                  id: 'onSmsFail', 
                  label: 'Alerte en cas d\'échec de relance', 
                  desc: 'Être notifié immédiatement si un SMS ou WhatsApp n\'a pas pu être délivré.' 
                },
                { 
                  id: 'weeklyReport', 
                  label: 'Rapport hebdomadaire automatique', 
                  desc: 'Recevoir un récapitulatif comptable par email chaque lundi matin.' 
                },
                { 
                  id: 'dailySummary', 
                  label: 'Résumé journalier à 8h', 
                  desc: 'Recevoir la liste des locataires à relancer chaque matin.' 
                }
              ].map((notif) => (
                <div key={notif.id} className="flex items-center justify-between py-3">
                  <div className="space-y-0.5 max-w-md">
                    <span className="text-sm font-semibold text-slate-700 block">{notif.label}</span>
                    <span className="text-xs text-slate-400 block">{notif.desc}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={notifications[notif.id as 'onRentReceived']}
                      onChange={() => {
                        setNotifications(prev => ({
                          ...prev,
                          [notif.id]: !prev[notif.id as 'onRentReceived']
                        }));
                        toast.success('Préférence de notification mise à jour !');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Integrations */}
        {activeTab === 'integrations' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Wave card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between h-56">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-2xl">💛</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    integrations.wave ? 'bg-green-55/60 text-green-700 border-green-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    {integrations.wave ? 'Connecté' : 'Non connecté'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Passerelle Wave API</h4>
                  <p className="text-[11px] text-slate-400 leading-normal mt-1">
                    Permet d'encaisser directement les loyers via des liens de paiement Wave sécurisés.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleConfigureApi('wave')}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-250 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
              >
                Configurer API
              </button>
            </div>

            {/* OM card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between h-56">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-2xl">🧡</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    integrations.orange_money ? 'bg-green-55/60 text-green-700 border-green-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    {integrations.orange_money ? 'Connecté' : 'Non connecté'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Passerelle Orange Money</h4>
                  <p className="text-[11px] text-slate-400 leading-normal mt-1">
                    Permet de recevoir les règlements via la passerelle de paiement Orange Money Sénégal.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleConfigureApi('orange_money')}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-250 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
              >
                Configurer API
              </button>
            </div>

            {/* Whatsapp Business card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between h-56">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-2xl">💬</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    integrations.whatsapp ? 'bg-green-55/60 text-green-700 border-green-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    {integrations.whatsapp ? 'Connecté' : 'Non connecté'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">WhatsApp Business</h4>
                  <p className="text-[11px] text-slate-400 leading-normal mt-1">
                    Relances riches avec boutons interactifs et confirmation immédiate des paiements.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleConfigureApi('whatsapp')}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-250 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
              >
                Configurer API
              </button>
            </div>

          </div>
        )}

      </div>

      {/* MODAL: CHANGE PLAN */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-3xl w-full overflow-hidden animate-slide-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Changer de forfait d'abonnement</h3>
              <button 
                onClick={() => setIsPlanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((pl) => {
                const isActive = agency.plan === pl.id;
                return (
                  <div key={pl.id} className={`p-5 rounded-xl border flex flex-col justify-between h-80 ${
                    isActive ? 'border-blue-600 ring-2 ring-blue-500/10' : 'border-slate-200'
                  }`}>
                    <div>
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-slate-800 text-sm">{pl.nom}</h4>
                        {isActive && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">Actuel</span>}
                      </div>
                      <h3 className="text-xl font-black text-slate-850 mt-2">{formatFCFA(pl.prixMensuel)} <span className="text-[10px] text-slate-400 font-normal">/ mois</span></h3>
                      
                      <ul className="mt-4 space-y-1.5 text-[10px] text-slate-500">
                        {pl.fonctionnalites.map((f, i) => (
                          <li key={i} className="flex gap-1.5 items-start leading-tight">
                            <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {!isActive && (
                      <button
                        onClick={() => handleChangePlan(pl.id)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer transition-colors text-center mt-4"
                      >
                        Sélectionner {pl.nom.split(' ')[1]}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURE API KEYS */}
      {isApiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-slide-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 capitalize">Configuration {selectedApi?.replace('_', ' ')}</h3>
              <button 
                onClick={() => setIsApiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Clé API (Secret Key) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Key className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="live_sk_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {selectedApi === 'whatsapp' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Numéro WhatsApp lié *</label>
                  <input
                    type="text"
                    defaultValue="+221771234567"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <p className="text-[10px] text-slate-400 leading-normal flex gap-1.5 items-start">
                <HelpCircle className="h-4.5 w-4.5 text-slate-300 shrink-0" />
                Veuillez utiliser les clés API d'intégration fournies par vos comptes d'opérateurs Mobile Money.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsApiModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveApi}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
