'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useKeurGuiStore } from '@/lib/store';
import { formatFCFA } from '@/lib/formatters';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Search,
  Building2,
  Mail,
  ToggleLeft,
  ToggleRight,
  Eye,
  Trash2,
  Send,
  Calendar,
  Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperadminTenantsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { agencies, superadminToggleAgency } = useKeurGuiStore();

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Filter list
  const filteredAgencies = agencies.filter(ag => {
    const searchMatch = ag.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ag.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const planMatch = planFilter === 'all' || ag.plan === planFilter;
    const statusMatch = statusFilter === 'all' || ag.statut === statusFilter;

    return searchMatch && planMatch && statusMatch;
  });

  const handleToggleStatus = (id: string, name: string) => {
    superadminToggleAgency(id);
    const ag = agencies.find(a => a.id === id);
    if (ag) {
      toast.success(`Statut de l'agence ${name} changé pour : ${ag.statut === 'actif' ? 'Suspendu' : 'Actif'}`);
    }
  };

  const handleContactAgency = (name: string) => {
    toast.success(`Ouverture de la messagerie pour contacter ${name} (Simulé)`);
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'agence': return <Badge variant="primary">Agence</Badge>;
      case 'pro': return <Badge variant="success">Pro</Badge>;
      default: return <Badge variant="neutral">Starter</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'actif': return <Badge variant="success">Actif</Badge>;
      case 'essai': return <Badge variant="primary">Essai</Badge>;
      default: return <Badge variant="danger">Suspendu</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-12 bg-slate-200 rounded w-full"></div>
        <TableSkeleton rows={6} cols={7} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Agences / Clients</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gérez les contrats abonnés, suspendez les accès et contrôlez la facturation SaaS.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Rechercher une agence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-850 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Plan select */}
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les forfaits</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="agence">Agence</option>
        </select>

        {/* Status select */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="essai">Essai</option>
          <option value="suspendu">Suspendu</option>
        </select>
      </div>

      {/* Table grid */}
      {filteredAgencies.length === 0 ? (
        <EmptyState
          title="Aucune agence trouvée"
          description="Aucun abonnement ne correspond à vos critères de filtrage."
          icon={<Inbox className="h-10 w-10 text-slate-400" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                  <th className="px-6 py-4">Agence</th>
                  <th className="px-6 py-4">Abonnement</th>
                  <th className="px-6 py-4">Locataires</th>
                  <th className="px-6 py-4">SMS ce mois</th>
                  <th className="px-6 py-4">MRR Contribution</th>
                  <th className="px-6 py-4">Inscription</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {filteredAgencies.map((ag) => (
                  <tr key={ag.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{ag.nom}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{ag.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getPlanBadge(ag.plan)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800">{ag.nbLocataires}</span>
                      <span className="text-slate-400 text-xs"> / {ag.quotaLocataires}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-650">
                      {ag.nbSmsEnvoyesMois}
                      <span className="text-slate-400 text-xs"> / {ag.quotaSms === null ? '∞' : ag.quotaSms}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{formatFCFA(ag.mrrContribution)}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(ag.dateInscription).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(ag.statut)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* View button */}
                        <Link
                          href={`/superadmin/tenants/${ag.id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Fiche Agence"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </Link>
                        {/* Suspend button */}
                        <button
                          onClick={() => handleToggleStatus(ag.id, ag.nom)}
                          className={`p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                            ag.statut === 'suspendu' ? 'text-green-600' : 'text-slate-400 hover:text-red-500'
                          }`}
                          title={ag.statut === 'suspendu' ? 'Réactiver l\'agence' : 'Suspendre l\'agence'}
                        >
                          {ag.statut === 'suspendu' ? (
                            <ToggleRight className="h-5 w-5" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
                        {/* Contact button */}
                        <button
                          onClick={() => handleContactAgency(ag.nom)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Contacter l'agence"
                        >
                          <Send className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
