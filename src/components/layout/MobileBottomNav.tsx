import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useKeurGuiStore } from '@/lib/store';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Send,
  Settings,
  Activity,
  Building2,
  ShieldAlert,
  Award
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { activeRole } = useKeurGuiStore();

  const agentItems = [
    { name: 'Dashboard', href: '/agent/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Locataires', href: '/agent/locataires', icon: <Users className="h-5 w-5" /> },
    { name: 'Paiements', href: '/agent/paiements', icon: <CreditCard className="h-5 w-5" /> },
    { name: 'Relances', href: '/agent/relances', icon: <Send className="h-5 w-5" /> },
    { name: 'Paramètres', href: '/agent/parametres', icon: <Settings className="h-5 w-5" /> }
  ];

  const adminItems = [
    { name: 'Dashboard', href: '/superadmin/dashboard', icon: <Activity className="h-5 w-5" /> },
    { name: 'Agences', href: '/superadmin/tenants', icon: <Building2 className="h-5 w-5" /> },
    { name: 'Monitoring', href: '/superadmin/monitoring', icon: <ShieldAlert className="h-5 w-5" /> },
    { name: 'Plans', href: '/superadmin/plans', icon: <Award className="h-5 w-5" /> }
  ];

  const items = activeRole === 'superadmin' ? adminItems : agentItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 z-40 shadow-lg select-none pb-safe">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const activeColor = activeRole === 'superadmin' ? 'text-red-600' : 'text-blue-600';
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-500 hover:text-slate-950 cursor-pointer ${
              isActive ? `${activeColor} font-semibold` : 'text-slate-400'
            }`}
          >
            <span className={isActive ? '' : 'text-slate-400'}>
              {item.icon}
            </span>
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
export default MobileBottomNav;
