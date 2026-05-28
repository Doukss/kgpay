"use client";

import React, { useState } from "react";
import { useKeurGui, Tenant } from "@/context/KeurGuiContext";
import Modal from "@/components/ui/Modal";
import {
  Send,
  MessageSquare,
  MessageCircle,
  Copy,
  ExternalLink,
  Smartphone,
  Check,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function RecoveryPage() {
  const { tenants, sendReminder, showToast } = useKeurGui();

  // Simulation state
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [simulationType, setSimulationType] = useState<"sms" | "whatsapp">("whatsapp");
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatedMessage, setSimulatedMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleTriggerReminder = (tenant: Tenant, type: "sms" | "whatsapp") => {
    const message = sendReminder(tenant.id, type);
    setSimulatedMessage(message);
    setSimulationType(type);
    setActiveTenant(tenant);
    setIsSimulatorOpen(true);
  };

  const handleCopyLink = () => {
    if (!activeTenant) return;
    const host = typeof window !== "undefined" ? window.location.origin : "https://pay.keurguipay.sn";
    const paymentLink = `${host}/pay/${activeTenant.id}`;

    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    showToast("Lien de paiement copié dans le presse-papiers !", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const getPaymentLink = () => {
    if (!activeTenant) return "#";
    return `/pay/${activeTenant.id}`;
  };

  // Render status badge
  const renderStatus = (status: Tenant["status"]) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Payé</span>
          </span>
        );
      case "reminded":
        return (
          <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 border border-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 animate-pulse">
            <Send className="h-3.5 w-3.5" />
            <span>Relancé</span>
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>En retard</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-xl bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
            En attente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Informative banner */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-xs text-emerald-950 flex gap-3.5 items-start">
        <Smartphone className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-emerald-900">Comment tester le flux ?</h4>
          <p className="text-emerald-800 leading-relaxed font-medium">
            1. Cliquez sur le bouton <span className="font-bold text-emerald-950">WhatsApp</span> ou{" "}
            <span className="font-bold text-emerald-950">SMS</span> d&apos;un locataire ci-dessous pour déclencher la relance.<br />
            2. Le simulateur de smartphone s&apos;ouvrira, affichant le message généré avec son lien de paiement unique.<br />
            3. Cliquez sur le bouton <strong>&quot;Ouvrir le lien de paiement&quot;</strong> pour accéder à l&apos;interface locataire, puis effectuez le paiement simulé.
          </p>
        </div>
      </div>

      {/* Recovery list table */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-left text-xs font-medium text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-4">Locataire</th>
              <th className="px-6 py-4">Loyer Mensuel</th>
              <th className="px-6 py-4">Dernière Relance</th>
              <th className="px-6 py-4">Statut Actuel</th>
              <th className="px-6 py-4 text-center">Déclencher Rappel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                {/* Name and property */}
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 text-sm">{tenant.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{tenant.propertyAddress}</div>
                </td>

                {/* Amount and due date */}
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-900 text-sm">
                    {tenant.rentAmount.toLocaleString("fr-FR")} FCFA
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
                    <Calendar className="h-3 w-3" /> Le {tenant.dueDate} du mois
                  </div>
                </td>

                {/* Last reminder sent date */}
                <td className="px-6 py-4 text-slate-500 font-semibold">
                  {tenant.lastReminderSent ? (
                    <div>
                      <span>{new Date(tenant.lastReminderSent).toLocaleDateString("fr-FR")}</span>
                      <span className="block text-[10px] text-slate-400 font-medium">
                        à {new Date(tenant.lastReminderSent).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-300 italic">Jamais relancé</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-6 py-4">{renderStatus(tenant.status)}</td>

                {/* Automation actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {tenant.status === "paid" ? (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Loyers Recouvrés</span>
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleTriggerReminder(tenant, "whatsapp")}
                          className="rounded-xl border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 px-3.5 py-2 text-emerald-700 font-bold hover:text-emerald-800 transition-colors flex items-center gap-1.5"
                          title="Simuler Rappel WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handleTriggerReminder(tenant, "sms")}
                          className="rounded-xl border border-sky-200 bg-sky-50/30 hover:bg-sky-50 px-3.5 py-2 text-sky-700 font-bold hover:text-sky-800 transition-colors flex items-center gap-1.5"
                          title="Simuler Rappel SMS"
                        >
                          <MessageSquare className="h-4 w-4 text-sky-600" />
                          <span>SMS</span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone Simulator Modal */}
      <Modal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        title={`Simulation de notification : ${activeTenant?.name}`}
      >
        <div className="flex flex-col items-center gap-6 py-2">
          {/* Smartphone mockup */}
          <div className="relative mx-auto h-[480px] w-[260px] rounded-[36px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-800 flex flex-col">
            {/* Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 h-4 w-24 rounded-full bg-slate-900 z-30 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
            </div>

            {/* Screen content */}
            <div className="w-full h-full rounded-[26px] bg-slate-100 overflow-hidden flex flex-col relative pt-5 text-slate-800">
              {/* WhatsApp Interface Header */}
              {simulationType === "whatsapp" ? (
                <div className="bg-[#075E54] text-white py-2 px-3 flex items-center gap-2 shadow">
                  <div className="h-7 w-7 rounded-full bg-emerald-800 font-bold text-xs flex items-center justify-center uppercase">
                    {activeTenant?.name.substring(0, 1)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold block leading-none">KeurGui Pay Agent</span>
                    <span className="text-[7px] text-emerald-200 block mt-0.5">En ligne</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white border-b border-slate-200 py-2 px-3 flex items-center justify-center gap-1 shadow-sm">
                  <span className="text-[9px] font-bold text-slate-900 uppercase">
                    KeurGui Pay SMS
                  </span>
                </div>
              )}

              {/* Chat bubbles area */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#E5DDD5] bg-[radial-gradient(#d3c8bb_1px,transparent_1px)] bg-[size:10px_10px]">
                {/* Simulated timestamp */}
                <div className="mx-auto text-[7px] text-slate-500 font-bold bg-white/70 px-2 py-0.5 rounded-md w-max uppercase">
                  Aujourd&apos;hui
                </div>

                {/* Chat bubble */}
                <div
                  className={`max-w-[85%] rounded-lg p-2.5 shadow-sm text-[9px] font-medium leading-relaxed relative ${
                    simulationType === "whatsapp"
                      ? "bg-[#DCF8C6] border-l-2 border-emerald-500 ml-auto"
                      : "bg-white border-l-2 border-sky-500 mr-auto"
                  }`}
                >
                  <p className="whitespace-pre-line text-slate-800">{simulatedMessage}</p>
                  <span className="text-[6px] text-slate-400 block text-right mt-1.5">
                    {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {/* Message Input Simulator */}
              <div className="bg-slate-200/50 p-2 flex items-center gap-1 border-t border-slate-200/80">
                <div className="flex-1 bg-white rounded-full py-1.5 px-3 text-[8px] text-slate-400 border border-slate-200">
                  Votre réponse...
                </div>
                <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px]">
                  ✓
                </div>
              </div>
            </div>
          </div>

          {/* User Controls */}
          <div className="w-full space-y-3 px-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 py-3 text-xs font-bold text-slate-600 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>Copier le lien</span>
              </button>

              <a
                href={getPaymentLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsSimulatorOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary-light py-3 text-xs font-bold text-white shadow-md shadow-emerald-950/20 transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Ouvrir le lien</span>
              </a>
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-normal">
              L&apos;ouverture du lien simule l&apos;action du locataire sur son propre smartphone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
