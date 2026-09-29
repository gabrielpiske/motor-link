import Link from 'next/link';
import { Smartphone, BookOpen, Cpu, Zap, ArrowRight, ShieldCheck, Activity, Layers, Radio } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide">
          <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>SENAI • Unidade Curricular de Eletrônica de Potência</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Controle & Supervisão Didática de{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400">
            Motores Trifásicos
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Transforme seu smartphone em uma <strong>IHM Industrial</strong>. Acione contatores e motores elétricos de 220V reais na bancada do laboratório através de um circuito de comando seguro com Arduino e relé óptico.
        </p>
      </section>

      {/* Grid de Acesso Rápido aos Módulos */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: IHM Aluno */}
        <Link
          href="/controle"
          className="group relative flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/50 shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Ambiente do Aluno</span>
              <h2 className="text-xl font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">
                IHM de Controle Mobile
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Painel com botoeira industrial (Ligar / Desligar), botão de emergência com trava e sinalizadores de status em tempo real.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400">
            <span>Acessar Painel</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Ensino & Teoria */}
        <Link
          href="/ensino"
          className="group relative flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/50 shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Conteúdo Pedagógico</span>
              <h2 className="text-xl font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                Trilha Teórica & Diagramas
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Diagrama unifilar e multifilar interativo com animação de corrente, conceitos de relés, isolação galvânica e normas NR-10/NR-12.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-400">
            <span>Explorar Aulas</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 3: Bancada do Professor */}
        <Link
          href="/bancada"
          className="group relative flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/50 shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Área do Instrutor</span>
              <h2 className="text-xl font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">
                Bancada USB (Web Serial)
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Conexão direta com a porta COM do Arduino Uno pelo navegador (Chrome/Edge), monitor de telemetria e sincronização com a nuvem.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400">
            <span>Conectar Arduino</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </section>

      {/* Cadeia de Acionamento Didática */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Como Funciona a Cadeia de Acionamento</h3>
            <p className="text-xs text-slate-400">Do toque na tela do smartphone até o giro do eixo do motor trifásico</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-emerald-400">1. Smartphone</div>
            <p className="text-[11px] text-slate-400">O aluno pressiona "Ligar" no navegador web.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-cyan-400">2. Firebase / Nuvem</div>
            <p className="text-[11px] text-slate-400">Comando transmitido em tempo real com baixa latência.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-amber-400">3. Arduino Uno (5V)</div>
            <p className="text-[11px] text-slate-400">Recebe via serial e comuta o pino digital D7.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-yellow-400">4. Relé (24VDC)</div>
            <p className="text-[11px] text-slate-400">Isolação óptica; fecha contato e energiza a bobina do contator.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-rose-400">5. Motor (220V 3F)</div>
            <p className="text-[11px] text-slate-400">Contator fecha contatos de potência e aciona o motor.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
