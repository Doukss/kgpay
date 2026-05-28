"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: "wave" | "orange_money" | "free_money";
  reference: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  rentAmount: number; // in FCFA
  dueDate: number; // day of the month (e.g. 5)
  propertyAddress: string;
  status: "paid" | "unpaid" | "reminded" | "overdue";
  lastReminderSent?: string; // ISO date string
  payments: Payment[];
}

export interface ReminderTemplates {
  sms: string;
  whatsapp: string;
}

export interface Settings {
  companyName: string;
  phone: string;
  email: string;
  waveNumber: string;
  orangeMoneyNumber: string;
  freeMoneyNumber: string;
  templates: ReminderTemplates;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

interface KeurGuiContextType {
  tenants: Tenant[];
  settings: Settings;
  toasts: Toast[];
  addTenant: (tenant: Omit<Tenant, "id" | "status" | "payments">) => void;
  updateTenant: (id: string, tenant: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  sendReminder: (id: string, type: "sms" | "whatsapp") => string; // returns simulated message
  processPayment: (
    tenantId: string,
    amount: number,
    method: "wave" | "orange_money" | "free_money",
    reference: string
  ) => void;
  updateSettings: (settings: Settings) => void;
  showToast: (message: string, type: "success" | "info" | "error") => void;
  removeToast: (id: string) => void;
  resetData: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  companyName: "Immo KeurGui Assur",
  phone: "+221 77 123 45 67",
  email: "contact@keurgui-immo.sn",
  waveNumber: "77 123 45 67",
  orangeMoneyNumber: "78 987 65 43",
  freeMoneyNumber: "76 543 21 09",
  templates: {
    sms: "Bonjour {name}, votre loyer de {amount} FCFA pour {property} est attendu au plus tard le {due_date} du mois. Veuillez regler en ligne ici : {link}",
    whatsapp: "Bonjour {name} 👋,\n\nNous espérons que vous allez bien. Ce message concerne le loyer de votre logement *{property}*.\n\nLe montant est de *{amount} FCFA* et est attendu pour le *{due_date}*. Vous pouvez effectuer votre paiement directement via Wave ou Orange Money en cliquant sur ce lien de paiement sécurisé :\n\n🔗 {link}\n\nMerci de votre confiance,\n*{company}*",
  },
};

const DEFAULT_TENANTS: Tenant[] = [
  {
    id: "mamadou-diop",
    name: "Mamadou Diop",
    phone: "776543210",
    email: "mamadou.diop@gmail.com",
    rentAmount: 450000,
    dueDate: 5,
    propertyAddress: "Villa 4 Bis, Fann Résidence, Dakar",
    status: "reminded",
    lastReminderSent: "2026-05-26T10:30:00.000Z",
    payments: [],
  },
  {
    id: "awa-sow",
    name: "Awa Sow",
    phone: "781234567",
    email: "awa.sow@yahoo.fr",
    rentAmount: 250000,
    dueDate: 5,
    propertyAddress: "Apt B2, Mermoz Extension, Dakar",
    status: "paid",
    payments: [
      {
        id: "pay-1",
        amount: 250000,
        date: "2026-05-04T15:20:00.000Z",
        method: "wave",
        reference: "W_987654321_REC",
      },
    ],
  },
  {
    id: "cheikh-ndiaye",
    name: "Cheikh Ndiaye",
    phone: "765004488",
    email: "cheikh.ndiaye@outlook.com",
    rentAmount: 180000,
    dueDate: 10,
    propertyAddress: "Studio 3, Dakar Plateau",
    status: "overdue",
    payments: [],
  },
  {
    id: "fatou-diallo",
    name: "Fatou Diallo",
    phone: "778901234",
    email: "fatou.diallo@gmail.com",
    rentAmount: 300000,
    dueDate: 5,
    propertyAddress: "Immeuble Sahel, Liberté 6, Dakar",
    status: "unpaid",
    payments: [],
  },
];

const KeurGuiContext = createContext<KeurGuiContextType | undefined>(undefined);

export function KeurGuiProvider({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTenants = localStorage.getItem("keurgui_tenants");
      const storedSettings = localStorage.getItem("keurgui_settings");

      if (storedTenants) {
        setTenants(JSON.parse(storedTenants));
      } else {
        setTenants(DEFAULT_TENANTS);
        localStorage.setItem("keurgui_tenants", JSON.stringify(DEFAULT_TENANTS));
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem("keurgui_settings", JSON.stringify(DEFAULT_SETTINGS));
      }
      setIsInitialized(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("keurgui_tenants", JSON.stringify(tenants));
    }
  }, [tenants, isInitialized]);

  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("keurgui_settings", JSON.stringify(settings));
    }
  }, [settings, isInitialized]);

  const showToast = (message: string, type: "success" | "info" | "error") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4s
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addTenant = (tenantData: Omit<Tenant, "id" | "status" | "payments">) => {
    const id = tenantData.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newTenant: Tenant = {
      ...tenantData,
      id: id || `loc-${Date.now()}`,
      status: "unpaid",
      payments: [],
    };

    setTenants((prev) => [...prev, newTenant]);
    showToast(`Le locataire ${tenantData.name} a bien été ajouté !`, "success");
  };

  const updateTenant = (id: string, updatedFields: Partial<Tenant>) => {
    setTenants((prev) =>
      prev.map((tenant) => (tenant.id === id ? { ...tenant, ...updatedFields } : tenant))
    );
    showToast("Locataire mis à jour avec succès", "success");
  };

  const deleteTenant = (id: string) => {
    const tenant = tenants.find((t) => t.id === id);
    setTenants((prev) => prev.filter((t) => t.id !== id));
    showToast(`Le locataire ${tenant?.name || ""} a été supprimé.`, "info");
  };

  const sendReminder = (id: string, type: "sms" | "whatsapp"): string => {
    let message = "";
    setTenants((prev) =>
      prev.map((tenant) => {
        if (tenant.id === id) {
          const rawTemplate =
            type === "sms" ? settings.templates.sms : settings.templates.whatsapp;
          const host =
            typeof window !== "undefined"
              ? window.location.origin
              : "https://pay.keurguipay.sn";
          const paymentLink = `${host}/pay/${tenant.id}`;

          message = rawTemplate
            .replace(/{name}/g, tenant.name)
            .replace(/{amount}/g, tenant.rentAmount.toLocaleString("fr-FR"))
            .replace(/{property}/g, tenant.propertyAddress)
            .replace(/{due_date}/g, `${tenant.dueDate} du mois`)
            .replace(/{link}/g, paymentLink)
            .replace(/{company}/g, settings.companyName);

          return {
            ...tenant,
            status: tenant.status === "paid" ? "paid" : "reminded",
            lastReminderSent: new Date().toISOString(),
          };
        }
        return tenant;
      })
    );

    showToast(
      `Relance ${type.toUpperCase()} générée pour ${
        tenants.find((t) => t.id === id)?.name
      } !`,
      "success"
    );
    return message;
  };

  const processPayment = (
    tenantId: string,
    amount: number,
    method: "wave" | "orange_money" | "free_money",
    reference: string
  ) => {
    setTenants((prev) =>
      prev.map((tenant) => {
        if (tenant.id === tenantId) {
          const newPayment: Payment = {
            id: `pay-${Date.now()}`,
            amount,
            date: new Date().toISOString(),
            method,
            reference,
          };
          return {
            ...tenant,
            status: "paid",
            payments: [newPayment, ...tenant.payments],
          };
        }
        return tenant;
      })
    );

    showToast(`Paiement de ${amount.toLocaleString("fr-FR")} FCFA enregistré !`, "success");
  };

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    showToast("Paramètres sauvegardés avec succès !", "success");
  };

  const resetData = () => {
    setTenants(DEFAULT_TENANTS);
    setSettings(DEFAULT_SETTINGS);
    if (typeof window !== "undefined") {
      localStorage.setItem("keurgui_tenants", JSON.stringify(DEFAULT_TENANTS));
      localStorage.setItem("keurgui_settings", JSON.stringify(DEFAULT_SETTINGS));
    }
    showToast("Données réinitialisées aux valeurs de démo !", "info");
  };

  return (
    <KeurGuiContext.Provider
      value={{
        tenants,
        settings,
        toasts,
        addTenant,
        updateTenant,
        deleteTenant,
        sendReminder,
        processPayment,
        updateSettings,
        removeToast,
        showToast,
        resetData,
      }}
    >
      {children}

      {/* Global Toast Render */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium animate-slide-in transition-all duration-300 ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : toast.type === "error"
                ? "bg-rose-50 border-rose-100 text-rose-800"
                : "bg-slate-50 border-slate-100 text-slate-800"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            {toast.type === "info" && <Info className="h-5 w-5 text-slate-600 shrink-0" />}

            <div className="flex-1">{toast.message}</div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 rounded-lg p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </KeurGuiContext.Provider>
  );
}

export function useKeurGui() {
  const context = useContext(KeurGuiContext);
  if (context === undefined) {
    throw new Error("useKeurGui must be used within a KeurGuiProvider");
  }
  return context;
}
