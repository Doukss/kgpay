"use client";

import React, { useEffect, useState } from "react";
import { useKeurGui, Tenant } from "@/context/KeurGuiContext";
import Modal from "@/components/ui/Modal";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function TenantsPage() {
  const { tenants, addTenant, updateTenant, deleteTenant, auth, signOut } =
    useKeurGui();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const paginationButtonClass =
    "rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50";

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    rentAmount: "",
    dueDate: "5",
    propertyAddress: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      rentAmount: "",
      dueDate: "5",
      propertyAddress: "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.phone ||
      !formData.rentAmount ||
      !formData.propertyAddress
    )
      return;

    addTenant({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      rentAmount: parseFloat(formData.rentAmount),
      dueDate: parseInt(formData.dueDate),
      propertyAddress: formData.propertyAddress,
    });

    setIsAddOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedTenant ||
      !formData.name ||
      !formData.phone ||
      !formData.rentAmount ||
      !formData.propertyAddress
    )
      return;

    updateTenant(selectedTenant.id, {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      rentAmount: parseFloat(formData.rentAmount),
      dueDate: parseInt(formData.dueDate),
      propertyAddress: formData.propertyAddress,
    });

    setIsEditOpen(false);
    setSelectedTenant(null);
    resetForm();
  };

  const openEditModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      name: tenant.name,
      phone: tenant.phone,
      email: tenant.email,
      rentAmount: tenant.rentAmount.toString(),
      dueDate: tenant.dueDate.toString(),
      propertyAddress: tenant.propertyAddress,
    });
    setIsEditOpen(true);
  };

  // Filter & Search tenants
  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.includes(searchTerm) ||
      tenant.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || tenant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, tenants.length]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTenants.length / ITEMS_PER_PAGE),
  );
  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Render Status Badge
  const renderStatusBadge = (status: Tenant["status"]) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center rounded-xl bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
            Payé
          </span>
        );
      case "reminded":
        return (
          <span className="inline-flex items-center rounded-xl bg-amber-50 border border-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
            Relancé
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center rounded-xl bg-rose-50 border border-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
            En retard
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
      {/* Agency Header / Auth */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
        {auth?.agency ? (
          <div className="text-sm">
            <div className="font-bold">Agence : {auth.agency.name}</div>
            <div className="text-xs text-slate-500">
              Responsable: {auth.agency.ownerName}
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-600">
            Aucune agence connectée.{" "}
            <a
              href="/agencies/signup"
              className="text-brand-primary font-semibold"
            >
              Créer une agence
            </a>
          </div>
        )}

        {auth?.agency && (
          <div>
            <button
              onClick={signOut}
              className="text-xs text-rose-600 underline"
            >
              Se déconnecter
            </button>
          </div>
        )}
      </div>
      {/* Controls & Search Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher nom, téléphone, adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs font-medium focus:border-brand-primary focus:outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Filters, view toggle and Add Button */}
        <div className="flex flex-wrap items-center text-gray-600 gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:border-brand-primary focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="paid">Payés</option>
            <option value="unpaid">Non payés</option>
            <option value="reminded">Relancés</option>
            <option value="overdue">En retard</option>
          </select>

          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-white hover:text-slate-900"}`}
            >
              Liste
            </button>
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${viewMode === "card" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-white hover:text-slate-900"}`}
            >
              Cartes
            </button>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="rounded-xl bg-brand-primary hover:bg-brand-primary-light px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-950/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Locataire</span>
          </button>
        </div>
      </div>

      {/* Tenants Table Card */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        {filteredTenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Search className="h-12 w-12 text-slate-200 mb-3" />
            <span className="text-xs font-semibold">
              Aucun locataire trouvé.
            </span>
            <span className="text-[10px] text-slate-500 mt-1">
              Ajustez vos filtres ou ajoutez un nouveau profil.
            </span>
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-medium text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Nom / Contact</th>
                  <th className="px-6 py-4">Bien Immobilier</th>
                  <th className="px-6 py-4">Loyer Mensuel</th>
                  <th className="px-6 py-4">Date d&apos;Échéance</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm leading-tight">
                        {tenant.name}
                      </div>
                      <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {tenant.phone}
                        </span>
                        {tenant.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {tenant.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-1 max-w-50">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="font-medium text-slate-700 leading-normal">
                          {tenant.propertyAddress}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 text-sm">
                        {tenant.rentAmount.toLocaleString("fr-FR")}
                      </span>{" "}
                      <span className="text-[10px] text-slate-400 font-semibold">
                        FCFA
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Le {tenant.dueDate} du mois</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {renderStatusBadge(tenant.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(tenant)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Modifier le locataire"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteTenant(tenant.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Supprimer le locataire"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Locataire
                    </p>
                    <h3 className="mt-2 text-base font-bold text-slate-900">
                      {tenant.name}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {tenant.propertyAddress}
                    </p>
                  </div>
                  <div>{renderStatusBadge(tenant.status)}</div>
                </div>
                <div className="mt-4 grid gap-3 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between rounded-2xl bg-white p-3 border border-slate-100">
                    <span>Montant</span>
                    <span className="font-semibold text-slate-900">
                      {tenant.rentAmount.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white p-3 border border-slate-100">
                    <span>Échéance</span>
                    <span className="font-semibold text-slate-900">
                      Le {tenant.dueDate}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white p-3 border border-slate-100">
                    <div className="text-[11px] text-slate-500">Contact</div>
                    <div className="mt-2 text-slate-900 font-semibold">
                      {tenant.phone}
                    </div>
                    {tenant.email && (
                      <div className="mt-1 text-[11px] text-slate-500">
                        {tenant.email}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openEditModal(tenant)}
                    className="rounded-2xl bg-white px-3 py-2 text-[11px] font-semibold text-blue-500 border border-slate-200 hover:bg-slate-100"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => deleteTenant(tenant.id)}
                    className="rounded-2xl bg-white px-3 py-2 text-[11px] font-semibold text-rose-600 border border-rose-100 hover:bg-rose-50"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredTenants.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row">
            <div className="text-[11px] text-slate-500">
              Affichage de{" "}
              {Math.min(
                filteredTenants.length,
                (currentPage - 1) * ITEMS_PER_PAGE + 1,
              )}{" "}
              à {Math.min(filteredTenants.length, currentPage * ITEMS_PER_PAGE)}{" "}
              sur {filteredTenants.length} locataire
              {filteredTenants.length > 1 ? "s" : ""}.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className={paginationButtonClass}
              >
                Précédent
              </button>
              <span className="text-[11px] text-slate-500">
                Page {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className={paginationButtonClass}
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Tenant Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Ajouter un nouveau locataire"
      >
        <form
          onSubmit={handleAddSubmit}
          className="space-y-4 text-xs font-semibold text-slate-700"
        >
          <div>
            <label className="block text-slate-600 mb-1">Nom complet *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: Mamadou Diallo"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-slate-600 mb-1">
                Téléphone (Sénégal/UEMOA) *
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Ex: 771234567"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">
                Adresse e-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ex: diallo@gmail.com"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-slate-600 mb-1">
                Montant Loyer (FCFA) *
              </label>
              <input
                type="number"
                name="rentAmount"
                required
                value={formData.rentAmount}
                onChange={handleInputChange}
                placeholder="Ex: 250000"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">
                Jour d&apos;échéance du mois *
              </label>
              <select
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-semibold focus:border-brand-primary focus:outline-none bg-white"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    Le {day} du mois
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1">
              Adresse du bien / Logement *
            </label>
            <textarea
              name="propertyAddress"
              required
              rows={3}
              value={formData.propertyAddress}
              onChange={handleInputChange}
              placeholder="Ex: Apt 4A, Immeuble Horizon, Mermoz VDN, Dakar"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none resize-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-slate-500 font-bold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-primary hover:bg-brand-primary-light px-5 py-2.5 text-white font-bold shadow-md shadow-emerald-950/20 transition-colors"
            >
              Enregistrer le locataire
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Tenant Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Modifier le locataire"
      >
        <form
          onSubmit={handleEditSubmit}
          className="space-y-4 text-xs font-semibold text-slate-700"
        >
          <div>
            <label className="block text-slate-600 mb-1">Nom complet *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-slate-600 mb-1">Téléphone *</label>
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
              <label className="block text-slate-600 mb-1">
                Adresse e-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-slate-600 mb-1">
                Montant Loyer (FCFA) *
              </label>
              <input
                type="number"
                name="rentAmount"
                required
                value={formData.rentAmount}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">
                Jour d&apos;échéance *
              </label>
              <select
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-semibold focus:border-brand-primary focus:outline-none bg-white"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    Le {day} du mois
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1">
              Adresse du bien *
            </label>
            <textarea
              name="propertyAddress"
              required
              rows={3}
              value={formData.propertyAddress}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium focus:border-brand-primary focus:outline-none resize-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-slate-500 font-bold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-primary hover:bg-brand-primary-light px-5 py-2.5 text-white font-bold shadow-md shadow-emerald-950/20 transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
