"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useKeurGui, Agency } from "@/context/KeurGuiContext";

export default function LoginPage() {
  const router = useRouter();
  const { getAgencies, switchAgency } = useKeurGui();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agencyId, setAgencyId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getAgencies();
    setAgencies(stored);
    if (stored.length > 0) {
      setAgencyId(stored[0].id);
    }
  }, [getAgencies]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyId) {
      setError("Sélectionnez d'abord une agence.");
      return;
    }
    const success = switchAgency(agencyId);
    if (success) {
      router.push("/dashboard");
    } else {
      setError("Impossible de vous connecter. Vérifiez votre agence.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Connexion agence</h1>
      <p className="text-sm text-slate-500 mb-6">
        Sélectionnez votre agence enregistrée pour accéder à votre espace dédié.
      </p>
      {agencies.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-600">
            Aucune agence disponible. Commencez par créer une agence.
          </p>
          <a
            href="/agencies/signup"
            className="inline-flex mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Créer une agence
          </a>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <label className="block text-sm font-medium text-slate-700">
            Agence
          </label>
          <select
            value={agencyId}
            onChange={(e) => {
              setAgencyId(e.target.value);
              setError(null);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            {agencies.map((agency: Agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white hover:bg-brand-primary-light"
          >
            Se connecter
          </button>
        </form>
      )}
    </div>
  );
}
