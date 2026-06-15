"use client";

import React, { useEffect, useState } from "react";
import { useKeurGui, Agency } from "@/context/KeurGuiContext";
import { Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminAgenciesPage() {
  const { getAgencies, switchAgency, deleteAgency } = useKeurGui();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const router = useRouter();

  useEffect(() => {
    setAgencies(getAgencies());
  }, [getAgencies]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des agences</h1>
        <a
          href="/agencies/signup"
          className="text-sm text-brand-primary font-semibold"
        >
          Créer une agence
        </a>
      </div>

      {agencies.length === 0 ? (
        <div className="rounded-xl border border-slate-100 p-6 text-slate-600">
          Aucune agence enregistrée.
        </div>
      ) : (
        <div className="grid gap-4">
          {agencies.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl border p-4"
            >
              <div>
                <div className="font-bold">{a.name}</div>
                <div className="text-sm text-slate-500">
                  Responsable: {a.ownerName} • {a.email}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const ok = switchAgency(a.id);
                    if (ok) router.push("/dashboard");
                  }}
                  className="rounded-lg bg-slate-50 px-3 py-2 text-sm border"
                >
                  <Users className="inline-block mr-2" /> Se connecter
                </button>

                <button
                  onClick={() => {
                    if (
                      !confirm(
                        `Supprimer l'agence ${a.name} ? Cette action est irréversible.`,
                      )
                    )
                      return;
                    deleteAgency(a.id);
                    setAgencies(getAgencies());
                  }}
                  className="rounded-lg bg-rose-50 px-3 py-2 text-sm border text-rose-600"
                >
                  <Trash2 className="inline-block mr-2" /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
