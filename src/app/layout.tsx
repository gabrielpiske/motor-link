import type { Metadata } from 'next';
import './globals.css';
import { ShieldAlert } from 'lucide-react';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppNavbar } from '@/components/AppNavbar';

export const metadata: Metadata = {
  title: 'Motor-Link | SENAI Eletrônica de Potência',
  description: 'Plataforma educacional para controle e supervisão de acionamentos elétricos trifásicos com Arduino Uno e comandos industriais.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        <AuthProvider>
          <AppNavbar />

          <main className="flex-1">{children}</main>

          <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500/70" />
                <span>Plataforma Didática desenvolvida para laboratórios de Comandos Elétricos e Eletrônica de Potência.</span>
              </p>
              <p className="text-slate-600 font-mono text-[11px]">
                Arduino Uno • Relé 1 Canal • 24VDC • 220VAC Trifásico
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
