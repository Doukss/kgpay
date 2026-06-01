import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKeurGuiStore } from '@/lib/store';
import { Settings, User, Shield, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const RoleSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeRole, setRole, resetAllData } = useKeurGuiStore();
  const router = useRouter();

  // Switcher is only shown in development or local environment,
  // but we can render it always for this interactive demo.
  const handleSwitch = (role: 'agent' | 'locataire' | 'superadmin', redirectPath: string) => {
    setRole(role);
    setIsOpen(false);
    toast.success(`Rôle changé en : ${role.toUpperCase()}`);
    router.push(redirectPath);
  };

  const handleReset = () => {
    if (confirm('Voulez-vous réinitialiser toutes les données de démo ?')) {
      resetAllData();
      toast.success('Données réinitialisées !');
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full bg-slate-800 text-white shadow-lg flex items-center justify-center hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer focus:outline-none"
        title="Sélecteur de rôle (DevTools)"
      >
        <Settings className={`h-6 w-6 ${isOpen ? 'animate-spin' : ''}`} />
      </button>

      {/* Menu Popover */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white border border-slate-200 shadow-xl rounded-xl p-4 w-72 space-y-3 animate-slide-in">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">DevTools - Rôles</h4>
            <p className="text-[11px] text-slate-500">Basculez instantanément pour tester les vues.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Agent Role */}
            <button
              onClick={() => handleSwitch('agent', '/agent/dashboard')}
              className={`w-full py-2.5 px-2 text-left text-sm flex items-center gap-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                activeRole === 'agent' ? 'bg-blue-50/55 font-semibold text-blue-700' : 'text-slate-700'
              }`}
            >
              <User className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <p className="text-xs leading-none">Agent / Agence</p>
                <p className="text-[10px] text-slate-400">Gérer locataires & relances</p>
              </div>
              {activeRole === 'agent' && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
            </button>

            {/* Tenant Moussa */}
            <button
              onClick={() => handleSwitch('locataire', '/payer/moussa-diallo-token')}
              className={`w-full py-2.5 px-2 text-left text-sm flex items-center gap-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                activeRole === 'locataire' && window.location.pathname.includes('moussa-diallo') ? 'bg-green-50/55 font-semibold text-green-700' : 'text-slate-700'
              }`}
            >
              <User className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <p className="text-xs leading-none">Locataire : Moussa Diallo</p>
                <p className="text-[10px] text-slate-400">Loyer à jour - 150 000 FCFA</p>
              </div>
            </button>

            {/* Tenant Aissatou */}
            <button
              onClick={() => handleSwitch('locataire', '/payer/aissatou-niang-token')}
              className={`w-full py-2.5 px-2 text-left text-sm flex items-center gap-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                activeRole === 'locataire' && window.location.pathname.includes('aissatou-niang') ? 'bg-orange-50/55 font-semibold text-orange-700' : 'text-slate-700'
              }`}
            >
              <User className="h-4 w-4 text-orange-500" />
              <div className="flex-1">
                <p className="text-xs leading-none">Locataire : Aïssatou Niang</p>
                <p className="text-[10px] text-slate-400">Retard & Arriérés (700 000 FCFA)</p>
              </div>
            </button>

            {/* Super Admin */}
            <button
              onClick={() => handleSwitch('superadmin', '/superadmin/dashboard')}
              className={`w-full py-2.5 px-2 text-left text-sm flex items-center gap-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                activeRole === 'superadmin' ? 'bg-red-50/55 font-semibold text-red-700' : 'text-slate-700'
              }`}
            >
              <Shield className="h-4 w-4 text-red-600" />
              <div className="flex-1">
                <p className="text-xs leading-none">Super Admin</p>
                <p className="text-[10px] text-slate-400">Monitoring de la plateforme</p>
              </div>
              {activeRole === 'superadmin' && <span className="h-1.5 w-1.5 rounded-full bg-red-600" />}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button
              onClick={handleReset}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Réinitialiser
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default RoleSwitcher;
