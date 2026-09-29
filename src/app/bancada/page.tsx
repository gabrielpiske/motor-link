'use client';

import { useState, useEffect } from 'react';
import { 
  Cpu, 
  Usb, 
  Terminal, 
  Wifi, 
  Power, 
  OctagonAlert, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  QrCode,
  Share2
} from 'lucide-react';
import { webSerial } from '@/lib/webserial';
import type { MotorState, EmergencyState } from '@/types';

export default function BancadaPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [portInfo, setPortInfo] = useState<string>('Nenhuma porta conectada');
  const [logs, setLogs] = useState<{ time: string; text: string; type: 'in' | 'out' | 'info' | 'err' }[]>([]);
  const [motorState, setMotorState] = useState<MotorState>('OFF');
  const [emergencyState, setEmergencyState] = useState<EmergencyState>('CLEAR');
  const [browserSupported, setBrowserSupported] = useState(true);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    setBrowserSupported(webSerial.isSupported());
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/controle`);
    }

    // Ouvinte para comandos vindos da IHM do Aluno via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('motor-link-sync');
      channel.onmessage = async (event) => {
        const { type, payload } = event.data;
        if (type === 'COMMAND') {
          addLog(`[REDE] Comando recebido de ${payload.sender}: Motor=${payload.motorState}, Emergência=${payload.emergencyState}`, 'info');
          
          if (payload.emergencyState === 'ACTIVE') {
            await sendSerialCommand('CMD:EMERGENCY');
            setEmergencyState('ACTIVE');
            setMotorState('OFF');
          } else if (payload.motorState === 'ON') {
            await sendSerialCommand('CMD:MOTOR:ON');
            setMotorState('ON');
          } else if (payload.motorState === 'OFF') {
            await sendSerialCommand('CMD:MOTOR:OFF');
            setMotorState('OFF');
          }
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel não disponível.', e);
    }

    return () => {
      channel?.close();
    };
  }, []);

  const addLog = (text: string, type: 'in' | 'out' | 'info' | 'err' = 'info') => {
    setLogs((prev) => [
      ...prev.slice(-40),
      {
        time: new Date().toLocaleTimeString(),
        text,
        type,
      },
    ]);
  };

  const handleConnect = async () => {
    addLog('Iniciando solicitação de porta serial ao usuário...', 'info');

    const ok = await webSerial.connect(115200, {
      onConnected: (info) => {
        setIsConnected(true);
        setPortInfo(info);
        addLog(`Porta serial conectada com sucesso (${info})`, 'info');
        webSerial.sendCommand('CMD:STATUS');
      },
      onDisconnected: () => {
        setIsConnected(false);
        setPortInfo('Desconectado');
        addLog('Porta serial desconectada.', 'err');
      },
      onLineReceived: (line) => {
        addLog(`ARDUINO ➔ ${line}`, 'in');

        // Parse de respostas do Arduino
        if (line.includes('STATUS:MOTOR=ON')) {
          setMotorState('ON');
          broadcastCurrentState('ON', emergencyState);
        } else if (line.includes('STATUS:MOTOR=OFF')) {
          setMotorState('OFF');
          broadcastCurrentState('OFF', emergencyState);
        } else if (line.includes('ALERT:EMERGENCY_ACTIVATED')) {
          setEmergencyState('ACTIVE');
          setMotorState('OFF');
          broadcastCurrentState('OFF', 'ACTIVE');
        } else if (line.includes('INFO:EMERGENCY_RESET')) {
          setEmergencyState('CLEAR');
          broadcastCurrentState(motorState, 'CLEAR');
        }
      },
      onError: (err) => {
        addLog(`Erro Serial: ${err}`, 'err');
      },
    });

    if (!ok) {
      addLog('Falha ao conectar com o dispositivo serial.', 'err');
    }
  };

  const handleDisconnect = async () => {
    await webSerial.disconnect();
    setIsConnected(false);
  };

  const sendSerialCommand = async (cmd: string) => {
    addLog(`PC ➔ ARDUINO: ${cmd}`, 'out');
    if (isConnected) {
      await webSerial.sendCommand(cmd);
    } else {
      addLog('Aviso: Arduino não está conectado via USB. Comando simulado localmente.', 'info');
      if (cmd === 'CMD:MOTOR:ON') setMotorState('ON');
      if (cmd === 'CMD:MOTOR:OFF') setMotorState('OFF');
      if (cmd === 'CMD:EMERGENCY') {
        setEmergencyState('ACTIVE');
        setMotorState('OFF');
      }
      if (cmd === 'CMD:RESET_EMERGENCY') setEmergencyState('CLEAR');
    }
  };

  const broadcastCurrentState = (m: MotorState, e: EmergencyState) => {
    try {
      const channel = new BroadcastChannel('motor-link-sync');
      channel.postMessage({
        type: 'STATE_UPDATE',
        payload: {
          motorState: m,
          emergencyState: e,
          timestamp: Date.now(),
        },
      });
      channel.close();
    } catch (err) {}
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">Bancada do Instrutor & Gateway Serial</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Conecte o Arduino Uno via USB diretamente no navegador Google Chrome/Edge para sincronizar com os celulares dos alunos.
          </p>
        </div>

        {/* Botão de Conectar Serial */}
        <div>
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={!browserSupported}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Usb className="w-4 h-4" />
              <span>Conectar Arduino Uno (USB)</span>
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600/30 text-rose-300 font-bold text-xs transition-all"
            >
              <Power className="w-4 h-4" />
              <span>Desconectar Porta ({portInfo})</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerta de Navegador caso não suporte Web Serial */}
      {!browserSupported && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>
            Atenção: A Web Serial API requer <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong> no computador para acesso à porta COM USB sem instalação de softwares.
          </span>
        </div>
      )}

      {/* Grid de Estado & Compartilhamento com os Alunos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status de Comunicação */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span>Status da Bancada</span>
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Arduino Uno USB</span>
              <span className={`font-bold flex items-center gap-1 ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                {isConnected ? 'Conectado' : 'Aguardando'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Estado do Motor</span>
              <span className={`font-mono font-bold ${motorState === 'ON' ? 'text-emerald-400' : 'text-slate-400'}`}>
                {motorState === 'ON' ? 'LIGADO (24V/220V)' : 'DESLIGADO'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Intertravamento</span>
              <span className={`font-mono font-bold ${emergencyState === 'ACTIVE' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {emergencyState === 'ACTIVE' ? 'EMERGÊNCIA ATIVA' : 'NORMAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Compartilhamento para os Alunos */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>Link para os Alunos</span>
          </h2>
          <p className="text-xs text-slate-400">
            Projete este link ou passe para os alunos abrirem no celular no laboratório:
          </p>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
            {shareUrl || '/controle'}
          </div>
        </div>

        {/* Painel de Override do Professor */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Power className="w-4 h-4 text-amber-400" />
            <span>Controle Manual (Professor)</span>
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => sendSerialCommand('CMD:MOTOR:ON')}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              Forçar Liga
            </button>
            <button
              onClick={() => sendSerialCommand('CMD:MOTOR:OFF')}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
            >
              Forçar Desliga
            </button>
            <button
              onClick={() => sendSerialCommand('CMD:EMERGENCY')}
              className="col-span-2 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <OctagonAlert className="w-4 h-4" />
              <span>Corte de Emergência</span>
            </button>
          </div>
        </div>
      </div>

      {/* Console Serial em Tempo Real */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Terminal Serial Bidirecional (115200 baud)</span>
          </div>
          <button
            onClick={() => setLogs([])}
            className="text-[11px] text-slate-500 hover:text-slate-300"
          >
            Limpar Console
          </button>
        </div>

        <div className="h-64 overflow-y-auto rounded-xl bg-slate-950 p-3 font-mono text-xs space-y-1 border border-slate-800/80">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">Aguardando eventos ou conexão serial...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-slate-600 select-none">[{log.time}]</span>
                <span
                  className={
                    log.type === 'in'
                      ? 'text-cyan-400'
                      : log.type === 'out'
                      ? 'text-emerald-400 font-semibold'
                      : log.type === 'err'
                      ? 'text-rose-400'
                      : 'text-amber-300'
                  }
                >
                  {log.text}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
