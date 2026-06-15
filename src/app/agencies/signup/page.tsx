"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useKeurGui } from "../../../context/KeurGuiContext";

export default function AgencySignupPage() {
  const router = useRouter();
  const { signupAgency, showToast } = useKeurGui();

  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [defaultTenantName, setDefaultTenantName] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signupAgency({
        name,
        ownerName,
        email,
        phone,
        defaultTenantName,
      });
      if (result) {
        showToast("Inscription réussie — vous êtes connecté.", "success");
        router.push("/dashboard");
      } else {
        showToast("Impossible de s'inscrire pour le moment.", "error");
      }
    } catch {
      showToast("Erreur lors de l'inscription.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Créer votre agence</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">{"Nom de l'agence"}</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Nom du responsable
          </label>
          <input
            className="w-full border rounded px-3 py-2"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">E‑mail</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Téléphone (optionnel)
          </label>
          <input
            className="w-full border rounded px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Nom du premier tenant (optionnel)
          </label>
          <input
            className="w-full border rounded px-3 py-2"
            value={defaultTenantName}
            onChange={(e) => setDefaultTenantName(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white px-4 py-2 rounded"
          >
            {loading ? "Création..." : "Créer mon agence"}
          </button>
        </div>
      </form>
    </div>
  );
}
