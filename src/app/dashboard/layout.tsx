"use client";

import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Navigation Drawer (Sidebar) */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="pl-64 min-h-screen flex flex-col">
        {/* Navbar */}
        <Header />

        {/* Dynamic View Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
