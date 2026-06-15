"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Send,
  Settings,
  Landmark,
  RefreshCw,
} from "lucide-react";
import { useKeurGui } from "@/context/KeurGuiContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { resetData } = useKeurGui();

  const menuItems = [
    {
      name: "Vue d'ensemble",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Locataires",
      href: "/dashboard/tenants",
      icon: Users,
    },
    {
      name: "Suivi & Relances",
      href: "/dashboard/recovery",
      icon: Send,
    },
    {
      name: "Agences",
      href: "/admin/agencies",
      icon: Landmark,
    },
    {
      name: "Paramètres",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-800 bg-slate-900 text-slate-400">
      {/* Brand Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white font-bold text-lg shadow-lg shadow-emerald-950/30">
          K
        </div>
        <div>
          <span className="font-bold text-white text-base leading-none block">
            KeurGui <span className="text-brand-primary-light">Pay</span>
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mt-0.5">
            Recouvrement & Pay
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-primary text-white shadow-md shadow-emerald-900/10"
                  : "hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info & Reset Action */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="rounded-xl bg-slate-800/40 p-3.5 border border-slate-800/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Landmark className="h-4 w-4 text-emerald-500" />
            <span>Afrique de l&apos;Ouest</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 leading-normal">
            Bailleur connecté au réseau Wave & Orange Money Sénégal.
          </p>
        </div>

        <button
          onClick={resetData}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-transparent hover:bg-slate-800 px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Réinitialiser la Démo</span>
        </button>
      </div>
    </aside>
  );
}
