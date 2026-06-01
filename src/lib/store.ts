import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Locataire,
  Agence,
  Plan,
  StatutSysteme,
  ActiviteFeed,
  ScenarioRelance,
  Paiement,
  Relance,
  StatutPaiement,
  Operateur,
  PlanAbonnement,
  TypeRelance,
  CanalRelance
} from './types';
import {
  MOCK_LOCATAIRES,
  MOCK_AGENCES,
  MOCK_PAIEMENTS,
  MOCK_SCENARIOS,
  MOCK_RELANCES,
  MOCK_SYSTEM_STATUS,
  MOCK_FEED,
  MOCK_PLANS
} from './mock-data';

interface KeurGuiState {
  activeRole: 'agent' | 'locataire' | 'superadmin';
  activeAgencyId: string;
  tenants: Locataire[];
  payments: Paiement[];
  agencies: Agence[];
  scenarios: ScenarioRelance[];
  reminders: Relance[];
  systemStatus: StatutSysteme[];
  activities: ActiviteFeed[];
  plans: Plan[];
  
  // Actions
  setRole: (role: 'agent' | 'locataire' | 'superadmin') => void;
  setActiveAgency: (agencyId: string) => void;
  
  // Locataires
  addTenant: (tenantData: Omit<Locataire, 'id' | 'agenceId' | 'statutMoisCourant' | 'montantPayeMoisCourant' | 'dateCreation'>) => { success: boolean; error?: string };
  updateTenant: (id: string, updates: Partial<Locataire>) => void;
  deleteTenant: (id: string) => void;
  
  // Payments
  addManualPayment: (tenantId: string, payment: {
    montantPaye: number;
    operateur: Operateur;
    referenceTransaction?: string;
    datePaiement: string;
    note?: string;
  }) => void;
  processOnlinePayment: (tenantId: string, operator: 'wave' | 'orange_money') => void;
  
  // Reminders
  sendReminder: (tenantId: string, type: TypeRelance, canal: CanalRelance) => { success: boolean; message: string };
  toggleScenario: (id: string) => void;
  updateScenarioTemplate: (id: string, template: string) => void;
  cancelQueuedReminder: (id: string) => void;
  retryReminder: (id: string) => void;
  
  // Agency Config
  updateAgencySettings: (agencyId: string, settings: {
    nom: string;
    email: string;
    telephone: string;
    adresse: string;
  }) => void;
  
  // Super Admin actions
  superadminUpdatePlan: (planId: PlanAbonnement, updates: Partial<Plan>) => void;
  superadminToggleAgency: (agencyId: string) => void;
  superadminChangeAgencyPlan: (agencyId: string, plan: PlanAbonnement) => void;
  resetAllData: () => void;
}

