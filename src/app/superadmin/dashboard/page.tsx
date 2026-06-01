'use client';

import React, { useState, useEffect } from 'react';
import { useKeurGuiStore } from '@/lib/store';
import { formatFCFA } from '@/lib/formatters';
import { KPISkeleton, TableSkeleton } from '@/components/ui/LoadingSpinner';
import { KPICard } from '@/components/ui/KPICard';
import { Badge } from '@/components/ui/Badge';
import {
  Building2,
  TrendingUp,
  Users,
  Activity,
  Award,
  Inbox
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function SuperAdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const { agencies, tenants, payments, plans } = useKeurGuiStore();

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Compute platform KPIs
  const activeAgencies = agencies.filter(a => a.statut === 'actif' || a.statut === 'essai').length;
  
  const totalMRR = agencies.reduce((acc, curr) => {
    if (curr.statut === 'suspendu') return acc;
    return acc + curr.mrrContribution;
  }, 0);

  const totalTenants = agencies.reduce((acc, curr) => acc + curr.nbLocataires, 0);

  const totalVolumeThisMonth = payments
    .filter(p => p.statut === 'paye' || p.statut === 'partiel')
    .reduce((acc, curr) => acc + curr.montantPaye, 0);

  // Recharts 12-month MRR + Agencies count
  const growthData = [
    { name: 'Jul 25', MRR: 90000, Agences: 2 },
    { name: 'Aôu 25', MRR: 90000, Agences: 2 },
    { name: 'Sep 25', MRR: 125000, Agences: 3 },
    { name: 'Oct 25', stroke: 125000, MRR: 125000, Agences: 3 },
    { name: 'Nov 25', MRR: 200000, Agences: 4 },
    { name: 'Déc 25', MRR: 200000, Agences: 4 },
    { name: 'Jan 26', MRR: 235000, Agences: 5 },
    { name: 'Fév 26', MRR: 235000, Agences: 5 },
    { name: 'Mar 26', MRR: 235050, Agences: 5 },
    { name: 'Avr 26', MRR: 235000, Agences: 5 },
    { name: 'Mai 26', MRR: 235000, Agences: 5 },
    { name: 'Jui 26', MRR: totalMRR, Agences: agencies.length }
  ];

  // Plans distribution data
  const starterCount = agencies.filter(a => a.plan === 'starter').length;
  const proCount = agencies.filter(a => a.plan === 'pro').length;
  const agenceCount = agencies.filter(a => a.plan === 'agence').length;

  const planDistData = [
    { name: 'Starter', value: starterCount, color: '#94A3B8' }, // grey
    { name: 'Pro', value: proCount, color: '#2563EB' }, // blue
    { name: 'Agence', value: agenceCount, color: '#8B5CF6' } // violet
  ].filter(p => p.value > 0);

  // Top 5 agencies
  const topAgencies = [...agencies]
    .sort((a, b) => b.nbLocataires - a.nbLocataires)
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'actif': return <Badge variant="success">Actif</Badge>;
      case 'essai': return <Badge variant="primary">Essai</Badge>;
      default: return <Badge variant="danger">Suspendu</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-2"></div>
        <KPISkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-200 rounded-xl"></div>
          <div className="h-72 bg-slate-200 rounded-xl"></div>
        </div>
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Console Super Admin</h1>
        <p className="text-sm text-slate-500 mt-1">
          Indicateurs clés et vue globale de la performance de la plateforme KeurGui Pay.
        </p>
      </div>

      {/* KPI Platform Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Agences actives"
          value={`${activeAgencies} / ${agencies.length}`}
          trend={{ value: '+1 ce mois', isPositive: true }}
          icon={<Building2 className="h-5 w-5 text-blue-600" />}
          iconBgColor="bg-blue-50"
        />
        <KPICard
          title="MRR Plateforme"
          value={formatFCFA(totalMRR)}
          trend={{ value: '+6.4% vs mai', isPositive: true }}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          iconBgColor="bg-green-50 text-green-600"
          className="border-l-4 border-l-green-500"
        />
        <KPICard
          title="Locataires gérés"
          value={totalTenants.toString()}
          trend={{ value: '+12% croissance', isPositive: true }}
          icon={<Users className="h-5 w-5 text-indigo-600" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />
        <KPICard
          title="Volume Loyers (Mois)"
          value={formatFCFA(totalVolumeThisMonth)}
          trend={{ value: 'Flux traités', isPositive: true }}
          icon={<Activity className="h-5 w-5 text-red-600" />}
          iconBgColor="bg-red-50 text-red-600"
          className="border-l-4 border-l-red-500"
        />
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line / Composed Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400 mb-4">
            Croissance MRR & Volume d'Agences (12 mois)
          </h3>
          <div className="h-72 w-full text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={growthData} margin={{ top: 10, right: -5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" tickLine={false} />
                <YAxis yAxisId="left" stroke="#10B981" tickLine={false} fontSize={9} label={{ value: 'MRR (FCFA)', angle: -90, position: 'insideLeft', offset: 0, fill: '#10B981', fontWeight: 'bold' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#2563EB" tickLine={false} fontSize={9} label={{ value: 'Agences', angle: 90, position: 'insideRight', offset: 5, fill: '#2563EB', fontWeight: 'bold' }} />
                <Tooltip 
                  formatter={(value, name) => {
                    const label = String(name ?? '');
                    return [
                      label === 'MRR' ? formatFCFA(Number(value)) : `${value} agences`,
                      label,
                    ];
                  }}
                  contentStyle={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
                <Line yAxisId="left" type="monotone" dataKey="MRR" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name="MRR" />
                <Line yAxisId="right" type="monotone" dataKey="Agences" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} name="Agences" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400 mb-4">
            Répartition des abonnements agence
          </h3>
          <div className="h-60 w-full text-xs">
            {planDistData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <Inbox className="h-8 w-8 mb-1 mr-2" />
                <span>Aucune agence active</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistData}
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {planDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} agence(s)`, 'Effectif']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Top 5 Agencies Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
            Top 5 des agences (Volume d'activité)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-250 text-slate-500 font-semibold text-xs uppercase">
                <th className="px-6 py-3.5">Agence</th>
                <th className="px-6 py-3.5">Forfait</th>
                <th className="px-6 py-3.5">Locataires</th>
                <th className="px-6 py-3.5">SMS Envoyés</th>
                <th className="px-6 py-3.5">Revenu (MRR)</th>
                <th className="px-6 py-3.5 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {topAgencies.map((ag) => (
                <tr key={ag.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-850">{ag.nom}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{ag.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-slate-650 font-medium">{ag.plan}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">{ag.nbLocataires}</td>
                  <td className="px-6 py-4 text-slate-600">{ag.nbSmsEnvoyesMois}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{formatFCFA(ag.mrrContribution)}</td>
                  <td className="px-6 py-4 text-right">
                    {getStatusBadge(ag.statut)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
