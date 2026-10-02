import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Zap, Smartphone, BookOpen, Cpu, ShieldAlert, ExternalLink, GraduationCap } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Motor-Link | SENAI Eletrônica de Potência',
  description: 'Plataforma educacional para controle e supervisão de acionamentos elétricos trifásicos com Arduino Uno e comandos industriais. Idealizado pelo Docente Gabriel Piske (piske.online).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{const t=localStorage.getItem('motorlink-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#f4f7fc] text-slate-900 dark:bg-[#070e22] dark:text-slate-100 transition-colors duration-200 selection:bg-[#005caa] selection:text-white">
        {/* Header Principal Institucional SENAI */}
        <header className="sticky top-0 z-50 border-b border-blue-200/80 bg-white/90 dark:border-blue-900/50 dark:bg-[#08122c]/90 backdrop-blur-md transition-colors duration-200">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#004785] via-[#005caa] to-[#0284c7] flex items-center justify-center shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight text-[#005caa] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-blue-100 dark:to-sky-300">
                    Motor-Link
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-[#005caa] text-white">
                    SENAI
                  </span>
                </div>
                <span className="block text-[10px] font-semibold tracking-wider text-slate-500 dark:text-blue-300/80 uppercase -mt-0.5">
                  Eletrônica de Potência
                </span>
              </div>
            </Link>

            {/* Tag do Docente Gabriel Piske no Header */}
            <a
              href="https://piske.online"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-900 bg-blue-50/90 border border-blue-200 hover:bg-blue-100/90 hover:border-blue-300 dark:text-blue-200 dark:bg-blue-950/50 dark:border-blue-800/60 dark:hover:bg-blue-900/60 transition-all group"
              title="Docente de Tecnologia e Eletrônica e Desenvolvedor de Ferramentas e Softwares Educacionais"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#005caa] dark:text-sky-400 group-hover:scale-110 transition-transform" />
              <span>Docente: <strong className="font-semibold underline decoration-blue-400/50">Gabriel Piske</strong></span>
              <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            </a>

            {/* Navegação Rápida & Botão de Tema */}
            <div className="flex items-center gap-1 sm:gap-2">
              <nav className="flex items-center gap-1 sm:gap-1.5">
                <Link
                  href="/controle"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#005caa] hover:bg-blue-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-blue-950/60 transition-colors"
                >
                  <Smartphone className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span className="hidden sm:inline">IHM Celular</span>
                </Link>

                <Link
                  href="/ensino"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#005caa] hover:bg-blue-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-blue-950/60 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-[#005caa] dark:text-sky-400" />
                  <span className="hidden sm:inline">Ensino & Teoria</span>
                </Link>

                <Link
                  href="/bancada"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#005caa] hover:bg-blue-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-blue-950/60 transition-colors"
                >
                  <Cpu className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>Bancada (USB)</span>
                </Link>

                <Link
                  href="/supervisor"
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 dark:text-rose-300 dark:bg-rose-500/10 dark:border-rose-500/30 dark:hover:bg-rose-500/20 transition-colors"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  <span className="hidden sm:inline">Supervisor (12)</span>
                </Link>
              </nav>

              {/* Botão de Alternância de Tema SENAI (Claro/Escuro) */}
              <div className="pl-1 sm:pl-2 border-l border-blue-200 dark:border-blue-900/60">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1">
          {children}
        </main>

        {/* Rodapé Didático & Institucional com Referência a Gabriel Piske */}
        <footer className="border-t border-blue-200/80 bg-white dark:border-blue-950/80 dark:bg-[#050b1a] py-8 text-xs text-slate-600 dark:text-slate-400 transition-colors duration-200">
          <div className="max-w-6xl mx-auto px-4 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 dark:bg-blue-950/30 dark:border-blue-900/40">
              <div className="flex items-center gap-3 text-center md:text-left">
                <div className="w-10 h-10 rounded-xl bg-[#005caa]/10 border border-[#005caa]/20 dark:bg-[#005caa]/20 dark:border-[#005caa]/40 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-[#005caa] dark:text-sky-400" />
                </div>
                <div>
                  <div className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5 flex-wrap justify-center md:justify-start">
                    <span>Projeto Pedagógico & Engenharia Didática:</span>
                    <a
                      href="https://piske.online"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#005caa] hover:text-[#004785] dark:text-sky-300 dark:hover:text-sky-200 underline font-extrabold decoration-[#005caa]/50 hover:decoration-[#005caa]"
                    >
                      <span>Docente Gabriel Piske</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    Docente de Tecnologia e Eletrônica e Desenvolvedor de Ferramentas e Softwares Educacionais
                  </p>
                </div>
              </div>

              <a
                href="https://piske.online"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#004785] to-[#005caa] hover:from-[#003866] hover:to-[#004785] shadow-md shadow-blue-600/20 active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>Visitar piske.online</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left border-t border-blue-100 dark:border-blue-950 pt-4 text-[11px]">
              <p className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="font-bold text-[#005caa] dark:text-blue-400">SENAI</span>
                <span>• Unidade Curricular de Eletrônica de Potência & Comandos Elétricos Industriais</span>
              </p>
              <p className="font-mono text-slate-500 dark:text-slate-400">
                Arduino Uno • Isolação 24VDC • Força 220VAC Trifásico
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
