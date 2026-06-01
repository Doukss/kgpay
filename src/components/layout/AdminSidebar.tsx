import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useKeurGuiStore } from '@/lib/store';
import {
  ShieldAlert,
  Building2,
  Activity,
  Award,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { setRole } = useKeurGuiStore();

  const menuItems = [
    { name: 'Vue globale', href: '/superadmin/dashboard', icon: <Activity className="h-5 w-5" /> },
    { name: 'Agences', href: '/superadmin/tenants', icon: <Building2 className="h-5 w-5" /> },
    { name: 'Monitoring', href: '/superadmin/monitoring', icon: <ShieldAlert className="h-5 w-5" /> },
    { name: 'Plans & Tarifs', href: '/superadmin/plans', icon: <Award className="h-5 w-5" /> }
  ];

  const handleLogout = () => {
    toast.success('Déconnexion Super Admin réussie');
    setRole('agent'); // Reset
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 w-20 lg:w-64 transition-all duration-200 shrink-0 select-none">
      {/* Header Info */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
          <span className="font-black text-lg tracking-tight">K</span>
        </div>
        <div className="hidden lg:block overflow-hidden">
          <h2 className="font-bold text-white text-sm truncate">KeurGui Pay</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] uppercase font-extrabold tracking-widest text-red-500 bg-red-950/80 px-2 py-0.5 rounded border border-red-900/50">
              Super Admin
            </span>
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
                  ? 'bg-red-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="hidden lg:block text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 overflow-hidden">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0 font-bold text-xs text-white">
            SA
          </div>
          <div className="hidden lg:block overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">Administrateur</p>
            <p className="text-[10px] text-slate-500 truncate">Global Platform</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title="Se déconnecter"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
};
export default AdminSidebar;
