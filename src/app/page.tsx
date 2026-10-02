import Link from 'next/link';
import { Smartphone, BookOpen, Cpu, Zap, ArrowRight, ShieldCheck, Activity, Layers, Radio, GraduationCap, ExternalLink, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-12">
      {/* Hero Section com Identidade Visual SENAI */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 border border-blue-200 text-[#005caa] dark:bg-blue-950/70 dark:border-blue-800/80 dark:text-sky-300 text-xs font-semibold tracking-wide shadow-sm">
          <Radio className="w-3.5 h-3.5 animate-pulse text-[#005caa] dark:text-sky-400" />
          <span>SENAI • Unidade Curricular de Eletrônica de Potência</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Controle & Supervisão Didática de{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#005caa] via-[#0284c7] to-[#38bdf8] dark:from-sky-300 dark:via-blue-300 dark:to-cyan-200">
            Motores Trifásicos
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Transforme seu smartphone em uma <strong>IHM Industrial</strong>. Acione contatores e motores elétricos de 220V reais na bancada do laboratório através de um circuito de comando seguro com Arduino e relé óptico.
        </p>

        {/* Badge do Docente Gabriel Piske */}
        <div className="pt-2 flex items-center justify-center">
          <a
            href="https://piske.online"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#005caa] bg-white border border-blue-200 hover:border-[#005caa] shadow-sm hover:shadow-md dark:bg-blue-950/40 dark:border-blue-800/60 dark:text-blue-200 dark:hover:border-sky-400 transition-all group"
          >
            <GraduationCap className="w-4 h-4 text-[#005caa] dark:text-sky-400 group-hover:scale-110 transition-transform" />
            <span>Idealizado pelo <strong className="font-bold underline decoration-blue-400/60">Docente Gabriel Piske</strong> • piske.online</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </section>

      {/* Grid de Acesso Rápido aos Módulos */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: IHM Aluno */}
        <Link
          href="/controle"
          className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-blue-200/90 hover:border-emerald-500 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10 dark:bg-[#0c1836] dark:border-blue-900/60 dark:hover:border-emerald-500/60 dark:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Ambiente do Aluno</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                IHM de Controle Mobile
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Painel com botoeira industrial (Ligar / Desligar), botão de emergência com trava e sinalizadores de status em tempo real.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-blue-900/60 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>Acessar Painel</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Ensino & Teoria */}
        <Link
          href="/ensino"
          className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-blue-200/90 hover:border-[#005caa] shadow-sm hover:shadow-lg hover:shadow-blue-500/10 dark:bg-[#0c1836] dark:border-blue-900/60 dark:hover:border-sky-400/60 dark:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#005caa] dark:text-sky-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#005caa] dark:text-sky-400">Conteúdo Pedagógico</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 group-hover:text-[#005caa] dark:group-hover:text-sky-300 transition-colors">
                Trilha Teórica & Diagramas
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Diagrama unifilar e multifilar interativo com animação de corrente, conceitos de relés, isolação galvânica e normas NR-10/NR-12.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-blue-900/60 flex items-center justify-between text-xs font-bold text-[#005caa] dark:text-sky-400">
            <span>Explorar Aulas</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 3: Bancada do Professor */}
        <Link
          href="/bancada"
          className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-blue-200/90 hover:border-amber-500 shadow-sm hover:shadow-lg hover:shadow-amber-500/10 dark:bg-[#0c1836] dark:border-blue-900/60 dark:hover:border-amber-400/60 dark:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Área do Instrutor</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                Bancada USB (Web Serial)
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Conexão direta com a porta COM do Arduino Uno pelo navegador (Chrome/Edge), monitor de telemetria e sincronização com a nuvem.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-blue-900/60 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
            <span>Conectar Arduino</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </section>

      {/* Bloco de Destaque: Autoria Pedagógica com Gabriel Piske */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-[#004785] to-[#005caa] text-white shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-blue-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Engenharia Pedagógica & Inovação Educacional</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Concepção e Desenvolvimento por Gabriel Piske
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              <strong>Docente de Tecnologia e Eletrônica e Desenvolvedor de Ferramentas e Softwares Educacionais</strong>. A plataforma Motor-Link unifica a teoria de Comandos Elétricos Industriais à prática com microcontroladores e conectividade moderna em nuvem, garantindo segurança operacional total em laboratório didático.
            </p>
          </div>

          <a
            href="https://piske.online"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-white text-[#005caa] font-bold text-xs hover:bg-blue-50 shadow-lg hover:shadow-xl active:scale-95 transition-all shrink-0 flex items-center gap-2"
          >
            <span>Conhecer Projetos em piske.online</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Cadeia de Acionamento Didática */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-blue-200/90 dark:bg-[#0a1532]/80 dark:border-blue-900/60 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-[#005caa] dark:text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Como Funciona a Cadeia de Acionamento</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Do toque na tela do smartphone até o giro do eixo do motor trifásico</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#070e24] border border-blue-100 dark:border-blue-900/50 space-y-2">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">1. Smartphone</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">O aluno pressiona "Ligar" no navegador web.</p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#070e24] border border-blue-100 dark:border-blue-900/50 space-y-2">
            <div className="text-xs font-bold text-[#005caa] dark:text-sky-400">2. Firebase / Nuvem</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Comando transmitido em tempo real com baixa latência.</p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#070e24] border border-blue-100 dark:border-blue-900/50 space-y-2">
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400">3. Arduino Uno (5V)</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Recebe via serial e comuta o pino digital D7.</p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#070e24] border border-blue-100 dark:border-blue-900/50 space-y-2">
            <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400">4. Relé (24VDC)</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Isolação óptica; fecha contato e energiza a bobina do contator.</p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#070e24] border border-blue-100 dark:border-blue-900/50 space-y-2">
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400">5. Motor (220V 3F)</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Contator fecha contatos de potência e aciona o motor.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
