import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useKeurGuiStore } from '@/lib/store';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Send,
  BarChart3,
  Settings,
  LogOut,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AgentSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { agencies, activeAgencyId, setRole } = useKeurGuiStore();
  
  const agency = agencies.find(a => a.id === activeAgencyId) || agencies[0];

  const menuItems = [
    { name: 'Tableau de bord', href: '/agent/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Locataires', href: '/agent/locataires', icon: <Users className="h-5 w-5" /> },
    { name: 'Paiements', href: '/agent/paiements', icon: <CreditCard className="h-5 w-5" /> },
    { name: 'Relances', href: '/agent/relances', icon: <Send className="h-5 w-5" /> },
    { name: 'Rapports', href: '/agent/rapports', icon: <BarChart3 className="h-5 w-5" /> },
    { name: 'Paramètres', href: '/agent/parametres', icon: <Settings className="h-5 w-5" /> }
  ];

  const handleLogout = () => {
    toast.success('Déconnexion réussie');
    setRole('agent'); // Reset role
    router.push('/login');
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'agence': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'pro': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <aside className="hidden md:flex flex-col h-full bg-white border-r border-slate-200 w-20 lg:w-64 transition-all duration-200 shrink-0 select-none">
      {/* Header Info */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
          <span className="font-black text-lg tracking-tight">K</span>
        </div>
        <div className="hidden lg:block overflow-hidden">
          <h2 className="font-bold text-slate-800 text-sm truncate">KeurGui Pay</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Building className="h-3 w-3 text-slate-400 shrink-0" />
            <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{agency?.nom}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {item.icon}
              </span>
              <span className="hidden lg:block text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Details */}
      <div className="p-4 border-t border-slate-100 space-y-4">
        {/* Plan display */}
        {agency && (
          <div className="hidden lg:block px-3 py-2 bg-slate-50 rounded-xl border border-slate-150">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Abonnement</span>
              <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full border ${getPlanBadgeColor(agency.plan)}`}>
                {agency.plan.toUpperCase()}
              </span>
            </div>
            {/* Show Quota Warning if Quota is met */}
            {agency.nbLocataires >= agency.quotaLocataires && (
              <div className="mt-1 text-[10px] text-red-600 font-bold animate-pulse">
                Quota atteint ! Mettez à niveau.
              </div>
            )}
          </div>
        )}

        {/* User profile & Logout */}
        <div className="flex items-center justify-between gap-3 overflow-hidden">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 font-bold text-xs text-slate-700">
              {agency?.nom.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-xs font-semibold text-slate-700 truncate">Gestionnaire</p>
              <p className="text-[10px] text-slate-400 truncate">Agent</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
            title="Se déconnecter"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
export default AgentSidebar;
