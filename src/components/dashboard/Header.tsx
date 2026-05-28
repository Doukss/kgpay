"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useKeurGui } from "@/context/KeurGuiContext";
import { Calendar, Bell, ShieldCheck } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { settings } = useKeurGui();

  // Get Page Title based on route
  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Vue d'ensemble";
      case "/dashboard/tenants":
        return "Gestion des Locataires";
      case "/dashboard/recovery":
        return "Suivi de Recouvrement";
      case "/dashboard/settings":
        return "Configuration Système";
      default:
        return "Tableau de Bord";
    }
  };

  const getPageSubtitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Suivez la performance financière de vos parcs immobiliers.";
      case "/dashboard/tenants":
        return "Listez, modifiez et ajoutez de nouveaux locataires.";
      case "/dashboard/recovery":
        return "Envoyez des relances automatisées (SMS/WhatsApp) et suivez les statuts.";
      case "/dashboard/settings":
        return "Ajustez vos modèles de messages et numéros Wave/Orange Money.";
      default:
        return "KeurGui Pay SaaS";
    }
  };

  // Format date in French
  const formattedDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white/85 backdrop-blur-md px-8 shadow-sm">
      {/* Left Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-tight">
          {getPageTitle()}
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          {getPageSubtitle()}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-6">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100">
          <Calendar className="h-4 w-4 text-emerald-500" />
          <span className="capitalize">{formattedDate}</span>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="hidden sm:inline">Mode Démo Actif</span>
        </div>

        {/* Notifications and Profile */}
        <div className="flex items-center gap-3.5 border-l border-slate-100 pl-6">
          <button className="relative text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="h-8.5 w-8.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-800 shadow-sm">
              {settings.companyName.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-bold text-slate-900 leading-none">
                {settings.companyName}
              </span>
              <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                Administrateur
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
