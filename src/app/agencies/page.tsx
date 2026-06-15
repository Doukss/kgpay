"use client";

import Link from "next/link";
import { useKeurGui } from "@/context/KeurGuiContext";
import { PlusCircle, LogIn } from "lucide-react";

export default function AgenciesPage() {
  const { getAgencies } = useKeurGui();
  const agencies = getAgencies();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Agences</h1>
        <p className="mt-2 text-sm text-slate-500">
          Inscrivez votre agence ou connectez-vous si elle existe déjà.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/agencies/signup"
            className="rounded-3xl border border-slate-200 bg-slate-950 px-5 py-4 text-white shadow-sm transition hover:bg-slate-800 flex items-center justify-between gap-3"
          >
            <div>
              <p className="text-sm font-semibold">Créer une agence</p>
              <p className="text-xs text-slate-300">Inscription autonome et espace dédié.</p>
            </div>
            <PlusCircle className="h-6 w-6" />
          </Link>

          <Link
            href="/login"
            className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-900 shadow-sm transition hover:bg-slate-50 flex items-center justify-between gap-3"
          >
            <div>
              <p className="text-sm font-semibold">Connexion agence</p>
              <p className="text-xs text-slate-500">Sélectionnez votre agence et accédez à votre espace.</p>
            </div>
            <LogIn className="h-6 w-6" />
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Agences enregistrées</h2>
        {agencies.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune agence enregistrée pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {agencies.map((agency) => (
              <li key={agency.id} className="rounded-2xl border border-slate-100 p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{agency.name}</div>
                  <div className="text-xs text-slate-500">Responsable : {agency.ownerName}</div>
                </div>
                <Link href="/login" className="text-sm font-semibold text-brand-primary">Se connecter</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
