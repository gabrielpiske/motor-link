'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/types';
import { Loader2, AlertCircle, Lock, Mail, Zap } from 'lucide-react';
import { Suspense } from 'react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // signIn retorna UserCredential do Firebase Auth
      const credential = await signIn(email, password);
      const uid = credential.user.uid;

      // Buscar perfil no Firestore para decidir o redirecionamento
      let profile: UserProfile | null = null;
      if (db) {
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (docSnap.exists()) {
          profile = docSnap.data() as UserProfile;
        }
      }

      // Redirecionamento condicional baseado no perfil
      if (profile?.role === 'student' && profile.assignedPanel) {
        router.push(`/controle?bancada=${profile.assignedPanel}`);
      } else if (from) {
        router.push(from);
      } else {
        router.push('/');
      }
    } catch (err: any) {
      // Traduz erros comuns do Firebase Auth para português
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos. Verifique suas credenciais.');
      } else if (code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
      } else {
        setError(err.message || 'Falha ao realizar login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-2xl shadow-amber-500/30 mx-auto">
            <Zap className="w-9 h-9 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-400">Motor-Link</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              SENAI • Eletrônica de Potência — Controle de Acionamentos
            </p>
          </div>
        </div>

        {/* Card de Login */}
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-rose-950/50 border border-rose-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-200 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2" htmlFor="email">
                E-mail Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-950 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-colors"
                  placeholder="aluno@senai.br"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-950 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 text-sm font-black uppercase tracking-wider text-slate-950 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Entrar na Plataforma'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-slate-600">
          Acesso restrito a alunos e instrutores do laboratório.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
