"use client";

import React from "react";
import { useKeurGui } from "@/context/KeurGuiContext";
import {
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  Coins,
  Receipt,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

export default function DashboardOverview() {
  const { tenants } = useKeurGui();

  // Metrics calculations
  const totalTenants = tenants.length;
  
  const expectedRevenue = tenants.reduce((acc, t) => acc + t.rentAmount, 0);
  
  const collectedRevenue = tenants.reduce((acc, t) => {
    if (t.status === "paid") {
      return acc + t.rentAmount;
    }
    // Also include payments in this month if any
    const thisMonthPayments = t.payments.reduce((pAcc, p) => pAcc + p.amount, 0);
    return acc + thisMonthPayments;
  }, 0);

  const outstandingRevenue = expectedRevenue - collectedRevenue;
  
  const recoveryRate = expectedRevenue > 0 ? (collectedRevenue / expectedRevenue) * 100 : 0;
  
  const overdueTenantsCount = tenants.filter((t) => t.status === "overdue").length;
  const paidTenantsCount = tenants.filter((t) => t.status === "paid").length;
  const remindedTenantsCount = tenants.filter((t) => t.status === "reminded").length;
  const unpaidTenantsCount = tenants.filter((t) => t.status === "unpaid").length;

  // Flatten payments for recent logs
  const allPayments = tenants
    .flatMap((t) =>
      t.payments.map((p) => ({
        ...p,
        tenantName: t.name,
        tenantId: t.id,
        propertyAddress: t.propertyAddress,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner / Welcome */}
      <div className="rounded-2xl bg-slate-900 p-6 md:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Background decorative gradient */}
        <div className="absolute top-0 right-0 -mt-24 -mr-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 max-w-xl">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Plateforme de Recouvrement Sénégal
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Suivez en temps réel les loyers de vos locataires, envoyez des relances Wave/WhatsApp en 1 clic et recevez les paiements instantanément.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/recovery"
              className="rounded-xl bg-brand-primary hover:bg-brand-primary-light px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-950/20 transition-all flex items-center gap-1.5"
            >
              <span>Lancer des relances</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/tenants"
              className="rounded-xl border border-slate-700 bg-transparent hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors"
            >
              Gérer les locataires
            </Link>
            <Link
              href="/admin/agencies"
              className="rounded-xl border border-slate-700 bg-transparent hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors"
            >
              Gérer les agences
            </Link>
            <Link
              href="/agencies"
              className="rounded-xl border border-slate-700 bg-transparent hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors"
            >
              Espace agences
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Expected Revenue */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Loyers Attendus
            </span>
            <h3 className="text-2xl font-bold text-slate-900">
              {expectedRevenue.toLocaleString("fr-FR")} <span className="text-sm font-semibold text-slate-500">FCFA</span>
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <Coins className="h-3.5 w-3.5 text-slate-400" />
              <span>Attendu ce mois</span>
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-slate-600 border border-slate-100">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Collected Revenue */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Encaissé (Mobile Money)
            </span>
            <h3 className="text-2xl font-bold text-emerald-600">
              {collectedRevenue.toLocaleString("fr-FR")} <span className="text-sm font-semibold text-emerald-600">FCFA</span>
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{recoveryRate.toFixed(1)}% du total recouvré</span>
            </span>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 border border-emerald-100">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Outstanding Revenue */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Reste à Recouvrer
            </span>
            <h3 className="text-2xl font-bold text-slate-900">
              {outstandingRevenue.toLocaleString("fr-FR")} <span className="text-sm font-semibold text-slate-500">FCFA</span>
            </h3>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${outstandingRevenue > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {outstandingRevenue > 0 ? (
                <>
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span>En attente de paiement</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Recouvrement 100% complété</span>
                </>
              )}
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-slate-600 border border-slate-100">
            <Coins className="h-5 w-5" />
          </div>
        </div>

        {/* Overdue Count */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              En Retard (+ Échéance)
            </span>
            <h3 className={`text-2xl font-bold ${overdueTenantsCount > 0 ? "text-rose-600" : "text-slate-900"}`}>
              {overdueTenantsCount} locataire{overdueTenantsCount > 1 ? "s" : ""}
            </h3>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${overdueTenantsCount > 0 ? "text-rose-600" : "text-slate-500"}`}>
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{overdueTenantsCount > 0 ? "Nécessite relance urgente" : "Zéro retard critique"}</span>
            </span>
          </div>
          <div className={`rounded-xl p-3 border ${overdueTenantsCount > 0 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-600 border-slate-100"}`}>
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* SVG chart card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Historique de Collecte Mensuelle</h3>
              <p className="text-xs text-slate-400">Comparaison de collecte sur les 5 derniers mois</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Encaissé
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" /> Attendu
              </span>
            </div>
          </div>

          {/* Premium SVG Custom Bar Chart */}
          <div className="relative h-64 w-full flex items-end">
            {/* SVG Background grids */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-slate-100 w-full h-0" />
              <div className="border-b border-slate-100 w-full h-0" />
              <div className="border-b border-slate-100 w-full h-0" />
              <div className="border-b border-slate-100 w-full h-0" />
              <div className="border-b border-slate-100 w-full h-0" />
            </div>

            {/* Custom SVG Drawing */}
            <svg className="w-full h-full relative z-10" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Month 1: Jan */}
              <rect x="35" y="60" width="22" height="120" rx="3" fill="#e2e8f0" />
              <rect x="35" y="90" width="22" height="90" rx="3" fill="#10b981" className="transition-all hover:fill-emerald-600 duration-300" />

              {/* Month 2: Fev */}
              <rect x="135" y="50" width="22" height="130" rx="3" fill="#e2e8f0" />
              <rect x="135" y="70" width="22" height="110" rx="3" fill="#10b981" />

              {/* Month 3: Mar */}
              <rect x="235" y="40" width="22" height="140" rx="3" fill="#e2e8f0" />
              <rect x="235" y="60" width="22" height="120" rx="3" fill="#10b981" />

              {/* Month 4: Avr */}
              <rect x="335" y="30" width="22" height="150" rx="3" fill="#e2e8f0" />
              <rect x="335" y="40" width="22" height="140" rx="3" fill="#10b981" />

              {/* Month 5: Mai (Current) */}
              <rect x="435" y="20" width="22" height="160" rx="3" fill="#cbd5e1" />
              <rect
                x="435"
                y={180 - (160 * (recoveryRate / 100))}
                width="22"
                height={160 * (recoveryRate / 100)}
                rx="3"
                fill="#059669"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* X Axis Labels */}
            <div className="absolute bottom-[-24px] left-0 w-full flex justify-between px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="w-20 text-center">Janvier</span>
              <span className="w-20 text-center">Février</span>
              <span className="w-20 text-center">Mars</span>
              <span className="w-20 text-center">Avril</span>
              <span className="w-20 text-center">Mai</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-slate-400 font-semibold border-t border-slate-50">
            <span>Graphique dynamique basé sur les données actuelles</span>
            <span className="text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
              Dernière collecte : Aujourd&apos;hui
            </span>
          </div>
        </div>

        {/* Status Breakdown Gauge */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Répartition des Statuts</h3>
            <p className="text-xs text-slate-400">État de paiement des locataires actifs</p>
          </div>

          {/* Progress stack */}
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${totalTenants > 0 ? (paidTenantsCount / totalTenants) * 100 : 0}%` }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title="Payé"
            />
            <div
              style={{ width: `${totalTenants > 0 ? (remindedTenantsCount / totalTenants) * 100 : 0}%` }}
              className="bg-amber-400 h-full transition-all duration-500"
              title="Relancé"
            />
            <div
              style={{ width: `${totalTenants > 0 ? (unpaidTenantsCount / totalTenants) * 100 : 0}%` }}
              className="bg-slate-300 h-full transition-all duration-500"
              title="En attente"
            />
            <div
              style={{ width: `${totalTenants > 0 ? (overdueTenantsCount / totalTenants) * 100 : 0}%` }}
              className="bg-rose-500 h-full transition-all duration-500"
              title="En retard"
            />
          </div>

          {/* Legend Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-emerald-500" />
                <span className="text-slate-600">Payé</span>
              </div>
              <span className="text-slate-950">{paidTenantsCount} ({totalTenants > 0 ? Math.round((paidTenantsCount / totalTenants) * 100) : 0}%)</span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-amber-400" />
                <span className="text-slate-600">Relancé</span>
              </div>
              <span className="text-slate-950">{remindedTenantsCount} ({totalTenants > 0 ? Math.round((remindedTenantsCount / totalTenants) * 100) : 0}%)</span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-slate-300" />
                <span className="text-slate-600">Non payé (En attente)</span>
              </div>
              <span className="text-slate-950">{unpaidTenantsCount} ({totalTenants > 0 ? Math.round((unpaidTenantsCount / totalTenants) * 100) : 0}%)</span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-rose-500" />
                <span className="text-slate-600">En retard</span>
              </div>
              <span className="text-slate-950">{overdueTenantsCount} ({totalTenants > 0 ? Math.round((overdueTenantsCount / totalTenants) * 100) : 0}%)</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-[11px] text-slate-500 leading-normal">
            Le statut <strong>Relancé</strong> passe automatiquement à <strong>Payé</strong> dès que le locataire effectue le paiement depuis son lien reçu.
          </div>
        </div>
      </div>

      {/* Recent Payments Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Transactions Récentes</h3>
            <p className="text-xs text-slate-400">Historique des derniers règlements enregistrés</p>
          </div>
          <Link
            href="/dashboard/recovery"
            className="text-xs font-bold text-brand-primary hover:text-brand-primary-light transition-colors flex items-center gap-1"
          >
            <span>Voir tout</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {allPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <Receipt className="h-10 w-10 text-slate-200 mb-2.5" />
            <span className="text-xs font-semibold">Aucun paiement enregistré pour le moment.</span>
            <span className="text-[10px] text-slate-500 mt-1">Utilisez le portail de paiement pour simuler une rentrée d&apos;argent.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {allPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold ${
                    payment.method === "wave"
                      ? "bg-sky-50 text-wave"
                      : payment.method === "orange_money"
                      ? "bg-amber-50 text-orange-money"
                      : "bg-rose-50 text-free-money"
                  }`}>
                    {payment.method === "wave" ? "W" : payment.method === "orange_money" ? "OM" : "FM"}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{payment.tenantName}</span>
                    <span className="text-[10px] text-slate-500 block">{payment.propertyAddress}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-emerald-600 block">
                    +{payment.amount.toLocaleString("fr-FR")} FCFA
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Ref: {payment.reference}
                  </span>
                </div>

                <div className="hidden sm:block text-right">
                  <span className="text-slate-600 block font-medium">
                    {new Date(payment.date).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {new Date(payment.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
