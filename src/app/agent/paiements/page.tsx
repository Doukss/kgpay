'use client';

import React, { useState, useEffect } from 'react';
import { useKeurGuiStore } from '@/lib/store';
import { formatFCFA, formatPhone } from '@/lib/formatters';
import { StatutBadge } from '@/components/paiement/StatutBadge';
import { TableSkeleton } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Search,
  Filter,
  Download,
  Inbox,
  FileText,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaiementsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { payments, tenants, activeAgencyId } = useKeurGuiStore();

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Filter payments belonging to active agency's tenants
  const agencyPayments = payments.filter(p => {
    const tenant = tenants.find(t => t.id === p.locataireId);
    return tenant?.agenceId === activeAgencyId;
  });

  // Apply filters
  const filteredPayments = agencyPayments.filter(p => {
    const tenant = tenants.find(t => t.id === p.locataireId);
    const tenantName = tenant ? `${tenant.prenom} ${tenant.nom}`.toLowerCase() : '';
    const nameMatch = tenantName.includes(searchTerm.toLowerCase()) || 
                      p.referenceTransaction?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const operatorMatch = operatorFilter === 'all' || p.operateur === operatorFilter;
    const statusMatch = statusFilter === 'all' || p.statut === statusFilter;

    return nameMatch && operatorMatch && statusMatch;
  });

  const handleDownloadReceipt = (ref: string) => {
    toast.success(`Téléchargement du reçu ${ref || 'PDF'}...`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-12 bg-slate-200 rounded w-full"></div>
        <TableSkeleton rows={5} cols={7} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Historique des paiements</h1>
        <p className="text-sm text-slate-500 mt-1">
          Visualisez et filtrez l'historique complet des loyers versés.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Rechercher locataire ou réf..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Operator Filter */}
        <select
          value={operatorFilter}
          onChange={(e) => setOperatorFilter(e.target.value)}
          className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les modes</option>
          <option value="wave">Wave</option>
          <option value="orange_money">Orange Money</option>
          <option value="especes">Espèces</option>
          <option value="virement">Virement bancaire</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="paye">Payé</option>
          <option value="partiel">Partiel</option>
          <option value="en_retard">En retard</option>
        </select>
      </div>

      {/* Table */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          title="Aucun paiement trouvé"
          description="Aucune transaction n'a été trouvée pour les filtres sélectionnés."
          icon={<Inbox className="h-10 w-10 text-slate-400" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Desktop view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                  <th className="px-6 py-4">Locataire</th>
                  <th className="px-6 py-4">Période</th>
                  <th className="px-6 py-4">Montant attendu</th>
                  <th className="px-6 py-4">Montant payé</th>
                  <th className="px-6 py-4">Date de transaction</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Référence</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {filteredPayments.map((p) => {
                  const tenant = tenants.find(t => t.id === p.locataireId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {tenant ? `${tenant.prenom} ${tenant.nom}` : 'Locataire inconnu'}
                      </td>
                      <td className="px-6 py-4 font-semibold capitalize text-slate-600">
                        {new Date(p.mois + '-02').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-slate-650">{formatFCFA(p.montantAttendu)}</td>
                      <td className="px-6 py-4 font-extrabold text-slate-800">{formatFCFA(p.montantPaye)}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {p.datePaiement ? new Date(p.datePaiement).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-6 py-4 capitalize text-slate-500 text-xs">
                        {p.operateur.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">{p.referenceTransaction || '—'}</td>
                      <td className="px-6 py-4">
                        <StatutBadge statut={p.statut} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.statut === 'paye' && (
                          <button
                            onClick={() => handleDownloadReceipt(p.referenceTransaction || p.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Télécharger le reçu PDF"
                          >
                            <Download className="h-4.5 w-4.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="md:hidden p-4 space-y-4">
            {filteredPayments.map((p) => {
              const tenant = tenants.find(t => t.id === p.locataireId);
              return (
                <div key={p.id} className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {tenant ? `${tenant.prenom} ${tenant.nom}` : 'Locataire inconnu'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium block capitalize mt-0.5">
                        Loyer {new Date(p.mois + '-02').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <StatutBadge statut={p.statut} />
                  </div>

                  <div className="text-xs space-y-1 text-slate-600 pt-1 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Loyer attendu :</span>
                      <span>{formatFCFA(p.montantAttendu)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Montant payé :</span>
                      <span className="font-bold text-slate-800">{formatFCFA(p.montantPaye)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Date transaction :</span>
                      <span>{p.datePaiement ? new Date(p.datePaiement).toLocaleDateString('fr-FR') : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Mode & Réf :</span>
                      <span className="capitalize">{p.operateur.replace('_', ' ')} • {p.referenceTransaction || '—'}</span>
                    </div>
                  </div>

                  {p.statut === 'paye' && (
                    <button
                      onClick={() => handleDownloadReceipt(p.referenceTransaction || p.id)}
                      className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Télécharger le reçu PDF
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
