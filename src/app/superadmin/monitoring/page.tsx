'use client';

import React, { useState, useEffect } from 'react';
import { useKeurGuiStore } from '@/lib/store';
import { formatFCFA, formatPhone } from '@/lib/formatters';
import { StatusDot } from '@/components/ui/StatusDot';
import { CardSkeleton, TableSkeleton } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Smartphone,
  ShieldCheck,
  CreditCard,
  Settings,
  AlertTriangle,
  RefreshCw,
  Clock,
  Activity,
  Inbox
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import toast from 'react-hot-toast';

export default function SuperadminMonitoringPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { reminders, tenants, agencies, payments, systemStatus, retryReminder } = useKeurGuiStore();

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter failed alerts
  const failedReminders = reminders.filter(r => r.statutEnvoi === 'echec');

  // Compute stats
  const totalVolume = payments
    .filter(p => p.statut === 'paye' || p.statut === 'partiel')
    .reduce((acc, curr) => acc + curr.montantPaye, 0);

  // Operator distribution (Wave vs OM)
  const wavePayments = payments.filter(p => p.operateur === 'wave' && (p.statut === 'paye' || p.statut === 'partiel'));
  const omPayments = payments.filter(p => p.operateur === 'orange_money' && (p.statut === 'paye' || p.statut === 'partiel'));

  const waveVolume = wavePayments.reduce((acc, curr) => acc + curr.montantPaye, 0);
  const omVolume = omPayments.reduce((acc, curr) => acc + curr.montantPaye, 0);

  const operatorDistData = [
    { name: 'Wave 💛', value: waveVolume, color: '#FBBF24' }, // Yellow
    { name: 'Orange Money 🧡', value: omVolume, color: '#F97316' } // Orange
  ].filter(p => p.value > 0);

  // SMS 15 days volume data
  const smsVolumeData = [
    { name: '05/06', Reussi: 42, Echec: 3 },
    { name: '06/06', Reussi: 55, Echec: 5 },
    { name: '07/06', Reussi: 30, Echec: 1 },
    { name: '08/06', Reussi: 60, Echec: 2 },
    { name: '09/06', Reussi: 85, Echec: 4 },
    { name: '10/06', Reussi: 70, Echec: 8 },
    { name: '11/06', Reussi: 48, Echec: 2 },
    { name: '12/06', Reussi: 50, Echec: 3 },
    { name: '13/06', Reussi: 32, Echec: 1 },
    { name: '14/06', Reussi: 28, Echec: 0 },
    { name: '15/06', Reussi: 62, Echec: 4 },
    { name: '16/06', Reussi: 78, Echec: 3 },
    { name: '17/06', Reussi: 90, Echec: 6 },
    { name: '18/06', Reussi: 88, Echec: 2 },
    { name: '19/06', Reussi: 95, Echec: 4 }
  ];

  // Latest Platform Transactions
  const latestTransactions = payments.slice(0, 5);

  const handleRetry = (id: string, name: string) => {
    retryReminder(id);
    toast.success(`Relance renvoyée avec succès à ${name} !`);
  };

  const getServiceStatusText = (status: string) => {
    switch (status) {
      case 'operationnel': return 'Opérationnel';
      case 'degrade': return 'Dégradé';
      default: return 'Hors service';
    }
  };

  const getServiceStatusBg = (status: string) => {
    switch (status) {
      case 'operationnel': return 'border-l-4 border-l-green-500';
      case 'degrade': return 'border-l-4 border-l-orange-500';
      default: return 'border-l-4 border-l-red-500';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-xl"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Supervision & Monitoring</h1>
        <p className="text-sm text-slate-500 mt-1">
          Surveillez la santé des passerelles, suivez les flux financiers et gérez les anomalies de relance.
        </p>
      </div>

      {/* SECTION 1: Service Status Health */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
          État opérationnel des services
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {systemStatus.map((service, index) => (
            <div key={index} className={`bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between h-32 ${getServiceStatusBg(service.statut)}`}>
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-800 text-xs tracking-tight line-clamp-2">{service.service}</span>
                <StatusDot status={service.statut} />
              </div>

              <div className="space-y-1 mt-4">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Uptime (30j)</span>
                  <span className="font-semibold text-slate-700">{service.uptimeJours30}%</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Latence</span>
                  <span className="font-semibold text-slate-700">{service.latenceMoyenneMs} ms</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: SMS & Messaging stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SMS Volume Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
              Flux d'expédition SMS & WhatsApp (15 jours)
            </h3>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-600" /> Succès
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Échecs
              </span>
            </div>
          </div>

          <div className="h-64 w-full text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={smsVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" tickLine={false} />
                <YAxis stroke="#94A3B8" tickLine={false} />
                <Tooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '12px' }} />
                <Bar dataKey="Reussi" fill="#2563EB" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Echec" fill="#EF4444" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deliverability score */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
              Délivrabilité globale
            </h3>
            
            <div className="text-center py-6">
              <h2 className="text-5xl font-black text-green-600 tracking-tight">97.8%</h2>
              <span className="bg-green-100 text-green-800 border border-green-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mt-2 inline-block">
                Excellent ✓
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 text-xs text-slate-500 leading-relaxed space-y-2">
            <p>Calculé sur un total cumulé de <strong>1 850 SMS</strong> et messages WhatsApp expédiés ce mois-ci par l'ensemble des agences.</p>
            <p className="text-[10px] text-slate-400">Taux de réponse API moyen : 124ms.</p>
          </div>
        </div>

      </div>

      {/* SECTION 3: Failed alerts retry panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
              Journal des incidents de délivrabilité
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Relances n'ayant pas pu être livrées aux locataires.</p>
          </div>
          <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full border border-red-100">
            {failedReminders.length} échecs en attente
          </span>
        </div>

        {failedReminders.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Inbox className="h-8 w-8 mb-2 mx-auto" />
            <p className="text-sm">Aucun incident de délivrabilité à déplorer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                  <th className="px-6 py-3.5">Agence / Locataire</th>
                  <th className="px-6 py-3.5">Canal</th>
                  <th className="px-6 py-3.5">Destinataire</th>
                  <th className="px-6 py-3.5">Code Erreur</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {failedReminders.map((rem) => {
                  const tenant = tenants.find(t => t.id === rem.locataireId);
                  const agency = agencies.find(a => a.id === tenant?.agenceId);
                  return (
                    <tr key={rem.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{tenant ? `${tenant.prenom} ${tenant.nom}` : 'Inconnu'}</div>
                        <div className="text-xs text-slate-405">{agency?.nom}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold uppercase">{rem.canal}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {tenant ? formatPhone(tenant.telephone) : ''}
                      </td>
                      <td className="px-6 py-4 font-semibold text-red-650 text-xs">
                        {tenant?.telephone.includes('767890123') ? 'ERR_CARRIER_TIMEOUT (504)' : 'ERR_INVALID_NUMBER (400)'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(rem.dateEnvoi).toLocaleString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRetry(rem.id, tenant ? `${tenant.prenom} ${tenant.nom}` : '')}
                          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold rounded-lg shadow-xs hover:shadow-sm transition-colors flex items-center justify-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3 shrink-0" />
                          Réessayer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 4: Financial volume & Operator breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pie chart financial operators */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400 mb-4">
            Volume de transaction par opérateur
          </h3>
          <div className="h-60 w-full text-xs">
            {operatorDistData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <Inbox className="h-8 w-8 mb-1 mr-2" />
                <span>Aucune transaction</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={operatorDistData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {operatorDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatFCFA(value), 'Volume']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Latest Platform Payments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 md:col-span-2 flex flex-col justify-between">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400 mb-3">
            Dernières transactions traitées
          </h3>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 max-h-[220px]">
            {latestTransactions.map((pay) => {
              const tenant = tenants.find(t => t.id === pay.locataireId);
              const agency = agencies.find(a => a.id === tenant?.agenceId);
              return (
                <div key={pay.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">{tenant ? `${tenant.prenom} ${tenant.nom}` : 'Inconnu'}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{agency?.nom} • Réf: {pay.referenceTransaction || '—'}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-slate-800 block">{formatFCFA(pay.montantPaye)}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block mt-0.5">
                      {pay.operateur === 'wave' ? 'Wave 💛' : 'Orange Money 🧡'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
