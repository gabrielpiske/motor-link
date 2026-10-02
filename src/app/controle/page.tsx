'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Power, 
  OctagonAlert, 
  RotateCw, 
  ShieldAlert, 
  Smartphone,
  Info,
  Layers,
  ChevronDown,
  Activity,
  GraduationCap,
  ExternalLink
} from 'lucide-react';
import { subscribeToBancada, sendCommandToBancada } from '@/lib/firebase';
import type { MotorState, EmergencyState } from '@/types';

function ControleContent() {
  const searchParams = useSearchParams();
  const initialBancada = searchParams.get('bancada') || '1';

  const [bancadaId, setBancadaId] = useState<string>(initialBancada);
  const [motorState, setMotorState] = useState<MotorState>('OFF');
  const [emergencyState, setEmergencyState] = useState<EmergencyState>('CLEAR');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [lastActionTime, setLastActionTime] = useState<string>('Aguardando acionamento');
  const [showBancadaSelector, setShowBancadaSelector] = useState(false);

  // Atualiza bancadaId se o parâmetro de busca da URL mudar (via QR Code)
  useEffect(() => {
    const param = searchParams.get('bancada');
    if (param) {
      setBancadaId(param);
    }
  }, [searchParams]);

  // Escuta os estados exclusivos desta bancada no Firebase e localmente
  useEffect(() => {
    const unsubscribe = subscribeToBancada(bancadaId, (data) => {
      if (data.motorState) setMotorState(data.motorState);
      if (data.emergencyState) setEmergencyState(data.emergencyState);
      if (data.lastCommandAt) {
        setLastActionTime(new Date(data.lastCommandAt).toLocaleTimeString());
      }
    });

    return () => {
      unsubscribe();
    };
  }, [bancadaId]);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  const handleStart = async () => {
    if (emergencyState === 'ACTIVE') {
      showFeedback('ERRO: Emergência acionada na bancada! Destrave o botão de emergência antes de religar.');
      return;
    }

    setMotorState('ON');
    setLastActionTime(new Date().toLocaleTimeString());
    await sendCommandToBancada(bancadaId, 'ON', 'CLEAR', `Celular (Bancada ${bancadaId})`, 'START');
    showFeedback(`Comando enviado para BANCADA ${bancadaId}: Relé acionado ➔ Contator ➔ Motor 220V`);
  };

  const handleStop = async () => {
    setMotorState('OFF');
    setLastActionTime(new Date().toLocaleTimeString());
    await sendCommandToBancada(bancadaId, 'OFF', emergencyState, `Celular (Bancada ${bancadaId})`, 'STOP');
    showFeedback(`Comando enviado para BANCADA ${bancadaId}: Motor desligado.`);
  };

  const handleEmergency = async () => {
    setEmergencyState('ACTIVE');
    setMotorState('OFF');
    setLastActionTime(new Date().toLocaleTimeString());
    await sendCommandToBancada(bancadaId, 'OFF', 'ACTIVE', `Celular (Bancada ${bancadaId})`, 'EMERGENCY');
    showFeedback(`EMERGÊNCIA ACIONADA NA BANCADA ${bancadaId}! Circuito interrompido.`);
  };

  const handleResetEmergency = async () => {
    setEmergencyState('CLEAR');
    setLastActionTime(new Date().toLocaleTimeString());
    await sendCommandToBancada(bancadaId, 'OFF', 'CLEAR', `Celular (Bancada ${bancadaId})`, 'RESET_EMERGENCY');
    showFeedback(`Emergência destravada na Bancada ${bancadaId}. Sistema pronto.`);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Barra de Identificação da Bancada */}
      <div className="flex items-center justify-between border-b border-blue-200/80 dark:border-blue-900/60 pb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-[#005caa] dark:text-emerald-400" />
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-1.5">
              <span>IHM Mobile</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-black uppercase tracking-wider bg-[#005caa] text-white">
                SENAI
              </span>
            </h1>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block -mt-0.5">Eletrônica de Potência</span>
          </div>
        </div>

        {/* Badge da Bancada Ativa (com seletor) */}
        <button
          onClick={() => setShowBancadaSelector(!showBancadaSelector)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 hover:border-[#005caa] text-[#005caa] dark:bg-blue-950/70 dark:border-blue-800/80 dark:text-sky-300 text-xs font-black shadow-sm transition-all"
        >
          <span>BANCADA {bancadaId.padStart(2, '0')}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Seletor Rápido de Bancada (Expansível) */}
      {showBancadaSelector && (
        <div className="p-4 rounded-2xl bg-white border border-blue-200 dark:bg-[#0c1836] dark:border-blue-800/60 space-y-2 shadow-lg animate-in fade-in">
          <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Escolha a sua Bancada (1 a 12):</span>
          <div className="grid grid-cols-4 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((id) => (
              <button
                key={id}
                onClick={() => {
                  setBancadaId(id);
                  setShowBancadaSelector(false);
                  showFeedback(`Conectado à Bancada ${id}`);
                }}
                className={`py-2 rounded-lg font-bold text-xs transition-all ${
                  bancadaId === id
                    ? 'bg-[#005caa] text-white font-black shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#005caa] dark:bg-blue-950/50 dark:text-slate-300 dark:hover:bg-blue-900/60'
                }`}
              >
                Bancada {id}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Painel do Motor e Sinalizadores Visuais */}
      <div className="p-6 rounded-3xl bg-white border border-blue-200/90 shadow-md dark:bg-[#0c1836] dark:border-blue-900/60 dark:shadow-2xl space-y-6 transition-colors duration-200">
        {/* Sinalizadores Industriais */}
        <div className="flex items-center justify-around py-2 border-b border-blue-100 dark:border-blue-900/60">
          {/* Verde */}
          <div className="flex flex-col items-center gap-1.5">
            <div 
              className={`w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                motorState === 'ON'
                  ? 'bg-emerald-500 border-emerald-300 lamp-glow-green'
                  : 'bg-emerald-100 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-900/80'
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ligado (H1)</span>
          </div>

          {/* Vermelho */}
          <div className="flex flex-col items-center gap-1.5">
            <div 
              className={`w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                motorState === 'OFF' && emergencyState !== 'ACTIVE'
                  ? 'bg-rose-500 border-rose-300 lamp-glow-red'
                  : 'bg-rose-100 border-rose-300 dark:bg-rose-950/60 dark:border-rose-900/80'
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Parado (H2)</span>
          </div>

          {/* Amarelo */}
          <div className="flex flex-col items-center gap-1.5">
            <div 
              className={`w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                emergencyState === 'ACTIVE'
                  ? 'bg-amber-400 border-yellow-200 lamp-glow-yellow animate-pulse'
                  : 'bg-amber-100 border-amber-300 dark:bg-amber-950/60 dark:border-amber-900/80'
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Alerta (H3)</span>
          </div>
        </div>

        {/* Representação Visual do Motor Trifásico */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-700 ${
              motorState === 'ON' ? 'border-[#005caa] dark:border-sky-400 animate-spin' : 'border-slate-300 dark:border-blue-900/50'
            }`} />

            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-100 to-blue-50 border-2 border-blue-200 dark:from-slate-800 dark:to-slate-700 dark:border-slate-600 flex items-center justify-center shadow-lg transition-transform ${
              motorState === 'ON' ? 'animate-motor-running' : ''
            }`}>
              <RotateCw className={`w-10 h-10 ${motorState === 'ON' ? 'text-[#005caa] dark:text-sky-300' : 'text-slate-400 dark:text-slate-500'}`} />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
              Motor Trifásico — Bancada {bancadaId}
            </h2>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {motorState === 'ON' ? 'Acionado via K1 (220VAC Trifásico)' : 'Em Espera / Seguro'}
            </p>
          </div>
        </div>

        {/* Botoeira de Comando */}
        <div className="space-y-3 pt-2">
          {/* Botão de Partida */}
          <button
            onClick={handleStart}
            disabled={emergencyState === 'ACTIVE' || motorState === 'ON'}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg transition-all duration-200 active:scale-[0.98] ${
              emergencyState === 'ACTIVE' || motorState === 'ON'
                ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 border-b-4 border-emerald-800 active:border-b-0'
            }`}
          >
            <Power className="w-5 h-5" />
            <span>Partida (Liga Motor {bancadaId})</span>
          </button>

          {/* Botão de Parada */}
          <button
            onClick={handleStop}
            disabled={motorState === 'OFF'}
            className={`w-full py-3 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98] ${
              motorState === 'OFF'
                ? 'bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-800 cursor-not-allowed'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-rose-400 dark:border-slate-700 shadow-sm'
            }`}
          >
            <span>Parar Motor</span>
          </button>

          {/* Botão Cogumelo de Emergência */}
          <div className="pt-2">
            {emergencyState === 'CLEAR' ? (
              <button
                onClick={handleEmergency}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-red-600/30 border-4 border-red-950 active:scale-95 transition-all"
              >
                <OctagonAlert className="w-6 h-6 animate-pulse" />
                <span>Parada de Emergência</span>
              </button>
            ) : (
              <button
                onClick={handleResetEmergency}
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-500/60 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <span>Girar e Destravar Emergência</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mensagem de Feedback */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 dark:bg-blue-950/70 dark:border-blue-800/80 dark:text-blue-100 text-xs flex items-start gap-2.5 animate-in fade-in">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#005caa] dark:text-sky-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Telemetria de Tensão */}
      <div className="p-4 rounded-2xl bg-white border border-blue-200/90 shadow-sm dark:bg-[#0a1532]/70 dark:border-blue-900/50 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-[#005caa] dark:text-cyan-400" />
          <span>Níveis de Tensão (Bancada {bancadaId})</span>
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-blue-50/70 dark:bg-slate-950 border border-blue-100 dark:border-slate-800">
            <span className="block text-[10px] text-slate-500">Arduino Uno</span>
            <span className="font-mono font-bold text-[#005caa] dark:text-amber-400">5V TTL</span>
          </div>
          <div className="p-2 rounded-lg bg-blue-50/70 dark:bg-slate-950 border border-blue-100 dark:border-slate-800">
            <span className="block text-[10px] text-slate-500">Relé / Painel</span>
            <span className="font-mono font-bold text-sky-600 dark:text-cyan-400">24V DC</span>
          </div>
          <div className="p-2 rounded-lg bg-blue-50/70 dark:bg-slate-950 border border-blue-100 dark:border-slate-800">
            <span className="block text-[10px] text-slate-500">Motor Trifásico</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">220V 3~</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
          Último comando registrado: <span className="text-slate-700 dark:text-slate-300 font-mono font-semibold">{lastActionTime}</span>
        </p>

        {/* Rodapé do Mobile com Link para Gabriel Piske */}
        <div className="pt-2 border-t border-slate-100 dark:border-blue-900/50 text-center">
          <a
            href="https://piske.online"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-[#005caa] dark:text-sky-300 font-medium hover:underline"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Docente Gabriel Piske • piske.online</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ControlePage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-mono">
        Carregando IHM da Bancada...
      </div>
    }>
      <ControleContent />
    </Suspense>
  );
}
