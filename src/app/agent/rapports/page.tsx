'use client';

import React, { useState, useEffect } from 'react';
import { useKeurGuiStore } from '@/lib/store';
import { formatFCFA } from '@/lib/formatters';
import { StatutBadge } from '@/components/paiement/StatutBadge';
import { KPISkeleton, TableSkeleton } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  FileDown,
  Calendar,
  BarChart,
  Inbox,
  AlertTriangle,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import toast from 'react-hot-toast';

export default function RapportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const { tenants, activeAgencyId } = useKeurGuiStore();

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const agencyTenants = tenants.filter(t => t.agenceId === activeAgencyId);

  // Compute metrics
  const totalAttendu = agencyTenants.reduce((acc, curr) => acc + curr.loyerMensuel, 0);
  const totalEncaisse = agencyTenants.reduce((acc, curr) => acc + curr.montantPayeMoisCourant, 0);
  const totalRestant = Math.max(0, totalAttendu - totalEncaisse);
  const tauxRecouvrement = totalAttendu > 0 ? Math.round((totalEncaisse / totalAttendu) * 100) : 0;

  // Pie chart counts
  const nbPayes = agencyTenants.filter(t => t.statutMoisCourant === 'paye').length;
  const nbPartiels = agencyTenants.filter(t => t.statutMoisCourant === 'partiel').length;
  const nbImpayes = agencyTenants.filter(t => t.statutMoisCourant === 'en_retard' || t.statutMoisCourant === 'en_attente').length;

  const pieData = [
    { name: 'Payé', value: nbPayes, color: '#16A34A' },
    { name: 'Partiel', value: nbPartiels, color: '#F97316' },
    { name: 'Impayé', value: nbImpayes, color: '#DC2626' }
  ].filter(item => item.value > 0);

  // 12 Months Recovery Rate Trend
  const trendData = [
    { name: 'Jul 25', Taux: 88 },
    { name: 'Aôu 25', Taux: 90 },
    { name: 'Sep 25', Taux: 92 },
    { name: 'Oct 25', Taux: 85 },
    { name: 'Nov 25', Taux: 89 },
    { name: 'Déc 25', Taux: 94 },
    { name: 'Jan 26', Taux: 91 },
    { name: 'Fév 26', Taux: 93 },
    { name: 'Mar 26', Taux: 87 },
    { name: 'Avr 26', Taux: 92 },
    { name: 'Mai 26', Taux: 95 },
    { name: 'Jui 26', Taux: tauxRecouvrement }
  ];

  // Tenants with accumulated arrears
  const arrearsList = agencyTenants.filter(t => t.arrieresCumules > 0);
  const totalArrearsAmount = arrearsList.reduce((acc, curr) => acc + curr.arrieresCumules, 0);

  const handleGeneratePDF = () => {
    toast.success('Rapport PDF généré ! Rapport envoyé sur WhatsApp 💬');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <KPISkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-xl"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Rapports mensuels</h1>
          <p className="text-sm text-slate-500 mt-1">
            Générez et téléchargez vos statistiques de recouvrement.
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Calendar className="h-4 w-4" />
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block pl-9 pr-3 py-2 border border-slate-250 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={handleGeneratePDF}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
            Générer rapport PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Loyers attendus</span>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight mt-1">{formatFCFA(totalAttendu)}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-green-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recouvrement encaissé</span>
          <h3 className="text-xl font-black text-green-600 tracking-tight mt-1">{formatFCFA(totalEncaisse)}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Taux de recouvrement</span>
          <h3 className="text-xl font-black text-blue-600 tracking-tight mt-1">{tauxRecouvrement}%</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Impayés du mois</span>
          <h3 className="text-xl font-black text-red-600 tracking-tight mt-1">{formatFCFA(totalRestant)}</h3>
        </div>
      </div>

      {/* Recharts Block */}
      {agencyTenants.length === 0 ? (
        <EmptyState
          title="Pas de données"
          description="Enregistrez des locataires pour afficher les graphiques de recouvrement."
          icon={<Inbox className="h-10 w-10 text-slate-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400 mb-4">
              Répartition des statuts (Mois en cours)
            </h3>
            <div className="h-60 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} locataire(s)`, '']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400 mb-4">
              Évolution du taux de recouvrement (%)
            </h3>
            <div className="h-60 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" domain={[50, 100]} fontSize={10} tickLine={false} />
                  <Tooltip formatter={(value: any) => [`${value}% collecté`, 'Taux']} />
                  <Line type="monotone" dataKey="Taux" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Executive table breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
            Détail des recouvrements par locataire
          </h3>
        </div>

        {agencyTenants.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Inbox className="h-8 w-8 mb-2 mx-auto" />
            <p className="text-sm">Aucun locataire enregistré.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-250 text-slate-500 font-semibold text-xs uppercase">
                  <th className="px-6 py-3">Locataire</th>
                  <th className="px-6 py-3">Loyer attendu</th>
                  <th className="px-6 py-3">Montant payé</th>
                  <th className="px-6 py-3">Solde restant</th>
                  <th className="px-6 py-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {agencyTenants.map((t) => {
                  const reste = Math.max(0, t.loyerMensuel - t.montantPayeMoisCourant);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{t.prenom} {t.nom}</td>
                      <td className="px-6 py-4 text-slate-650">{formatFCFA(t.loyerMensuel)}</td>
                      <td className="px-6 py-4 font-extrabold text-slate-800">{formatFCFA(t.montantPayeMoisCourant)}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {reste > 0 ? (
                          <span className="text-red-650 font-bold">{formatFCFA(reste)}</span>
                        ) : (
                          <span className="text-slate-400">0 FCFA</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <StatutBadge statut={t.statutMoisCourant} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Accumulated Arrears Block */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
              Impayés cumulés (Arriérés historiques)
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Dettes cumulées sur les mois antérieurs.</p>
          </div>
          <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-100">
            Total : {formatFCFA(totalArrearsAmount)}
          </span>
        </div>

        {arrearsList.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Inbox className="h-8 w-8 mb-2 mx-auto" />
            <p className="text-sm">Aucun arriéré cumulé sur la plateforme.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {arrearsList.map((t) => {
              const monthsLate = Math.round(t.arrieresCumules / t.loyerMensuel);
              return (
                <div key={t.id} className="p-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex gap-3 items-center">
                    <div className="p-2 rounded-lg bg-red-50 text-red-600 shrink-0">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-850 text-sm">{t.prenom} {t.nom}</h4>
                      <p className="text-[10px] text-slate-400">{t.bienDesignation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block text-right">Mois d'arriérés</span>
                      <span className="font-bold text-red-650 block text-right">{monthsLate} mois</span>
                    </div>
                    <div className="border-l border-slate-200 h-8 hidden sm:block" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block text-right">Dette totale</span>
                      <span className="font-black text-red-650 text-sm block text-right">{formatFCFA(t.arrieresCumules)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
