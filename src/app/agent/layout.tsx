'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKeurGuiStore } from '@/lib/store';
import AgentSidebar from '@/components/layout/AgentSidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import RoleSwitcher from '@/components/dev/RoleSwitcher';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const { activeRole, setRole } = useKeurGuiStore();
  const router = useRouter();

  // Enforce role on this layout (in real SaaS this is handled by session/auth,
  // in our mock we redirect if they aren't marked as agent)
  useEffect(() => {
    if (activeRole !== 'agent') {
      // In case they manually navigated to /agent/* but state says otherwise,
      // we synchronize the state role to agent.
      setRole('agent');
    }
  }, [activeRole, setRole]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-700">
      {/* Desktop/Tablet Sidebar */}
      <AgentSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Dev Role Switcher */}
      <RoleSwitcher />
    </div>
  );
}
