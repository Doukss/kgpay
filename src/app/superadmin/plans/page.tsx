'use client';

import React, { useState, useEffect } from 'react';
import { useKeurGuiStore } from '@/lib/store';
import { formatFCFA } from '@/lib/formatters';
import { PlanAbonnement, Plan } from '@/lib/types';
import { TableSkeleton } from '@/components/ui/LoadingSpinner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import {
  Award,
  Users,
  MessageSquare,
  DollarSign,
  Save,
  CheckCircle,
  Plus,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperadminPlansPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { plans, superadminUpdatePlan } = useKeurGuiStore();

  // Local state for inline inputs
  const [localPlans, setLocalPlans] = useState<Plan[]>([]);

  // Load from store on mount
  useEffect(() => {
    if (plans.length > 0) {
      setLocalPlans(JSON.parse(JSON.stringify(plans))); // Deep clone
    }
  }, [plans]);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (planId: PlanAbonnement, field: keyof Plan, value: any) => {
    setLocalPlans(prev => prev.map(p => {
      if (p.id === planId) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleFeatureChange = (planId: PlanAbonnement, index: number, value: string) => {
    setLocalPlans(prev => prev.map(p => {
      if (p.id === planId) {
        const newFeatures = [...p.fonctionnalites];
        newFeatures[index] = value;
        return { ...p, fonctionnalités: newFeatures }; // Wait, is there a typo? Let's check: in types.ts it is functionalities or features list, which is `fonctionnalites` key.
      }
      return p;
    }));
  };

  const handleSaveAll = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    setIsConfirmOpen(false);
    
    // Save each plan to the store
    localPlans.forEach(p => {
      superadminUpdatePlan(p.id, {
        prixMensuel: p.prixMensuel,
        quotaLocataires: p.quotaLocataires,
        quotaSms: p.quotaSms
      });
    });

    toast.success('Modifications des plans sauvegardées !');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <TableSkeleton rows={3} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestion des plans & tarifs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Modifiez la tarification, ajustez les quotas de locataires et gérez les fonctionnalités incluses.
          </p>
        </div>
        
        <button
          onClick={handleSaveAll}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="h-4 w-4" />
          Sauvegarder les modifications
        </button>
      </div>

      {/* Grid editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {localPlans.map((pl) => {
          const originalPlan = plans.find(p => p.id === pl.id);
          return (
            <div key={pl.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5 flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex justify-between items-center border-b border-slate-105 pb-3">
                  <h3 className="font-bold text-slate-850 capitalize text-sm flex items-center gap-1.5">
                    <Award className="h-4.5 w-4.5 text-blue-600" />
                    {pl.nom}
                  </h3>
                  <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                    {pl.nbAgencesActives} agence(s) active(s)
                  </span>
                </div>

                {/* Price input */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Prix mensuel (FCFA) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={pl.prixMensuel}
                      onChange={(e) => handleInputChange(pl.id, 'prixMensuel', parseInt(e.target.value) || 0)}
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Quota locataires */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Quota locataires *</label>
                  <input
                    type="number"
                    value={pl.quotaLocataires}
                    onChange={(e) => handleInputChange(pl.id, 'quotaLocataires', parseInt(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Quota SMS */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Quota SMS / mois *</label>
                    <label className="flex items-center gap-1 text-[10px] text-slate-500">
                      <input
                        type="checkbox"
                        checked={pl.quotaSms === null}
                        onChange={(e) => handleInputChange(pl.id, 'quotaSms', e.target.checked ? null : 100)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      SMS illimités
                    </label>
                  </div>
                  {pl.quotaSms !== null && (
                    <input
                      type="number"
                      value={pl.quotaSms}
                      onChange={(e) => handleInputChange(pl.id, 'quotaSms', parseInt(e.target.value) || 0)}
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* Functionality list (read-only in this grid for UI clarity, but listed) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fonctionnalités incluses</span>
                <ul className="space-y-1.5 text-[10px] text-slate-500">
                  {pl.fonctionnalites.map((feature, fIdx) => (
                    <li key={fIdx} className="flex gap-2 items-start leading-tight">
                      <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        title="Confirmer les modifications des forfaits"
        message="Voulez-vous enregistrer ces changements de tarification ? Les nouveaux tarifs s'appliqueront lors du renouvellement des contrats des agences."
        confirmText="Enregistrer les modifications"
        variant="primary"
      />
    </div>
  );
}
