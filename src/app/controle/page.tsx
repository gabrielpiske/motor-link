'use client';

import { useState, useEffect } from 'react';
import { 
  Power, 
  OctagonAlert, 
  RotateCw, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  Volume2, 
  VolumeX,
  Smartphone,
  Info
} from 'lucide-react';
import type { MotorState, EmergencyState } from '@/types';

export default function ControlePage() {
  const [motorState, setMotorState] = useState<MotorState>('OFF');
  const [emergencyState, setEmergencyState] = useState<EmergencyState>('CLEAR');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [lastActionTime, setLastActionTime] = useState<string>('Aguardando comando');

  // Canal de sincronização local (permite testar em múltiplas abas ou sincronizar com /bancada)
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('motor-link-sync');
      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'STATE_UPDATE') {
          if (payload.motorState) setMotorState(payload.motorState);
          if (payload.emergencyState) setEmergencyState(payload.emergencyState);
          if (payload.timestamp) {
            setLastActionTime(new Date(payload.timestamp).toLocaleTimeString());
          }
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel não suportado neste navegador.', e);
    }

    return () => {
      channel?.close();
    };
  }, []);

  const broadcastState = (newMotor: MotorState, newEmerg: EmergencyState) => {
    try {
      const channel = new BroadcastChannel('motor-link-sync');
      channel.postMessage({
        type: 'COMMAND',
        payload: {
          motorState: newMotor,
          emergencyState: newEmerg,
          timestamp: Date.now(),
          sender: 'IHM Aluno (Celular)',
        },
      });
      channel.close();
    } catch (e) {
      // Ignora erro em navegadores que não suportam BroadcastChannel
    }
  };

  const handleStart = () => {
    if (emergencyState === 'ACTIVE') {
      showFeedback('ERRO: Emergência acionada! Gire e destrave o botão de emergência primeiro.');
      return;
    }
    setMotorState('ON');
    setLastActionTime(new Date().toLocaleTimeString());
    broadcastState('ON', 'CLEAR');
    showFeedback('Comando PARTIDA enviado: Relé acionado (24V ➔ Contator ➔ Motor 220V)');
  };

  const handleStop = () => {
    setMotorState('OFF');
    setLastActionTime(new Date().toLocaleTimeString());
    broadcastState('OFF', emergencyState);
    showFeedback('Comando PARADA enviado: Relé desenergizado.');
  };

  const handleEmergency = () => {
    setEmergencyState('ACTIVE');
    setMotorState('OFF');
    setLastActionTime(new Date().toLocaleTimeString());
    broadcastState('OFF', 'ACTIVE');
    showFeedback('EMERGÊNCIA ACIONADA: Circuito interrompido por segurança!');
  };

  const handleResetEmergency = () => {
    setEmergencyState('CLEAR');
    setLastActionTime(new Date().toLocaleTimeString());
    broadcastState('OFF', 'CLEAR');
    showFeedback('Emergência destravada. Sistema pronto para novo acionamento.');
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Header da IHM */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <h1 className="text-base font-bold text-white tracking-wide">IHM Didática Mobile</h1>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
          <span className={`w-2 h-2 rounded-full ${motorState === 'ON' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
          <span>{motorState === 'ON' ? 'OPERANDO' : 'PARADO'}</span>
        </div>
      </div>

      {/* Painel do Motor e Sinalizadores Visuais */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl space-y-6">
        {/* Sinalizadores Industriais (Lâmpadas Piloto) */}
        <div className="flex items-center justify-around py-2 border-b border-slate-800/80">
          {/* Sinaleira Verde (Ligado) */}
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

          {/* Sinaleira Vermelha (Desligado) */}
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

          {/* Sinaleira Amarela (Emergência / Falha) */}
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
            {/* Anel de Campo Magnético */}
            <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-700 ${
              motorState === 'ON' ? 'border-amber-400/80 animate-spin' : 'border-slate-800'
            }`} />

            {/* Eixo do Motor com Animação */}
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border-2 border-slate-600 flex items-center justify-center shadow-lg transition-transform ${
              motorState === 'ON' ? 'animate-motor-running' : ''
            }`}>
              <RotateCw className={`w-10 h-10 ${motorState === 'ON' ? 'text-amber-400' : 'text-slate-500'}`} />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-sm font-bold text-white tracking-wide">Motor Trifásico de Indução</h2>
            <p className="text-[11px] font-mono text-slate-400">
              {motorState === 'ON' ? 'Alimentado via K1 (220VAC Trifásico)' : 'Desenergizado / Seguro'}
            </p>
          </div>
        </div>

        {/* Botoeira Industrial */}
        <div className="space-y-3 pt-2">
          {/* Botão de Partida (Verde) */}
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
            <span>Partida (Liga Motor)</span>
          </button>

          {/* Botão de Parada (Preto/Vermelho) */}
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

          {/* Botão de Emergência (Cogumelo Industrial) */}
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

      {/* Notificação / Feedback de Comando */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs flex items-start gap-2.5 animate-in fade-in">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Telemetria Didática dos Níveis de Tensão */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Níveis de Tensão do Circuito</span>
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="block text-[10px] text-slate-500">Lógica Arduino</span>
            <span className="font-mono font-bold text-amber-400">5V TTL</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="block text-[10px] text-slate-500">Comando Painel</span>
            <span className="font-mono font-bold text-cyan-400">24V DC</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="block text-[10px] text-slate-500">Força Motor</span>
            <span className="font-mono font-bold text-emerald-400">220V 3~</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 text-center">
          Última alteração: <span className="text-slate-300 font-mono">{lastActionTime}</span>
        </p>
      </div>
    </div>
  );
}
