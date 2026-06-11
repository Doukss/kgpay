"use client";

import React, { use, useState } from "react";
import { useKeurGui } from "@/context/KeurGuiContext";
import {
  CheckCircle2,
  Printer,
  Clock,
  Home,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Loader2,
} from "lucide-react";
import confetti from "canvas-confetti";

interface PayPageProps {
  params: Promise<{ tenantId: string }>;
}

export default function TenantPaymentPage({ params }: PayPageProps) {
  const resolvedParams = use(params);
  const { tenants, processPayment, settings } = useKeurGui();
  const tenant = tenants.find((t) => t.id === resolvedParams.tenantId);

  // Flow states
  // 'selection' | 'checkout' | 'processing' | 'success'
  const [step, setStep] = useState<"selection" | "checkout" | "processing" | "success">("selection");
  const [method, setMethod] = useState<"wave" | "orange_money" | "free_money">("wave");
  
  // Form input states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [processingStatus, setProcessingStatus] = useState("");
  const [txnRef, setTxnRef] = useState("");

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center text-xs font-semibold">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100 p-8 shadow-md space-y-4">
          <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
            !
          </div>
          <h3 className="text-base font-bold text-slate-900">Locataire introuvable</h3>
          <p className="text-slate-400 font-medium leading-relaxed">
            Le lien de paiement semble expiré ou incorrect. Veuillez contacter votre agence immobilière ou votre bailleur.
          </p>
        </div>
      </div>
    );
  }

  // Calculate taxes or stamp (fictional)
  const stampFee = 100; // 100 FCFA stamp fee
  const totalAmount = tenant.rentAmount + stampFee;

  const handleSelectMethod = (selectedMethod: typeof method) => {
    setMethod(selectedMethod);
    setStep("checkout");
  };

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");
    
    // Create fictional Txn reference
    const refPrefix = method === "wave" ? "W_TXN" : method === "orange_money" ? "OM_TXN" : "FM_TXN";
    const generatedRef = `${refPrefix}_${Math.floor(100000 + Math.random() * 900000)}_PAY`;
    setTxnRef(generatedRef);

    // Simulate mobile operator processing states
    const statuses = [
      "Initialisation de la transaction sécurisée...",
      "Contact de l'opérateur mobile money...",
      method === "wave" 
        ? "Attente du scan QR code ou de validation Wave app..." 
        : "Notification de confirmation envoyée sur votre téléphone...",
      "Vérification du solde...",
      "Règlement approuvé par l'opérateur !",
    ];

    let currentStatusIndex = 0;
    setProcessingStatus(statuses[0]);

    const interval = setInterval(() => {
      currentStatusIndex++;
      if (currentStatusIndex < statuses.length) {
        setProcessingStatus(statuses[currentStatusIndex]);
      } else {
        clearInterval(interval);
        // Process in global state context
        processPayment(tenant.id, tenant.rentAmount, method, generatedRef);
        setStep("success");
        triggerConfetti();
      }
    }, 1200);
  };

  const triggerConfetti = () => {
    // Shoot confetti blasts
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#10b981", "#00a3ff", "#ff6600"],
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Printable Receipt Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, footer, .no-print {
            display: none !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col print-card">
        
        {/* Banner header (No print) */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-primary flex items-center justify-center font-bold text-sm">
              K
            </div>
            <div>
              <span className="font-bold text-sm leading-none block">KeurGui Pay</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Paiement sécurisé</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800 rounded-lg px-2.5 py-1">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>SSL 256-bit</span>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 flex-1 flex flex-col justify-center">
          
          {/* STEP 1: PAYMENT METHOD SELECTION */}
          {step === "selection" && (
            <div className="space-y-6 animate-fade-in">
              {/* Billing Info Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <Home className="h-3.5 w-3.5" />
                  <span>Détail de votre loyer</span>
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold text-sm">{tenant.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-normal mt-0.5">
                    {tenant.propertyAddress}
                  </p>
                </div>
                <div className="border-t border-slate-200/80 pt-3 flex items-end justify-between">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                      Loyer ce mois
                    </span>
                    <span className="block text-2xl font-black text-slate-900 mt-1">
                      {tenant.rentAmount.toLocaleString("fr-FR")} <span className="text-xs font-semibold">FCFA</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200/60 rounded-lg px-2.5 py-1.5 flex items-center gap-1 shadow-sm">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Échéance : {tenant.dueDate}</span>
                  </span>
                </div>
              </div>

              {/* Selector actions */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Sélectionnez votre moyen de paiement
                </h3>

                {/* Wave selector */}
                <button
                  onClick={() => handleSelectMethod("wave")}
                  className="w-full flex items-center justify-between p-4 border border-slate-200 hover:border-wave/50 hover:bg-sky-50/10 rounded-2xl transition-all group shadow-sm text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-wave flex items-center justify-center font-black text-white text-base shadow-sm">
                      W
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Wave</span>
                      <span className="text-[10px] text-slate-400 font-medium block">Payer sans frais via l&apos;app ou QR Code</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-wave transition-colors" />
                </button>

                {/* Orange Money selector */}
                <button
                  onClick={() => handleSelectMethod("orange_money")}
                  className="w-full flex items-center justify-between p-4 border border-slate-200 hover:border-orange-money/50 hover:bg-orange-50/10 rounded-2xl transition-all group shadow-sm text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-money flex items-center justify-center font-black text-white text-xs shadow-sm">
                      OM
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Orange Money</span>
                      <span className="text-[10px] text-slate-400 font-medium block">Payer via notification mobile ou OTP</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-orange-money transition-colors" />
                </button>

                {/* Free Money selector */}
                <button
                  onClick={() => handleSelectMethod("free_money")}
                  className="w-full flex items-center justify-between p-4 border border-slate-200 hover:border-free-money/50 hover:bg-rose-50/10 rounded-2xl transition-all group shadow-sm text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-free-money flex items-center justify-center font-black text-white text-xs shadow-sm">
                      FM
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Free Money</span>
                      <span className="text-[10px] text-slate-400 font-medium block">Payer via code de validation marchand</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-free-money transition-colors" />
                </button>
              </div>

              <div className="text-[10px] text-slate-400 leading-normal text-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                Vos informations bancaires ou de mobile money ne transitent pas par nos serveurs. Transactions sécurisées par nos opérateurs partenaires.
              </div>
            </div>
          )}

          {/* STEP 2: CHECKOUT INTERFACES */}
          {step === "checkout" && (
            <div className="space-y-6 animate-fade-in font-semibold text-slate-700 text-xs">
              
              {/* Back button */}
              <button
                onClick={() => setStep("selection")}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                ← Retour au choix opérateur
              </button>

              {/* Checkout details based on method */}
              {method === "wave" && (
                <form onSubmit={handleStartPayment} className="space-y-5">
                  <div className="text-center space-y-2">
                    <div className="h-12 w-12 rounded-xl bg-wave text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-sky-200">
                      W
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Paiement Sécurisé Wave</h3>
                    <p className="text-[10px] text-slate-400 font-medium max-w-62.5 mx-auto leading-relaxed">
                      Scannez le QR Code ci-dessous avec l&apos;application Wave de votre smartphone ou cliquez sur le bouton.
                    </p>
                  </div>

                  {/* QR Code Simulation */}
                  <div className="mx-auto h-36 w-36 bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col items-center justify-center relative shadow-sm group">
                    <QrCode className="h-28 w-28 text-slate-900 group-hover:scale-95 transition-transform" />
                    <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-[1px] transition-opacity rounded-xl">
                      <span className="bg-slate-900 text-white text-[8px] font-bold px-2 py-1 rounded-md">Simuler le scan</span>
                    </div>
                  </div>

                  {/* Pricing break downs */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span>Montant du loyer</span>
                      <span>{tenant.rentAmount.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span>Frais de timbre (Wave)</span>
                      <span>{stampFee} FCFA</span>
                    </div>
                    <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between text-slate-900 font-bold">
                      <span>Total à payer</span>
                      <span>{totalAmount.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-wave hover:bg-wave-dark py-3.5 text-white font-bold text-xs shadow-lg shadow-sky-950/20 transition-all"
                  >
                    Confirmer le paiement ({totalAmount.toLocaleString("fr-FR")} FCFA)
                  </button>
                </form>
              )}

              {method === "orange_money" && (
                <form onSubmit={handleStartPayment} className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="h-12 w-12 rounded-xl bg-orange-money text-white font-black text-sm flex items-center justify-center mx-auto shadow-md shadow-orange-100">
                      OM
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Paiement Orange Money</h3>
                    <p className="text-[10px] text-slate-400 font-medium max-w-62.5 mx-auto leading-relaxed">
                      Saisissez votre numéro Orange Money et le code OTP temporaire de confirmation.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Numéro Orange Money (Sénégal)</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 77 000 00 00"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-orange-money focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-600">Code secret temporaire OTP</label>
                        <span className="text-[9px] text-slate-400 font-medium">Générer via #144#391#</span>
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Ex: 123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-orange-money focus:outline-none tracking-widest text-center text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Pricing break downs */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span>Montant du loyer</span>
                      <span>{tenant.rentAmount.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span>Frais de timbre (OM)</span>
                      <span>{stampFee} FCFA</span>
                    </div>
                    <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between text-slate-900 font-bold">
                      <span>Total à payer</span>
                      <span>{totalAmount.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-orange-money hover:bg-orange-money-dark py-3.5 text-white font-bold text-xs shadow-lg shadow-orange-950/20 transition-all"
                  >
                    Valider le paiement ({totalAmount.toLocaleString("fr-FR")} FCFA)
                  </button>
                </form>
              )}

              {method === "free_money" && (
                <form onSubmit={handleStartPayment} className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="h-12 w-12 rounded-xl bg-free-money text-white font-black text-sm flex items-center justify-center mx-auto shadow-md shadow-red-100">
                      FM
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Paiement Free Money</h3>
                    <p className="text-[10px] text-slate-400 font-medium max-w-62.5 mx-auto leading-relaxed">
                      Saisissez votre numéro Free pour initier la demande de paiement mobile.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Numéro de téléphone Free</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 76 000 00 00"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-free-money focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pricing break downs */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span>Montant du loyer</span>
                      <span>{tenant.rentAmount.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span>Frais de timbre (Free)</span>
                      <span>{stampFee} FCFA</span>
                    </div>
                    <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between text-slate-900 font-bold">
                      <span>Total à payer</span>
                      <span>{totalAmount.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-free-money hover:bg-red-700 py-3.5 text-white font-bold text-xs shadow-lg shadow-red-950/20 transition-all"
                  >
                    Valider le paiement ({totalAmount.toLocaleString("fr-FR")} FCFA)
                  </button>
                </form>
              )}
            </div>
          )}

          {/* STEP 3: TRANSACTION PROCESSING */}
          {step === "processing" && (
            <div className="text-center py-10 space-y-5 animate-fade-in flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-brand-primary animate-spin" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Règlement en cours</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-1 leading-normal max-w-50 mx-auto">
                  Veuillez ne pas quitter cette page ni recharger l&apos;onglet.
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 w-full text-[10px] text-slate-500 font-bold leading-normal">
                {processingStatus}
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS & RECEIPT */}
          {step === "success" && (
            <div className="space-y-6 animate-scale-up py-2">
              <div className="text-center space-y-2 no-print">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-base font-bold text-slate-900">Paiement validé avec succès !</h3>
                <p className="text-[10px] text-slate-400 font-medium max-w-62.5 mx-auto leading-relaxed">
                  Votre loyer a été payé et validé par l&apos;opérateur. Votre propriétaire a été notifié.
                </p>
              </div>

              {/* Receipt Document */}
              <div className="border border-slate-200/80 rounded-2xl p-5 bg-white space-y-4 shadow-sm relative overflow-hidden print-card">
                {/* Diagonal paid watermark (No print) */}
                <div className="absolute top-4 -right-6 rotate-45 bg-emerald-500 text-white font-black text-[9px] px-8 py-1 uppercase tracking-wider shadow-sm no-print">
                  PAYÉ
                </div>

                <div className="border-b border-dashed border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider">Reçu de paiement</h4>
                    <span className="text-[8px] text-slate-400 block mt-0.5">KeurGui Pay Recouvrement</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5 uppercase tracking-wide">
                    Valide
                  </span>
                </div>

                {/* Receipt Grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[10px] text-slate-500 font-medium">
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider leading-none">Bailleur / Agence</span>
                    <span className="text-slate-900 font-bold mt-1 block">{settings.companyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider leading-none">Locataire</span>
                    <span className="text-slate-900 font-bold mt-1 block">{tenant.name}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider leading-none">Bien Immobilier</span>
                    <span className="text-slate-900 font-bold mt-1 block max-w-37.5 leading-relaxed">{tenant.propertyAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider leading-none">Moyen de règlement</span>
                    <span className="text-slate-900 font-bold mt-1 block capitalize">{method.replace("_", " ")}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider leading-none">Date & Heure</span>
                    <span className="text-slate-900 font-bold mt-1 block">{new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider leading-none">Réf Transaction</span>
                    <span className="text-slate-900 font-mono font-bold mt-1 block uppercase">{txnRef || "W_9983772_REC"}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3 flex items-center justify-between text-slate-900">
                  <span className="font-bold text-[11px]">Montant net acquitté</span>
                  <span className="font-black text-sm text-emerald-600">
                    {tenant.rentAmount.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>

              {/* Action buttons (No print) */}
              <div className="flex gap-3 no-print">
                <button
                  onClick={handlePrint}
                  className="flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 py-3 text-xs font-bold text-slate-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimer le reçu</span>
                </button>
                
                <a
                  href="/dashboard/recovery"
                  className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 py-3 text-xs font-bold text-white text-center transition-colors shadow"
                >
                  Retour au Dashboard
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer (No print) */}
        <div className="border-t border-slate-100 bg-slate-50 p-4 text-center text-[9px] text-slate-400 leading-normal no-print font-medium">
          Ce paiement est une simulation proposée par KeurGui Pay MVP.<br />
          Aucun débit réel ne sera effectué sur vos comptes Wave ou Orange Money.
        </div>
      </div>
    </div>
  );
}
