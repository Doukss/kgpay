'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useKeurGuiStore } from '@/lib/store';
import { formatFCFA, formatPhone } from '@/lib/formatters';
import { StatutBadge } from '@/components/paiement/StatutBadge';
import { TableSkeleton } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Send,
  MoreVertical,
  Inbox,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LocatairesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paye' | 'partiel' | 'en_attente' | 'en_retard'>('all');
  
  const { tenants, activeAgencyId, sendReminder } = useKeurGuiStore();

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter tenants for this agency
  const agencyTenants = tenants.filter(t => t.agenceId === activeAgencyId);

  // Apply search & status filter
  const filteredTenants = agencyTenants.filter(t => {
    const nameMatch = `${t.prenom} ${t.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      t.bienDesignation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'all' || t.statutMoisCourant === statusFilter;
    
    return nameMatch && statusMatch;
  });

  const handleReminder = (tenantId: string, prenom: string, nom: string) => {
    const res = sendReminder(tenantId, 'j-1', 'sms'); // default friendly sms
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-10 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="h-12 bg-slate-200 rounded w-full"></div>
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Locataires</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez vos baux, suivez les encaissements mensuels et envoyez des relances.
          </p>
        </div>
        <Link
          href="/agent/locataires/nouveau"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer text-center"
        >
          <Plus className="h-4.5 w-4.5" />
          Ajouter un locataire
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Rechercher par nom ou bien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase mr-2 hidden sm:inline flex-shrink-0">
            Filtrer par :
          </span>
          {[
            { id: 'all', label: 'Tous' },
            { id: 'paye', label: 'Payés' },
            { id: 'partiel', label: 'Partiels' },
            { id: 'en_attente', label: 'En attente' },
            { id: 'en_retard', label: 'En retard' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                statusFilter === filter.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants list body */}
      {filteredTenants.length === 0 ? (
        <EmptyState
          title={agencyTenants.length === 0 ? "Aucun locataire pour l'instant" : "Aucun résultat trouvé"}
          description={
            agencyTenants.length === 0
              ? "Commencez par ajouter votre premier locataire pour suivre ses paiements."
              : "Aucun locataire ne correspond à votre recherche ou à vos filtres actuels."
          }
          actionText={agencyTenants.length === 0 ? "Ajouter mon premier locataire" : undefined}
          onAction={agencyTenants.length === 0 ? () => router.push('/agent/locataires/nouveau') : undefined}
          icon={<Inbox className="h-10 w-10 text-slate-400" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                  <th className="px-6 py-4">Nom complet</th>
                  <th className="px-6 py-4">Bien / Adresse</th>
                  <th className="px-6 py-4">Loyer Mensuel</th>
                  <th className="px-6 py-4">Échéance</th>
                  <th className="px-6 py-4">Statut Juin</th>
                  <th className="px-6 py-4">Dernière relance</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">
                        <Link href={`/agent/locataires/${tenant.id}`} className="hover:text-blue-600 transition-colors">
                          {tenant.prenom} {tenant.nom}
                        </Link>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{formatPhone(tenant.telephone)}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">
                      {tenant.bienDesignation}
                      <span className="block text-xs text-slate-400 mt-0.5">{tenant.quartier}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {formatFCFA(tenant.loyerMensuel)}
                      {tenant.statutMoisCourant === 'partiel' && (
                        <span className="block text-[10px] text-orange-600 font-normal">
                          (payé: {formatFCFA(tenant.montantPayeMoisCourant)})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">Le {tenant.jourEcheance} du mois</td>
                    <td className="px-6 py-4">
                      <StatutBadge statut={tenant.statutMoisCourant} />
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {tenant.arrieresCumules > 0 && (
                        <div className="text-red-500 font-bold text-[10px] mb-0.5">
                          Arriérés: {formatFCFA(tenant.arrieresCumules)}
                        </div>
                      )}
                      <span>il y a 2 jours</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/agent/locataires/${tenant.id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Voir la fiche"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </Link>
                        {tenant.statutMoisCourant !== 'paye' && (
                          <button
                            onClick={() => handleReminder(tenant.id, tenant.prenom, tenant.nom)}
                            className="p-1.5 text-slate-400 hover:text-orange-500 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Envoyer une relance"
                          >
                            <Send className="h-4.5 w-4.5" />
                          </button>
                        )}
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                          <MoreVertical className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="md:hidden p-4 space-y-4">
            {filteredTenants.map((tenant) => (
              <div key={tenant.id} className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <Link href={`/agent/locataires/${tenant.id}`} className="font-bold text-slate-800 text-base hover:text-blue-600 transition-colors">
                      {tenant.prenom} {tenant.nom}
                    </Link>
                    <span className="text-xs text-slate-400 block mt-0.5">{formatPhone(tenant.telephone)}</span>
                  </div>
                  <StatutBadge statut={tenant.statutMoisCourant} />
                </div>

                <div className="text-xs space-y-1 text-slate-600 pt-1 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Logement :</span>
                    <span className="font-semibold text-slate-700">{tenant.bienDesignation} ({tenant.quartier})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Loyer mensuel :</span>
                    <span className="font-bold text-slate-800">{formatFCFA(tenant.loyerMensuel)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Échéance :</span>
                    <span>le {tenant.jourEcheance} du mois</span>
                  </div>
                  {tenant.arrieresCumules > 0 && (
                    <div className="flex justify-between text-red-600 font-bold text-[10px]">
                      <span>Arriérés cumulés :</span>
                      <span>{formatFCFA(tenant.arrieresCumules)}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    href={`/agent/locataires/${tenant.id}`}
                    className="py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Voir
                  </Link>
                  {tenant.statutMoisCourant !== 'paye' ? (
                    <button
                      onClick={() => handleReminder(tenant.id, tenant.prenom, tenant.nom)}
                      className="py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Relancer
                    </button>
                  ) : (
                    <span className="py-2 bg-green-50 text-green-700 border border-green-200 font-bold rounded-lg text-xs text-center">
                      À jour ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
