import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Zap, Smartphone, BookOpen, Cpu, ShieldAlert } from 'lucide-react';

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
        {/* Header Principal */}
        <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-400">
                  Motor-Link
                </span>
                <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase -mt-1">
                  SENAI • Eletrônica de Potência
                </span>
              </div>
            </Link>

            {/* Navegação Rápida */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/controle"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">IHM Celular</span>
              </Link>

              <Link
                href="/ensino"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Ensino & Teoria</span>
              </Link>

              <Link
                href="/bancada"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              >
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>Bancada (USB)</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1">
          {children}
        </main>

        {/* Rodapé Didático */}
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
      </body>
    </html>
  );
}
