'use client';

import { useState } from 'react';
import { Play, Square, AlertOctagon, Info, Zap, GraduationCap, ExternalLink } from 'lucide-react';

export default function InteractiveCircuit() {
  const [isEnergized, setIsEnergized] = useState(false);

  return (
    <div className="p-6 rounded-3xl bg-white border border-blue-200/90 shadow-sm dark:bg-[#0a1532]/90 dark:border-blue-900/60 dark:shadow-xl space-y-6 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#005caa] dark:text-sky-400" />
            <span>Simulador Interativo da Cadeia de Potência</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize o fluxo elétrico passando pelo nível lógico de 5V, comando de 24V e força trifásica de 220V.
          </p>
        </div>

        {/* Botão de Teste Rápido */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEnergized(!isEnergized)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 ${
              isEnergized
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                : 'bg-[#005caa] hover:bg-[#004785] text-white shadow-blue-600/20 dark:bg-emerald-600 dark:hover:bg-emerald-500'
            }`}
          >
            {isEnergized ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>Desarmar Circuito</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Simular Acionamento</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diagrama Esquemático Visual */}
      <div className="relative overflow-x-auto p-4 rounded-2xl bg-blue-50/50 dark:bg-[#060e22] border border-blue-200/70 dark:border-blue-900/50">
        <div className="min-w-[650px] grid grid-cols-4 gap-4 items-center">
          
          {/* Estágio 1: Arduino Uno (5V) */}
          <div className={`p-4 rounded-xl border-2 transition-all duration-500 text-center space-y-2 ${
            isEnergized 
              ? 'border-blue-500 bg-blue-100/60 dark:border-sky-400 dark:bg-blue-950/50' 
              : 'border-slate-200 bg-white dark:border-blue-950 dark:bg-[#0c1836]/60'
          }`}>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-[#005caa] dark:text-sky-300">
              Nível Lógico 5V
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Arduino Uno</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Pino D7 = {isEnergized ? 'HIGH (Sinal Ativo)' : 'LOW (Em espera)'}</p>
            <div className={`w-3 h-3 rounded-full mx-auto transition-all ${
              isEnergized ? 'bg-[#005caa] dark:bg-sky-400 lamp-glow-senai' : 'bg-slate-300 dark:bg-slate-700'
            }`} />
          </div>

          {/* Estágio 2: Módulo Relé 1 Canal (Isolação Galvânica) */}
          <div className={`p-4 rounded-xl border-2 transition-all duration-500 text-center space-y-2 ${
            isEnergized 
              ? 'border-cyan-500 bg-cyan-100/60 dark:border-cyan-400 dark:bg-cyan-500/10' 
              : 'border-slate-200 bg-white dark:border-blue-950 dark:bg-[#0c1836]/60'
          }`}>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300">
              Isolação Óptica
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Módulo Relé</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEnergized ? 'Contatos COM e NO FECHADOS' : 'Contatos COM e NO ABERTOS'}
            </p>
            <div className="font-mono text-[10px] text-[#005caa] dark:text-cyan-300 bg-white/90 dark:bg-slate-950/80 p-1 rounded border border-blue-200 dark:border-cyan-500/30">
              {isEnergized ? 'COM ➔ NO (Conduzindo 24V)' : 'COM | / NO (Isolado)'}
            </div>
          </div>

          {/* Estágio 3: Contator K1 (Comando 24V) */}
          <div className={`p-4 rounded-xl border-2 transition-all duration-500 text-center space-y-2 ${
            isEnergized 
              ? 'border-emerald-500 bg-emerald-100/60 dark:border-emerald-400 dark:bg-emerald-500/10' 
              : 'border-slate-200 bg-white dark:border-blue-950 dark:bg-[#0c1836]/60'
          }`}>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
              Comando 24VDC
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Contator K1</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Bobina A1/A2: {isEnergized ? 'MAGNETIZADA (Atracada)' : 'DESENERGIZADA'}
            </p>
            <div className={`w-3 h-3 rounded-full mx-auto transition-all ${
              isEnergized ? 'bg-emerald-500 dark:bg-emerald-400 lamp-glow-green' : 'bg-slate-300 dark:bg-slate-700'
            }`} />
          </div>

          {/* Estágio 4: Motor Trifásico (220VAC) */}
          <div className={`p-4 rounded-xl border-2 transition-all duration-500 text-center space-y-2 ${
            isEnergized 
              ? 'border-amber-500 bg-amber-100/60 dark:border-amber-400 dark:bg-amber-500/10' 
              : 'border-slate-200 bg-white dark:border-blue-950 dark:bg-[#0c1836]/60'
          }`}>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300">
              Força 220V 3~
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Motor Trifásico</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEnergized ? 'Em Rotação Nominal' : 'Eixo Parado'}
            </p>
            <div className={`text-xl transition-transform ${isEnergized ? 'animate-motor-running inline-block' : 'opacity-40'}`}>
              ⚙️
            </div>
          </div>
        </div>
      </div>

      {/* Explicação Didática da Etapa & Crédito */}
      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-[#070e24] border border-blue-200/80 dark:border-blue-900/50 space-y-2 text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[#005caa] dark:text-sky-400 font-bold">
            <Info className="w-4 h-4" />
            <span>Princípio de Funcionamento da Isolação Galvânica:</span>
          </div>
          <a
            href="https://piske.online"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-[#005caa] dark:text-sky-300 hover:underline font-semibold"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Docente Gabriel Piske • piske.online</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          O microcontrolador opera em baixa tensão contínua (5V TTL). Caso ocorresse um curto-circuito na rede trifásica de 220V ou um surto de 24V, a tensão poderia danificar o Arduino e o computador do instrutor. O <strong>módulo relé com optoacoplador</strong> garante que a corrente elétrica de comando nunca entre em contato físico com a eletrônica digital: o sinal é transmitido internamente por <strong>feixe de luz infravermelha</strong> e os contatos do relé operam como uma chave mecânica isolada.
        </p>
      </div>
    </div>
  );
}
