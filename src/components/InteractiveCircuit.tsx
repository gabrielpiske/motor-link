'use client';

import { useState } from 'react';
import { Play, Square, AlertOctagon, Info, Zap } from 'lucide-react';

export default function InteractiveCircuit() {
  const [isEnergized, setIsEnergized] = useState(false);

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Simulador Interativo da Cadeia de Potência</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize o fluxo elétrico passando pelo nível lógico de 5V, comando de 24V e força trifásica de 220V.
          </p>
        </div>

        {/* Botão de Teste Rápido */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEnergized(!isEnergized)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              isEnergized
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
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
      <div className="relative overflow-x-auto p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
        <div className="min-w-[650px] grid grid-cols-4 gap-4 items-center">
          
          {/* Estágio 1: Arduino Uno (5V) */}
          <div className={`p-4 rounded-xl border-2 transition-all duration-500 text-center space-y-2 ${
            isEnergized ? 'border-amber-400 bg-amber-500/10' : 'border-slate-800 bg-slate-900/60'
          }`}>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
              Nível Lógico 5V
            </span>
            <h3 className="font-bold text-sm text-white">Arduino Uno</h3>
            <p className="text-[11px] text-slate-400">Pino D7 = {isEnergized ? 'HIGH (Sinal Ativo)' : 'LOW (Em espera)'}</p>
            <div className={`w-3 h-3 rounded-full mx-auto transition-all ${
              isEnergized ? 'bg-amber-400 lamp-glow-yellow' : 'bg-slate-700'
            }`} />
          </div>

          {/* Estágio 2: Módulo Relé 1 Canal (Isolação Galvânica) */}
          <div className={`p-4 rounded-xl border-2 transition-all duration-500 text-center space-y-2 ${
            isEnergized ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-800 bg-slate-900/60'
          }`}>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
              Isolação Óptica
            </span>
            <h3 className="font-bold text-sm text-white">Módulo Relé</h3>
            <p className="text-[11px] text-slate-400">
              {isEnergized ? 'Contatos COM e NO FECHADOS' : 'Contatos COM e NO ABERTOS'}
            </p>
            <div className="font-mono text-[10px] text-cyan-300 bg-slate-950/80 p-1 rounded border border-cyan-500/30">
              {isEnergized ? 'COM ➔ NO (Conduzindo 24V)' : 'COM | / NO (Isolado)'}
            </div>
          </div>

          {/* Estágio 3: Contator K1 (Comando 24V) */}
          <div className={`p-4 rounded-xl border-2 transition-all duration-500 text-center space-y-2 ${
            isEnergized ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/60'
          }`}>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
              Comando 24VDC
            </span>
            <h3 className="font-bold text-sm text-white">Contator K1</h3>
            <p className="text-[11px] text-slate-400">
              Bobina A1/A2: {isEnergized ? 'MAGNETIZADA (Atracada)' : 'DESENERGIZADA'}
            </p>
            <div className={`w-3 h-3 rounded-full mx-auto transition-all ${
              isEnergized ? 'bg-emerald-400 lamp-glow-green' : 'bg-slate-700'
            }`} />
          </div>

          {/* Estágio 4: Motor Trifásico (220VAC) */}
          <div className={`p-4 rounded-xl border-2 transition-all duration-500 text-center space-y-2 ${
            isEnergized ? 'border-amber-400 bg-amber-500/10' : 'border-slate-800 bg-slate-900/60'
          }`}>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
              Força 220V 3~
            </span>
            <h3 className="font-bold text-sm text-white">Motor Trifásico</h3>
            <p className="text-[11px] text-slate-400">
              {isEnergized ? 'Em Rotação Nominal' : 'Eixo Parado'}
            </p>
            <div className={`text-xl transition-transform ${isEnergized ? 'animate-motor-running inline-block' : 'opacity-40'}`}>
              ⚙️
            </div>
          </div>
        </div>
      </div>

      {/* Explicação Didática da Etapa */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Info className="w-4 h-4" />
          <span>Princípio de Funcionamento da Isolação Galvânica:</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          O microcontrolador opera em baixa tensão contínua (5V TTL). Caso ocorresse um curto-circuito na rede trifásica de 220V ou um surto de 24V, a tensão poderia queimar o Arduino e o computador do professor. O <strong>módulo relé com optoacoplador</strong> garante que a corrente elétrica de comando nunca entre em contato físico com a eletrônica digital: o sinal é transmitido internamente por <strong>luz infravermelha</strong> e os contatos do relé operam como uma chave mecânica isolada.
        </p>
      </div>
    </div>
  );
}
