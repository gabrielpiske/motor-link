'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Smartphone, BookOpen, Cpu, ShieldAlert, LogOut, LogIn, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';

export function AppNavbar() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  return (
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
          <Link href="/ensino" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Ensino & Teoria</span>
          </Link>
          
          {!loading && user && (
            <Link href="/controle" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">IHM Celular</span>
            </Link>
          )}

          {!loading && profile?.role === 'admin' && (
            <>
              <Link href="/bancada" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>Bancada (USB)</span>
              </Link>
              <Link href="/supervisor" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-colors">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Supervisor (12)</span>
              </Link>
              <Link href="/admin/turma" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-colors">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Gestão de Turma</span>
              </Link>
            </>
          )}

          {!loading && !user && (
            <Link href="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors">
              <LogIn className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}

          {!loading && user && (
             <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-800">
               <span className="hidden md:inline text-xs font-medium text-slate-400">
                 {profile?.displayName || user.email}
               </span>
               <button
                 onClick={handleSignOut}
                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                 title="Sair"
               >
                 <LogOut className="w-4 h-4 text-slate-400" />
                 <span className="hidden sm:inline">Sair</span>
               </button>
             </div>
          )}
        </nav>
      </div>
    </header>
  );
}
