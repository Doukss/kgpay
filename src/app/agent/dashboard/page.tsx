'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useKeurGuiStore } from '@/lib/store';
import { formatFCFA, formatPhone } from '@/lib/formatters';
import { KPISkeleton, TableSkeleton } from '@/components/ui/LoadingSpinner';
import { KPICard } from '@/components/ui/KPICard';
import { StatutBadge } from '@/components/paiement/StatutBadge';
import {
  TrendingUp,
  AlertCircle,
  Clock,
  Send,
  ArrowRight,
  Inbox,
  User,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import toast from 'react-hot-toast';

export default function AgentDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { tenants, payments, activities, activeAgencyId, sendReminder } = useKeurGuiStore();

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

  // Filter tenants by active agency
  const agencyTenants = tenants.filter(t => t.agenceId === activeAgencyId);
  const agencyActivities = activities.filter(a => {
    if (!a.locataireId) return true;
    const t = tenants.find(ten => ten.id === a.locataireId);
    return t?.agenceId === activeAgencyId;
  }).slice(0, 10);

  // Compute current month statistics
  const totalAttenduMois = agencyTenants.reduce((acc, curr) => acc + curr.loyerMensuel, 0);
  const totalEncaisseMois = agencyTenants.reduce((acc, curr) => acc + curr.montantPayeMoisCourant, 0);
  const tauxRecouvrement = totalAttenduMois > 0 ? Math.round((totalEncaisseMois / totalAttenduMois) * 100) : 0;
  
  const nbImpayes = agencyTenants.filter(t => t.statutMoisCourant !== 'paye').length;
  const montantImpayes = agencyTenants.reduce((acc, curr) => {
    const remaining = curr.loyerMensuel - curr.montantPayeMoisCourant;
    return acc + (remaining > 0 ? remaining : 0);
  }, 0) + agencyTenants.reduce((acc, curr) => acc + curr.arrieresCumules, 0);

  const nbLocatairesEnRetard = agencyTenants.filter(t => t.statutMoisCourant === 'en_retard').length;

  // Bar Chart Data (Last 6 Months)
  const chartData = [
    { name: 'Jan', Encaissé: 4100000, Attendu: 4500000 },
    { name: 'Fév', Encaissé: 4300000, Attendu: 4500000 },
    { name: 'Mar', Encaissé: 3900000, Attendu: 4500000 },
    { name: 'Avr', Encaissé: 4200000, Attendu: 4500000 },
    { name: 'Mai', Encaissé: 4400000, Attendu: 4500000 },
    { name: 'Juin', Encaissé: totalEncaisseMois, Attendu: totalAttenduMois },
  ];

  // Actions Required (Late tenants J+1 or worse)
  const today = new Date().getDate();
  const actionsRequiredList = agencyTenants.filter(t => {
    return (t.statutMoisCourant === 'en_retard' || (t.statutMoisCourant === 'partiel' && today > t.jourEcheance));
  });

  const handleQuickReminder = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    // Send warning J+1 reminder
    const res = sendReminder(tenantId, 'j+1', 'sms');
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div>
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        </div>
        <KPISkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 rounded-xl"></div>
          <div className="h-80 bg-slate-200 rounded-xl"></div>
        </div>
        <TableSkeleton rows={3} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tableau de bord</h1>
        <p className="text-sm text-slate-500 mt-1">
          Voici un aperçu des encaissements et des relances de votre agence.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total attendu ce mois"
          value={formatFCFA(totalAttenduMois)}
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          iconBgColor="bg-blue-50"
        />
        <KPICard
          title="Total encaissé"
          value={formatFCFA(totalEncaisseMois)}
          trend={{ value: `${tauxRecouvrement}% collecté`, isPositive: tauxRecouvrement >= 75 }}
          icon={<CreditCard className="h-5 w-5 text-green-600" />}
          iconBgColor="bg-green-50 text-green-600"
          className="border-l-4 border-l-green-500"
        />
        <KPICard
          title="Impayés & arriérés"
          value={formatFCFA(montantImpayes)}
          trend={{ value: `${nbImpayes} dossiers`, isPositive: false }}
          icon={<AlertCircle className="h-5 w-5 text-red-600" />}
          iconBgColor="bg-red-50 text-red-600"
          className="border-l-4 border-l-red-500"
        />
        <Link href="/agent/locataires?status=en_retard" className="block focus:outline-hidden">
          <KPICard
            title="Locataires en retard"
            value={nbLocatairesEnRetard.toString()}
            trend={{ value: 'Voir la liste', isPositive: true, label: '→' }}
            icon={<Clock className="h-5 w-5 text-orange-600" />}
            iconBgColor="bg-orange-50 text-orange-600"
            className="hover:border-orange-300 transition-all border-l-4 border-l-orange-500"
          />
        </Link>
      </div>

      {/* Chart & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Block */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider text-slate-400">
            Historique de Recouvrement (6 mois)
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => [formatFCFA(value), '']}
                  contentStyle={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
                <Bar dataKey="Encaissé" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={45} />
                <Line type="monotone" dataKey="Attendu" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider text-slate-400">
            Activité Récente
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[288px]">
            {agencyActivities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                <Inbox className="h-8 w-8 mb-2" />
                <p className="text-xs">Aucune activité pour le moment.</p>
              </div>
            ) : (
              agencyActivities.map((act) => {
                const colors = {
                  paiement: 'bg-green-50 text-green-600',
                  relance: 'bg-blue-50 text-blue-600',
                  nouveau_locataire: 'bg-indigo-50 text-indigo-600',
                  echec_sms: 'bg-red-50 text-red-600'
                };
                const icons = {
                  paiement: <CreditCard className="h-4 w-4" />,
                  relance: <MessageSquare className="h-4 w-4" />,
                  nouveau_locataire: <User className="h-4 w-4" />,
                  echec_sms: <AlertCircle className="h-4 w-4" />
                };
                return (
                  <div key={act.id} className="flex gap-3 text-sm items-start hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                    <div className={`p-2 rounded-lg shrink-0 ${colors[act.type] || 'bg-slate-50'}`}>
                      {icons[act.type] || <Clock className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-700 leading-normal">{act.description}</p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {new Date(act.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • il y a quelques heures
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Actions Required Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400">
              Actions requises (Retards de loyer)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Locataires n'ayant pas soldé leur loyer à l'échéance.</p>
          </div>
          <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-1 rounded-full font-bold">
            {actionsRequiredList.length} en attente
          </span>
        </div>

        {actionsRequiredList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center">
            <Inbox className="h-8 w-8 mb-2" />
            <p className="text-sm">Aucune action requise pour le moment. Tous vos locataires sont à jour !</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="hidden md:table w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-semibold text-xs uppercase">
                  <th className="px-6 py-3">Locataire</th>
                  <th className="px-6 py-3">Téléphone</th>
                  <th className="px-6 py-3">Loyer Dû</th>
                  <th className="px-6 py-3">Jours de retard</th>
                  <th className="px-6 py-3">Statut Mois</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actionsRequiredList.map((tenant) => {
                  const daysOverdue = Math.max(1, today - tenant.jourEcheance);
                  const loyerDu = tenant.loyerMensuel - tenant.montantPayeMoisCourant;
                  return (
                    <tr key={tenant.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        <Link href={`/agent/locataires/${tenant.id}`} className="hover:text-blue-600 transition-colors">
                          {tenant.prenom} {tenant.nom}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{formatPhone(tenant.telephone)}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{formatFCFA(loyerDu)}</td>
                      <td className="px-6 py-4">
                        <span className="text-red-600 font-extrabold">{daysOverdue} jours</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatutBadge statut={tenant.statutMoisCourant} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleQuickReminder(tenant.id)}
                          className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-xs hover:shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Relancer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden divide-y divide-slate-100 p-4 space-y-3">
              {actionsRequiredList.map((tenant) => {
                const daysOverdue = Math.max(1, today - tenant.jourEcheance);
                const loyerDu = tenant.loyerMensuel - tenant.montantPayeMoisCourant;
                return (
                  <div key={tenant.id} className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link href={`/agent/locataires/${tenant.id}`} className="font-bold text-slate-800 text-base block">
                          {tenant.prenom} {tenant.nom}
                        </Link>
                        <span className="text-xs text-slate-400 mt-0.5 block">{formatPhone(tenant.telephone)}</span>
                      </div>
                      <StatutBadge statut={tenant.statutMoisCourant} />
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                      <div>
                        <span className="text-slate-400 block uppercase font-bold text-[9px]">Loyer restant</span>
                        <span className="font-black text-slate-800 text-sm">{formatFCFA(loyerDu)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block uppercase font-bold text-[9px]">Retard</span>
                        <span className="font-black text-red-600 text-sm">{daysOverdue} jours</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuickReminder(tenant.id)}
                      className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Relancer maintenant
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
