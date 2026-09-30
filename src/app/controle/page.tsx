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
  Activity
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
    await sendCommandToBancada(bancadaId, 'ON', 'CLEAR', `Celular (Bancada ${bancadaId})`);
    showFeedback(`Comando enviado para BANCADA ${bancadaId}: Relé acionado ➔ Contator ➔ Motor 220V`);
  };

  const handleStop = async () => {
    setMotorState('OFF');
    setLastActionTime(new Date().toLocaleTimeString());
    await sendCommandToBancada(bancadaId, 'OFF', emergencyState, `Celular (Bancada ${bancadaId})`);
    showFeedback(`Comando enviado para BANCADA ${bancadaId}: Motor desligado.`);
  };

  const handleEmergency = async () => {
    setEmergencyState('ACTIVE');
    setMotorState('OFF');
    setLastActionTime(new Date().toLocaleTimeString());
    await sendCommandToBancada(bancadaId, 'OFF', 'ACTIVE', `Celular (Bancada ${bancadaId})`);
    showFeedback(`EMERGÊNCIA ACIONADA NA BANCADA ${bancadaId}! Circuito interrompido.`);
  };

  const handleResetEmergency = async () => {
    setEmergencyState('CLEAR');
    setLastActionTime(new Date().toLocaleTimeString());
    await sendCommandToBancada(bancadaId, 'OFF', 'CLEAR', `Celular (Bancada ${bancadaId})`);
    showFeedback(`Emergência destravada na Bancada ${bancadaId}. Sistema pronto.`);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Barra de Identificação da Bancada */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">IHM Mobile</h1>
            <span className="text-[10px] text-slate-400 block -mt-0.5">Eletrônica de Potência</span>
          </div>
        </div>

        {/* Badge da Bancada Ativa (com seletor) */}
        <button
          onClick={() => setShowBancadaSelector(!showBancadaSelector)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black hover:bg-amber-500/30 transition-all"
        >
          <span>BANCADA {bancadaId.padStart(2, '0')}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Seletor Rápido de Bancada (Expansível) */}
      {showBancadaSelector && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-2 animate-in fade-in">
          <span className="block text-[11px] font-bold text-slate-300">Escolha a sua Bancada:</span>
          <div className="grid grid-cols-4 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8'].map((id) => (
              <button
                key={id}
                onClick={() => {
                  setBancadaId(id);
                  setShowBancadaSelector(false);
                  showFeedback(`Conectado à Bancada ${id}`);
                }}
                className={`py-2 rounded-lg font-bold text-xs transition-all ${
                  bancadaId === id
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Bancada {id}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Painel do Motor e Sinalizadores Visuais */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl space-y-6">
        {/* Sinalizadores Industriais */}
        <div className="flex items-center justify-around py-2 border-b border-slate-800/80">
          {/* Verde */}
          <div className="flex flex-col items-center gap-1.5">
            <div 
              className={`w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                motorState === 'ON'
                  ? 'bg-emerald-500 border-emerald-300 lamp-glow-green'
                  : 'bg-emerald-950/60 border-emerald-900/80'
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ligado (H1)</span>
          </div>

          {/* Vermelho */}
          <div className="flex flex-col items-center gap-1.5">
            <div 
              className={`w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                motorState === 'OFF' && emergencyState !== 'ACTIVE'
                  ? 'bg-rose-500 border-rose-300 lamp-glow-red'
                  : 'bg-rose-950/60 border-rose-900/80'
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parado (H2)</span>
          </div>

          {/* Amarelo */}
          <div className="flex flex-col items-center gap-1.5">
            <div 
              className={`w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                emergencyState === 'ACTIVE'
                  ? 'bg-amber-400 border-yellow-200 lamp-glow-yellow animate-pulse'
                  : 'bg-amber-950/60 border-amber-900/80'
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alerta (H3)</span>
          </div>
        </div>

        {/* Representação Visual do Motor Trifásico */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-700 ${
              motorState === 'ON' ? 'border-amber-400/80 animate-spin' : 'border-slate-800'
            }`} />

            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border-2 border-slate-600 flex items-center justify-center shadow-lg transition-transform ${
              motorState === 'ON' ? 'animate-motor-running' : ''
            }`}>
              <RotateCw className={`w-10 h-10 ${motorState === 'ON' ? 'text-amber-400' : 'text-slate-500'}`} />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-sm font-bold text-white tracking-wide">
              Motor Trifásico — Bancada {bancadaId}
            </h2>
            <p className="text-[11px] font-mono text-slate-400">
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
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
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
                ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 shadow-md'
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
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-500/60 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>Girar e Destravar Emergência</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mensagem de Feedback */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs flex items-start gap-2.5 animate-in fade-in">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Telemetria de Tensão */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Níveis de Tensão (Bancada {bancadaId})</span>
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="block text-[10px] text-slate-500">Arduino Uno</span>
            <span className="font-mono font-bold text-amber-400">5V TTL</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="block text-[10px] text-slate-500">Relé / Painel</span>
            <span className="font-mono font-bold text-cyan-400">24V DC</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="block text-[10px] text-slate-500">Motor Trifásico</span>
            <span className="font-mono font-bold text-emerald-400">220V 3~</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 text-center">
          Último comando registrado: <span className="text-slate-300 font-mono">{lastActionTime}</span>
        </p>
      </div>
    </div>
  );
}

export default function ControlePage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-400 text-xs font-mono">
        Carregando IHM da Bancada...
      </div>
    }>
      <ControleContent />
    </Suspense>
  );
}