export const useKeurGuiStore = create<KeurGuiState>()(
  persist(
    (set, get) => ({
      activeRole: 'agent',
      activeAgencyId: 'agence-horizon',
      tenants: MOCK_LOCATAIRES,
      payments: MOCK_PAIEMENTS,
      agencies: MOCK_AGENCES,
      scenarios: MOCK_SCENARIOS,
      reminders: MOCK_RELANCES,
      systemStatus: MOCK_SYSTEM_STATUS,
      activities: MOCK_FEED,
      plans: MOCK_PLANS,

      setRole: (role) => set({ activeRole: role }),
      setActiveAgency: (agencyId) => set({ activeAgencyId: agencyId }),

      addTenant: (tenantData) => {
        const agencyId = get().activeAgencyId;
        const agency = get().agencies.find(a => a.id === agencyId);
        
        if (agency) {
          // Check quota limits
          const agencyTenantsCount = get().tenants.filter(t => t.agenceId === agencyId).length;
          if (agencyTenantsCount >= agency.quotaLocataires) {
            return {
              success: false,
              error: `Quota de locataires atteint (${agency.quotaLocataires}/${agency.quotaLocataires}). Veuillez passer au plan supérieur.`
            };
          }
        }

        const id = `${tenantData.prenom.toLowerCase()}-${tenantData.nom.toLowerCase()}-${Date.now().toString().slice(-4)}`;
        const newTenant: Locataire = {
          ...tenantData,
          id,
          agenceId: agencyId,
          statutMoisCourant: 'en_attente',
          montantPayeMoisCourant: 0,
          dateCreation: new Date().toISOString()
        };

        const newActivity: ActiviteFeed = {
          id: `act-${Date.now()}`,
          type: 'nouveau_locataire',
          description: `Nouveau locataire ajouté : ${tenantData.prenom} ${tenantData.nom}`,
          timestamp: new Date().toISOString(),
          locataireId: id
        };

        set((state) => {
          const updatedAgencies = state.agencies.map(a => 
            a.id === agencyId ? { ...a, nbLocataires: a.nbLocataires + 1 } : a
          );
          return {
            tenants: [newTenant, ...state.tenants],
            activities: [newActivity, ...state.activities],
            agencies: updatedAgencies
          };
        });

        return { success: true };
      },

      updateTenant: (id, updates) => set((state) => {
        const tenants = state.tenants.map(t => t.id === id ? { ...t, ...updates } : t);
        return { tenants };
      }),

      deleteTenant: (id) => set((state) => {
        const tenant = state.tenants.find(t => t.id === id);
        const agencyId = tenant?.agenceId;
        const updatedTenants = state.tenants.filter(t => t.id !== id);
        const updatedAgencies = state.agencies.map(a => 
          a.id === agencyId ? { ...a, nbLocataires: Math.max(0, a.nbLocataires - 1) } : a
        );
        
        return {
          tenants: updatedTenants,
          agencies: updatedAgencies
        };
      }),

      addManualPayment: (tenantId, paymentDetails) => {
        const tenant = get().tenants.find(t => t.id === tenantId);
        if (!tenant) return;

        const newPaymentId = `pay-manual-${Date.now()}`;
        const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-06"
        
        const newPayment: Paiement = {
          id: newPaymentId,
          locataireId: tenantId,
          mois: currentMonth,
          montantAttendu: tenant.loyerMensuel,
          montantPaye: paymentDetails.montantPaye,
          datePaiement: paymentDetails.datePaiement,
          operateur: paymentDetails.operateur,
          referenceTransaction: paymentDetails.referenceTransaction,
          statut: 'paye', // Manual payments are usually confirmed immediately
          note: paymentDetails.note
        };

        const currentPaid = tenant.montantPayeMoisCourant + paymentDetails.montantPaye;
        let newStatut: StatutPaiement = 'en_attente';
        if (currentPaid >= tenant.loyerMensuel) {
          newStatut = 'paye';
        } else if (currentPaid > 0) {
          newStatut = 'partiel';
        }

        const newActivity: ActiviteFeed = {
          id: `act-${Date.now()}`,
          type: 'paiement',
          description: `M. ${tenant.prenom} ${tenant.nom} a payé ${paymentDetails.montantPaye.toLocaleString('fr-FR')} FCFA (${paymentDetails.operateur.toUpperCase()})`,
          timestamp: new Date().toISOString(),
          locataireId: tenantId
        };

        set((state) => {
          const tenants = state.tenants.map(t => 
            t.id === tenantId 
              ? { 
                  ...t, 
                  statutMoisCourant: newStatut, 
                  montantPayeMoisCourant: Math.min(t.loyerMensuel, currentPaid),
                  arrieresCumules: newStatut === 'paye' ? Math.max(0, t.arrieresCumules - t.loyerMensuel) : t.arrieresCumules
                } 
              : t
          );
          
          return {
            tenants,
            payments: [newPayment, ...state.payments],
            activities: [newActivity, ...state.activities]
          };
        });
      },

      processOnlinePayment: (tenantId, operator) => {
        const tenant = get().tenants.find(t => t.id === tenantId);
        if (!tenant) return;

        const newPaymentId = `pay-online-${Date.now()}`;
        const currentMonth = new Date().toISOString().slice(0, 7);
        const ref = `${operator.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newPayment: Paiement = {
          id: newPaymentId,
          locataireId: tenantId,
          mois: currentMonth,
          montantAttendu: tenant.loyerMensuel,
          montantPaye: tenant.loyerMensuel,
          datePaiement: new Date().toISOString(),
          operateur: operator,
          referenceTransaction: ref,
          statut: 'paye'
        };

        const newActivity: ActiviteFeed = {
          id: `act-${Date.now()}`,
          type: 'paiement',
          description: `${tenant.prenom} ${tenant.nom} a payé en ligne ${tenant.loyerMensuel.toLocaleString('fr-FR')} FCFA via ${operator === 'wave' ? 'Wave' : 'Orange Money'}`,
          timestamp: new Date().toISOString(),
          locataireId: tenantId
        };

        set((state) => {
          const tenants = state.tenants.map(t => 
            t.id === tenantId 
              ? { 
                  ...t, 
                  statutMoisCourant: 'paye', 
                  montantPayeMoisCourant: t.loyerMensuel,
                  arrieresCumules: Math.max(0, t.arrieresCumules - t.loyerMensuel)
                } 
              : t
          );
          return {
            tenants,
            payments: [newPayment, ...state.payments],
            activities: [newActivity, ...state.activities]
          };
        });
      },

      sendReminder: (tenantId, type, canal) => {
        const tenant = get().tenants.find(t => t.id === tenantId);
        if (!tenant) return { success: false, message: 'Locataire introuvable' };

        const scenario = get().scenarios.find(s => s.type === type);
        const template = scenario?.templateMessage || '';

        // Replace template variables
        const paymentLink = `${window.location.origin}/payer/${tenantId}-token`;
        const daysOverdue = Math.max(1, new Date().getDate() - tenant.jourEcheance);
        
        const message = template
          .replace(/{prenom}/g, tenant.prenom)
          .replace(/{nom}/g, tenant.nom)
          .replace(/{montant}/g, tenant.loyerMensuel.toLocaleString('fr-FR'))
          .replace(/{bien}/g, tenant.bienDesignation)
          .replace(/{date_echeance}/g, `${tenant.jourEcheance} du mois`)
          .replace(/{lien_paiement}/g, paymentLink)
          .replace(/{jours_retard}/g, daysOverdue.toString());

        // Simulate failure for specific numbers / cases
        // E.g. Aissatou Niang's phone has issues in monitoring, or simple random check
        const isFailure = tenant.telephone.includes('767890123') && Math.random() > 0.4;
        const statutEnvoi: Relance['statutEnvoi'] = isFailure ? 'echec' : 'envoye';

        const newRelance: Relance = {
          id: `rel-${Date.now()}`,
          locataireId: tenantId,
          type,
          canal,
          message,
          dateEnvoi: new Date().toISOString(),
          statutEnvoi
        };

        const newActivity: ActiviteFeed = {
          id: `act-${Date.now()}`,
          type: isFailure ? 'echec_sms' : 'relance',
          description: isFailure 
            ? `Échec d'envoi de la relance ${canal.toUpperCase()} à ${tenant.prenom} ${tenant.nom}`
            : `Relance ${canal.toUpperCase()} envoyée à ${tenant.prenom} ${tenant.nom}`,
          timestamp: new Date().toISOString(),
          locataireId: tenantId
        };

        set((state) => {
          // Increment SMS count for agency if it's SMS and succeeded
          const updatedAgencies = state.agencies.map(a => {
            if (a.id === tenant.agenceId && canal === 'sms' && !isFailure) {
              return { ...a, nbSmsEnvoyesMois: a.nbSmsEnvoyesMois + 1 };
            }
            return a;
          });

          // Update tenant's last reminder date
          const updatedTenants = state.tenants.map(t => 
            t.id === tenantId ? { ...t, dateDerniereRelance: new Date().toISOString() } : t
          );

          // Update scenario last sent date
          const updatedScenarios = state.scenarios.map(s => 
            s.type === type ? { ...s, dernierEnvoi: new Date().toISOString() } : s
          );

          return {
            reminders: [newRelance, ...state.reminders],
            activities: [newActivity, ...state.activities],
            agencies: updatedAgencies,
            scenarios: updatedScenarios,
            tenants: updatedTenants
          };
        });

        if (isFailure) {
          return { success: false, message: 'Échec de l\'envoi de la relance (erreur réseau opérateur).' };
        }
        return { success: true, message: `Relance envoyée avec succès par ${canal.toUpperCase()}!` };
      },

      toggleScenario: (id) => set((state) => {
        const scenarios = state.scenarios.map(s => s.id === id ? { ...s, actif: !s.actif } : s);
        return { scenarios };
      }),

      updateScenarioTemplate: (id, template) => set((state) => {
        const scenarios = state.scenarios.map(s => s.id === id ? { ...s, templateMessage: template } : s);
        return { scenarios };
      }),

      cancelQueuedReminder: (id) => set((state) => {
        const reminders = state.reminders.filter(r => r.id !== id);
        return { reminders };
      }),

      retryReminder: (id) => {
        const reminder = get().reminders.find(r => r.id === id);
        if (!reminder) return;
        
        // Simuler la réexpédition
        set((state) => {
          const reminders = state.reminders.map(r => 
            r.id === id ? { ...r, statutEnvoi: 'envoye' as const, dateEnvoi: new Date().toISOString() } : r
          );
          
          const tenant = state.tenants.find(t => t.id === reminder.locataireId);
          const newActivity: ActiviteFeed = {
            id: `act-retry-${Date.now()}`,
            type: 'relance',
            description: `Relance ${reminder.canal.toUpperCase()} réexpédiée avec succès à ${tenant?.prenom} ${tenant?.nom}`,
            timestamp: new Date().toISOString(),
            locataireId: reminder.locataireId
          };

          return { 
            reminders,
            activities: [newActivity, ...state.activities]
          };
        });
      },

      updateAgencySettings: (agencyId, settings) => set((state) => {
        const agencies = state.agencies.map(a => 
          a.id === agencyId 
            ? { 
                ...a, 
                nom: settings.nom, 
                email: settings.email, 
                telephone: settings.telephone, 
                adresse: settings.adresse 
              } 
            : a
        );
        return { agencies };
      }),

      superadminUpdatePlan: (planId, updates) => set((state) => {
        const plans = state.plans.map(p => p.id === planId ? { ...p, ...updates } : p);
        return { plans };
      }),

      superadminToggleAgency: (agencyId) => set((state) => {
        const agencies = state.agencies.map(a => 
          a.id === agencyId 
            ? { ...a, statut: a.statut === 'actif' ? 'suspendu' : 'actif' } 
            : a
        );
        return { agencies };
      }),

      superadminChangeAgencyPlan: (agencyId, planId) => set((state) => {
        const targetPlan = state.plans.find(p => p.id === planId);
        const agencies = state.agencies.map(a => {
          if (a.id === agencyId && targetPlan) {
            return { 
              ...a, 
              plan: planId,
              quotaLocataires: targetPlan.quotaLocataires,
              quotaSms: targetPlan.quotaSms,
              mrrContribution: targetPlan.prixMensuel
            };
          }
          return a;
        });
        return { agencies };
      }),

      resetAllData: () => set({
        activeRole: 'agent',
        activeAgencyId: 'agence-horizon',
        tenants: MOCK_LOCATAIRES,
        payments: MOCK_PAIEMENTS,
        agencies: MOCK_AGENCES,
        scenarios: MOCK_SCENARIOS,
        reminders: MOCK_RELANCES,
        systemStatus: MOCK_SYSTEM_STATUS,
        activities: MOCK_FEED,
        plans: MOCK_PLANS
      })
    }),
    {
      name: 'keurgui_pay_storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
