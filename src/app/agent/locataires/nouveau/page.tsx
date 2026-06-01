'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useKeurGuiStore } from '@/lib/store';
import { formatFCFA, formatPhone } from '@/lib/formatters';
import { DAKAR_QUARTIERS } from '@/lib/mock-data';
import {
  User,
  Building,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Check,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Zod validation schema
const tenantFormSchema = z.object({
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  nom: z.string().min(2, 'Le nom de famille doit contenir au moins 2 caractères'),
  telephone: z.string().regex(/^\+2217[0678]\d{7}$/, 'Le téléphone doit être au format +221 7X XXX XX XX (ex: +221776543210)'),
  operateurPrefere: z.enum(['wave', 'orange_money', 'especes', 'virement']),
  langue: z.enum(['francais', 'wolof']),
  bienDesignation: z.string().min(3, 'La désignation du bien est requise (ex: Appart. 4B)'),
  quartier: z.string().min(1, 'Veuillez sélectionner un quartier'),
  loyerMensuel: z.coerce.number({ message: 'Veuillez saisir un nombre valide' }).int().positive('Le loyer doit être supérieur à 0'),
  jourEcheance: z.coerce.number({ message: 'Veuillez saisir un nombre valide' }).int().min(1).max(28),
  dateDebutBail: z.string().min(1, 'La date de début est requise'),
  paiementPartielAutorise: z.boolean().default(false),
  montantCaution: z.coerce.number({ message: 'Veuillez saisir un nombre valide' }).int().optional()
});

type TenantFormInput = z.input<typeof tenantFormSchema>;
type TenantFormData = z.output<typeof tenantFormSchema>;
type TenantFormField = keyof TenantFormInput;

export default function NouveauLocatairePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const { addTenant, agencies, activeAgencyId } = useKeurGuiStore();
  
  const agency = agencies.find(a => a.id === activeAgencyId);
  const currentTenantsCount = useKeurGuiStore(state => state.tenants.filter(t => t.agenceId === activeAgencyId).length);
  const quotaReached = agency ? currentTenantsCount >= agency.quotaLocataires : false;

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors }
  } = useForm<TenantFormInput, unknown, TenantFormData>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      operateurPrefere: 'wave',
      langue: 'francais',
      jourEcheance: 5,
      paiementPartielAutorise: false,
      loyerMensuel: 150000,
      montantCaution: 300000,
      dateDebutBail: new Date().toISOString().slice(0, 10)
    }
  });

  const formValues = watch();

  const nextStep = async () => {
    let fieldsToValidate: TenantFormField[] = [];
    if (step === 1) {
      fieldsToValidate = ['prenom', 'nom', 'telephone', 'operateurPrefere', 'langue'];
    } else if (step === 2) {
      fieldsToValidate = ['bienDesignation', 'quartier', 'loyerMensuel', 'jourEcheance', 'dateDebutBail', 'montantCaution'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => prev + 1);
    } else {
      toast.error('Veuillez corriger les erreurs avant de continuer.');
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const onSubmit = (data: TenantFormData) => {
    if (quotaReached) {
      toast.error('Impossible d\'ajouter un locataire : votre quota d\'abonnement est dépassé.');
      return;
    }

    const res = addTenant({
      ...data,
      arrieresCumules: 0,
    });
    if (res.success) {
      toast.success('Locataire ajouté avec succès !');
      router.push('/agent/locataires');
    } else {
      toast.error(res.error || 'Une erreur est survenue.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Ajouter un locataire</h1>
        <p className="text-sm text-slate-500 mt-1">
          Enregistrez un nouveau contrat de bail et configurez les rappels.
        </p>
      </div>

      {/* Quota Banner Warning */}
      {quotaReached && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex gap-3 items-start animate-shake">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Quota de locataires atteint</h4>
            <p className="text-xs text-red-700 mt-1">
              Votre plan actuel ({agency?.plan.toUpperCase()}) limite votre agence à {agency?.quotaLocataires} locataires. 
              Vous ne pouvez pas ajouter de nouveau locataire sans mettre à niveau votre plan dans les paramètres.
            </p>
          </div>
        </div>
      )}

      {/* Stepper visual bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
          }`}>
            1
          </span>
          <span className={`text-xs font-bold ${step >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>
            Locataire
          </span>
        </div>
        <div className="flex-1 border-t border-slate-200 mx-4" />
        <div className="flex items-center gap-2">
          <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
          }`}>
            2
          </span>
          <span className={`text-xs font-bold ${step >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>
            Bail & Loyer
          </span>
        </div>
        <div className="flex-1 border-t border-slate-200 mx-4" />
        <div className="flex items-center gap-2">
          <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
          }`}>
            3
          </span>
          <span className={`text-xs font-bold ${step >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>
            Confirmation
          </span>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
          
          {/* STEP 1: Tenant Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-blue-600">
                <User className="h-5 w-5" />
                <h3 className="font-bold text-slate-800 text-base">Informations du locataire</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prénom *</label>
                  <input
                    type="text"
                    {...register('prenom')}
                    placeholder="Moussa"
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-850 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.prenom && <p className="text-xs text-red-600 mt-1 font-medium">{errors.prenom.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nom de famille *</label>
                  <input
                    type="text"
                    {...register('nom')}
                    placeholder="Diallo"
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-850 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.nom && <p className="text-xs text-red-600 mt-1 font-medium">{errors.nom.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Numéro de téléphone (+221) *</label>
                <input
                  type="text"
                  {...register('telephone')}
                  placeholder="+221776543210"
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-855 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                {errors.telephone && <p className="text-xs text-red-600 mt-1 font-medium">{errors.telephone.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Preferred Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Opérateur préféré *</label>
                  <div className="space-y-2.5">
                    {[
                      { id: 'wave', label: 'Wave 💛' },
                      { id: 'orange_money', label: 'Orange Money 🧡' },
                      { id: 'especes', label: 'Espèces 💵' }
                    ].map(op => (
                      <label key={op.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-sm">
                        <input
                          type="radio"
                          value={op.id}
                          {...register('operateurPrefere')}
                          className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-slate-700">{op.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Communication language */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Langue de communication *</label>
                  <div className="space-y-2.5">
                    {[
                      { id: 'francais', label: 'Français 🇫🇷' },
                      { id: 'wolof', label: 'Wolof 🇸🇳' }
                    ].map(lang => (
                      <label key={lang.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-sm">
                        <input
                          type="radio"
                          value={lang.id}
                          {...register('langue')}
                          className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-slate-700">{lang.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Lease Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-blue-600">
                <Building className="h-5 w-5" />
                <h3 className="font-bold text-slate-800 text-base">Informations du bail</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Désignation du bien *</label>
                  <input
                    type="text"
                    {...register('bienDesignation')}
                    placeholder="Appartement F3 - 3ème étage"
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-850 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.bienDesignation && <p className="text-xs text-red-600 mt-1 font-medium">{errors.bienDesignation.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quartier / Commune *</label>
                  <select
                    {...register('quartier')}
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-850 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez un quartier...</option>
                    {DAKAR_QUARTIERS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                  {errors.quartier && <p className="text-xs text-red-600 mt-1 font-medium">{errors.quartier.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Loyer mensuel (FCFA) *</label>
                  <input
                    type="number"
                    {...register('loyerMensuel', { valueAsNumber: true })}
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-850 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.loyerMensuel && <p className="text-xs text-red-600 mt-1 font-medium">{errors.loyerMensuel.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jour d'échéance (1-28) *</label>
                  <select
                    {...register('jourEcheance', { valueAsNumber: true })}
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-850 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 28 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>Le {i + 1} du mois</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Début du bail *</label>
                  <input
                    type="date"
                    {...register('dateDebutBail')}
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-850 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.dateDebutBail && <p className="text-xs text-red-600 mt-1 font-medium">{errors.dateDebutBail.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Montant caution (Optionnel, FCFA)</label>
                  <input
                    type="number"
                    {...register('montantCaution', { valueAsNumber: true })}
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-850 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Toggle partial payment */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-250 bg-slate-50">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-700 block">Autoriser paiement partiel</span>
                    <span className="text-[10px] text-slate-400 block">Le locataire peut verser des acomptes.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...register('paiementPartielAutorise')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Summary Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <h3 className="font-bold text-slate-800 text-base">Vérification des informations</h3>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-150 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Locataire</span>
                    <p className="text-sm font-bold text-slate-800">
                      {formValues.prenom} {formValues.nom}
                    </p>
                    <p className="text-xs text-slate-500">{formatPhone(formValues.telephone)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Canal & Langue</span>
                    <p className="text-sm text-slate-700">
                      Canal préféré : <span className="font-bold capitalize">{formValues.operateurPrefere.replace('_', ' ')}</span>
                    </p>
                    <p className="text-xs text-slate-500">Relances en <span className="font-bold capitalize">{formValues.langue}</span></p>
                  </div>
                </div>

                <div className="border-t border-slate-200 my-4" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Bien loué</span>
                    <p className="text-sm font-bold text-slate-850">{formValues.bienDesignation}</p>
                    <p className="text-xs text-slate-500">{formValues.quartier}, Dakar</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Loyer & Échéance</span>
                    <p className="text-sm font-black text-blue-600">
                      {formatFCFA(Number(formValues.loyerMensuel) || 0)} / mois
                    </p>
                    <p className="text-xs text-slate-500">
                      Dû le {Number(formValues.jourEcheance) || 0} de chaque mois
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 my-4" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Début contrat</span>
                    <p className="font-semibold text-slate-700">{formValues.dateDebutBail}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Caution & Paiement partiel</span>
                    <p className="font-semibold text-slate-700">
                      Caution: {formValues.montantCaution ? formatFCFA(Number(formValues.montantCaution)) : 'Aucune'}
                    </p>
                    <p className="text-slate-500">
                      Paiements partiels : <span className="font-bold">{formValues.paiementPartielAutorise ? 'Autorisés ✓' : 'Interdits ✗'}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-250 p-4 flex gap-3 bg-blue-50/50">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-normal">
                  En cliquant sur Enregistrer, le locataire sera ajouté au tableau de bord. 
                  Il recevra un SMS/WhatsApp automatique de relance **3 jours avant** le jour {Number(formValues.jourEcheance) || 0} du mois.
                </p>
              </div>
            </div>
          )}

          {/* Stepper Buttons Controls */}
          <div className="pt-4 border-t border-slate-100 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/agent/locataires')}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-500 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Annuler
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={quotaReached}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                Enregistrer le bail
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
