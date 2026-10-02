'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  OctagonAlert, 
  RotateCcw, 
  Cpu, 
  Activity, 
  Radio, 
  RotateCw, 
  Power, 
  Users,
  GraduationCap,
  ExternalLink
} from 'lucide-react';
import { subscribeToAllBancadas, emergencyStopAllBancadas, sendCommandToBancada } from '@/lib/firebase';
import type { BancadaTelemetry } from '@/types';

const TOTAL_BANCADAS = 12;

export default function SupervisorPage() {
  const [bancadas, setBancadas] = useState<Record<string, Partial<BancadaTelemetry>>>({});
  const [emergencyFeedback, setEmergencyFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAllBancadas((data) => {
      if (data) {
        setBancadas(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Calcula estatísticas gerais
  const activeMotorsCount = Object.values(bancadas).filter(b => b.motorState === 'ON').length;
  const emergenciesCount = Object.values(bancadas).filter(b => b.emergencyState === 'ACTIVE').length;
  const connectedArduinosCount = Object.values(bancadas).filter(b => b.arduinoConnected).length;

  const handleMasterEmergency = async () => {
    await emergencyStopAllBancadas(TOTAL_BANCADAS);
    setEmergencyFeedback('🚨 PARADA GERAL ACIONADA! Todas as 12 bancadas foram desenergizadas imediatamente.');
    setTimeout(() => setEmergencyFeedback(null), 6000);
  };

  const handleResetAll = async () => {
    for (let i = 1; i <= TOTAL_BANCADAS; i++) {
      await sendCommandToBancada(String(i), 'OFF', 'CLEAR', 'Supervisor (Liberação Geral)', 'RESET_EMERGENCY');
    }
    setEmergencyFeedback('Todas as bancadas foram resetadas e liberadas para aula.');
    setTimeout(() => setEmergencyFeedback(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header do Cockpit do Professor */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-200/80 dark:border-blue-900/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/90 border border-blue-200 text-[#005caa] dark:bg-blue-950/70 dark:border-blue-800/80 dark:text-sky-300 text-xs font-semibold mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#005caa] dark:text-sky-400" />
            <span>SENAI • Visão Geral do Laboratório (12 Bancadas)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Painel do Supervisor • Controle da Turma</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider bg-[#005caa] text-white">
              SENAI
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supervisão em tempo real de todos os 12 conjuntos de acionamento (Arduino Uno + Relé + Motor Trifásico).
          </p>

          {/* Menção ao Docente Gabriel Piske */}
          <div className="mt-2">
            <a
              href="https://piske.online"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#005caa] dark:text-sky-300 hover:underline font-medium"
            >
              <GraduationCap className="w-4 h-4 text-[#005caa] dark:text-sky-400" />
              <span>Concebido pelo <strong>Docente Gabriel Piske</strong> (piske.online) — Docente de Tecnologia e Eletrônica e Desenvolvedor de Ferramentas e Softwares Educacionais</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Botão Mestre de Emergência Geral da Sala */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-[#005caa] dark:text-cyan-400" />
            <span>Reset Geral</span>
          </button>

          <button
            onClick={handleMasterEmergency}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-2xl shadow-red-600/40 border-2 border-red-950 active:scale-95 transition-all"
          >
            <OctagonAlert className="w-5 h-5 animate-pulse" />
            <span>Corte Geral de Emergência (12 Bancadas)</span>
          </button>
        </div>
      </div>

      {/* Banner de Feedback de Emergência */}
      {emergencyFeedback && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 dark:bg-rose-500/20 dark:border-rose-500/60 dark:text-rose-200 font-bold text-xs flex items-center gap-3 animate-in fade-in">
          <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{emergencyFeedback}</span>
        </div>
      )}

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-blue-200/90 shadow-sm dark:bg-[#0a1532]/90 dark:border-blue-900/60 dark:shadow-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Bancadas</span>
          <div className="text-2xl font-black text-[#005caa] dark:text-sky-300 mt-1">12</div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Painéis no Laboratório</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-blue-200/90 shadow-sm dark:bg-[#0a1532]/90 dark:border-blue-900/60 dark:shadow-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Motores em Operação</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeMotorsCount}</div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Girando em 220V</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-blue-200/90 shadow-sm dark:bg-[#0a1532]/90 dark:border-blue-900/60 dark:shadow-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Emergências Ativas</span>
          <div className={`text-2xl font-black mt-1 ${emergenciesCount > 0 ? 'text-rose-600 dark:text-rose-500 animate-pulse' : 'text-slate-400 dark:text-slate-500'}`}>
            {emergenciesCount}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Bloqueios de segurança</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-blue-200/90 shadow-sm dark:bg-[#0a1532]/90 dark:border-blue-900/60 dark:shadow-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Bancadas Monitoradas</span>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">12 / 12</div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Sincronizadas via Nuvem</span>
        </div>
      </div>

      {/* Grid das 12 Bancadas de Ensaio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: TOTAL_BANCADAS }, (_, i) => String(i + 1)).map((id) => {
          const bancada = bancadas[id] || {};
          const isMotorOn = bancada.motorState === 'ON';
          const isEmerg = bancada.emergencyState === 'ACTIVE';

          return (
            <div
              key={id}
              className={`p-5 rounded-2xl border transition-all ${
                isEmerg
                  ? 'bg-rose-50/80 border-rose-300 shadow-md dark:bg-rose-950/20 dark:border-rose-500/60 dark:shadow-lg dark:shadow-rose-900/20'
                  : isMotorOn
                  ? 'bg-emerald-50/80 border-emerald-300 shadow-md dark:bg-emerald-950/20 dark:border-emerald-500/50 dark:shadow-lg dark:shadow-emerald-900/20'
                  : 'bg-white border-blue-200/80 shadow-sm hover:border-blue-400 dark:bg-[#0c1836] dark:border-blue-900/50 dark:hover:border-blue-700'
              }`}
            >
              {/* Topo do Card da Bancada */}
              <div className="flex items-center justify-between border-b border-blue-100 dark:border-blue-900/60 pb-3">
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  BANCADA {id.padStart(2, '0')}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isEmerg
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                    : isMotorOn
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-blue-950/60 dark:text-slate-400'
                }`}>
                  {isEmerg ? 'EMERGÊNCIA' : isMotorOn ? 'OPERANDO' : 'PARADO'}
                </span>
              </div>

              {/* Status Visual do Motor */}
              <div className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    isMotorOn
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-400'
                      : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-600'
                  }`}>
                    <RotateCw className={`w-5 h-5 ${isMotorOn ? 'animate-motor-running' : ''}`} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isMotorOn ? 'Motor Ligado' : 'Motor Parado'}
                    </span>
                    <span className="block text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {isMotorOn ? '220VAC / K1 Ativo' : 'Relé 24V Inativo'}
                    </span>
                  </div>
                </div>

                {/* Sinaleira Mini */}
                <div className={`w-3.5 h-3.5 rounded-full ${
                  isEmerg
                    ? 'bg-rose-500 lamp-glow-red animate-pulse'
                    : isMotorOn
                    ? 'bg-emerald-500 lamp-glow-green'
                    : 'bg-slate-300 dark:bg-slate-800'
                }`} />
              </div>

              {/* Botões de Ação do Instrutor na Bancada Específica */}
              <div className="pt-2 border-t border-blue-100 dark:border-blue-900/60 flex gap-1.5">
                <button
                  onClick={() => sendCommandToBancada(id, isMotorOn ? 'OFF' : 'ON', 'CLEAR', 'Professor', isMotorOn ? 'STOP' : 'START')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all shadow-sm ${
                    isMotorOn
                      ? 'bg-slate-100 hover:bg-slate-200 text-rose-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-rose-300'
                      : 'bg-[#005caa] hover:bg-[#004785] text-white'
                  }`}
                >
                  {isMotorOn ? 'Desligar' : 'Ligar'}
                </button>
                <button
                  onClick={() => sendCommandToBancada(id, 'OFF', 'ACTIVE', 'Professor (Emergência)', 'EMERGENCY')}
                  className="py-1.5 px-2.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 dark:bg-rose-600/20 dark:border-rose-500/40 dark:hover:bg-rose-600 dark:text-rose-300 dark:hover:text-white text-[10px] font-bold transition-all"
                  title="Parada de Emergência nesta bancada"
                >
                  Corte
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
