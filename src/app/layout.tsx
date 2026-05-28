import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { KeurGuiProvider } from "@/context/KeurGuiContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KeurGui Pay - Recouvrement de Loyers Mobile Money",
  description: "Plateforme d'automatisation de recouvrement et de paiement des loyers par Wave et Orange Money au Sénégal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased h-full text-slate-700 bg-white`}
      >
        <KeurGuiProvider>{children}</KeurGuiProvider>
      </body>
    </html>
  );
}
