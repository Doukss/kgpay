'use client';

import React from 'react';
import RoleSwitcher from '@/components/dev/RoleSwitcher';

export default function LocataireLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-700 flex flex-col justify-between">
      {/* Centered screen */}
      <main className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Dev Role Switcher */}
      <RoleSwitcher />
    </div>
  );
}
