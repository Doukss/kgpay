"use client";

import React, { useState, useEffect } from "react";
import { useKeurGui, Settings } from "@/context/KeurGuiContext";
import { Save, Info, RefreshCw, Smartphone, Mail, Landmark } from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings, resetData } = useKeurGui();

  const [formData, setFormData] = useState<Settings>({
    companyName: "",
    phone: "",
    email: "",
    waveNumber: "",
    orangeMoneyNumber: "",
    freeMoneyNumber: "",
    templates: {
      sms: "",
      whatsapp: "",
    },
  });

  // Sync state with settings
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("template_")) {
      const type = name.replace("template_", "") as "sms" | "whatsapp";
      setFormData((prev) => ({
        ...prev,
        templates: {
          ...prev.templates,
          [type]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl text-xs font-semibold text-slate-700 animate-fade-in">
      {/* Settings Sections Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Mail className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Profil de l&apos;Agence</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-600 mb-1">Nom de l&apos;agence / Société *</label>
              <input
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Numéro de téléphone officiel *</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">E-mail de contact *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Mobile Money accounts settings */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Landmark className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Réception Mobile Money (Simulé)</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-600 mb-1">Numéro Wave Récepteur *</label>
              <input
                type="text"
                name="waveNumber"
                required
                value={formData.waveNumber}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 block mt-1 font-medium">
                Compte sur lequel les fonds de paiement Wave du locataire seront crédités.
              </span>
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Numéro Orange Money Marchand *</label>
              <input
                type="text"
                name="orangeMoneyNumber"
                required
                value={formData.orangeMoneyNumber}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Numéro Free Money Marchand *</label>
              <input
                type="text"
                name="freeMoneyNumber"
                required
                value={formData.freeMoneyNumber}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Templates configuration card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
          <Smartphone className="h-5 w-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Modèles de Messages Automatismes</h3>
        </div>

        {/* Variables info alerts */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-[11px] text-blue-900 flex gap-3 items-start font-medium">
          <Info className="h-5 w-5 text-blue-600 shrink-0" />
          <div className="space-y-1">
            <span>Vous pouvez utiliser les variables dynamiques suivantes dans vos messages :</span>
            <div className="flex flex-wrap gap-2 mt-2">
              <code className="bg-blue-100/80 px-1.5 py-0.5 rounded text-blue-950 font-bold font-mono">{`{name}`}</code>
              <code className="bg-blue-100/80 px-1.5 py-0.5 rounded text-blue-950 font-bold font-mono">{`{amount}`}</code>
              <code className="bg-blue-100/80 px-1.5 py-0.5 rounded text-blue-950 font-bold font-mono">{`{property}`}</code>
              <code className="bg-blue-100/80 px-1.5 py-0.5 rounded text-blue-950 font-bold font-mono">{`{due_date}`}</code>
              <code className="bg-blue-100/80 px-1.5 py-0.5 rounded text-blue-950 font-bold font-mono">{`{link}`}</code>
              <code className="bg-blue-100/80 px-1.5 py-0.5 rounded text-blue-950 font-bold font-mono">{`{company}`}</code>
            </div>
          </div>
        </div>

        {/* Template editors */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-slate-600 mb-1.5">Gabarit SMS Standard</label>
            <textarea
              name="template_sms"
              required
              rows={6}
              value={formData.templates.sms}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1.5">Gabarit Rappel WhatsApp Premium (Mise en forme supportée)</label>
            <textarea
              name="template_whatsapp"
              required
              rows={6}
              value={formData.templates.whatsapp}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Save Action bar */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={resetData}
          className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-slate-500 font-bold transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Restaurer les valeurs d&apos;usine</span>
        </button>

        <button
          type="submit"
          className="rounded-xl bg-brand-primary hover:bg-brand-primary-light px-5 py-2.5 text-white font-bold shadow-md shadow-emerald-950/20 transition-colors flex items-center gap-1.5"
        >
          <Save className="h-4 w-4" />
          <span>Enregistrer les paramètres</span>
        </button>
      </div>
    </form>
  );
}
