'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Usb, 
  Terminal, 
  Wifi, 
  Power, 
  OctagonAlert, 
  AlertTriangle,
  QrCode,
  Layers,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import QRCode from 'qrcode';
import { webSerial } from '@/lib/webserial';
import { sendCommand, updatePanelState, subscribeToPanelCommand } from '@/hooks/useMotorControl';
import type { MotorState, EmergencyState } from '@/types';
import type { PanelCommand } from '@/lib/firebase-v2';
import { RouteGuard } from '@/components/RouteGuard';

export default function BancadaPage() {
  const [bancadaId, setBancadaId] = useState<string>('1');
  const [isConnected, setIsConnected] = useState(false);
  const [portInfo, setPortInfo] = useState<string>('Aguardando porta USB');
  const [logs, setLogs] = useState<{ time: string; text: string; type: 'in' | 'out' | 'info' | 'err' }[]>([]);
  const [motorState, setMotorState] = useState<MotorState>('OFF');
  const [emergencyState, setEmergencyState] = useState<EmergencyState>('CLEAR');
  const [browserSupported, setBrowserSupported] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [controlUrl, setControlUrl] = useState<string>('');

  // Controle de comandos processados para evitar loops de repetição
  const lastProcessedCommandId = useRef<string | null>(null);
  const emergencyStateRef = useRef<EmergencyState>(emergencyState);
  const isConnectedRef = useRef<boolean>(isConnected);

  useEffect(() => {
    emergencyStateRef.current = emergencyState;
  }, [emergencyState]);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  // Atualiza a URL e gera o QR Code sempre que o bancadaId mudar
  useEffect(() => {
    setBrowserSupported(webSerial.isSupported());
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/controle?bancada=${bancadaId}`;
      setControlUrl(url);

      QRCode.toDataURL(url, {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((dataUrl) => setQrCodeDataUrl(dataUrl))
        .catch((err) => console.error('Erro ao gerar QR Code:', err));
    }
  }, [bancadaId]);

  // Escuta os comandos vindos do celular do aluno para esta bancada
  useEffect(() => {
    addLog(`[SISTEMA] Monitorando comandos para a BANCADA ${bancadaId}`, 'info');
    // Reinicia o tracking de comando para a bancada atual
    lastProcessedCommandId.current = null;

    const unsubscribe = subscribeToPanelCommand(bancadaId, async (cmd: PanelCommand | null) => {
      // Ignora atualizações que não sejam comandos novos (ex: telemetria, status, leituras antigas)
      if (!cmd || !cmd.commandId || cmd.commandId === lastProcessedCommandId.current) {
        return;
      }

      // Registra que este comando foi atendido para cortar qualquer loop
      lastProcessedCommandId.current = cmd.commandId;

      const sender = cmd.sender || 'Celular';
      const action = cmd.action;

      // 1. Comando de Emergência
      if (action === 'EMERGENCY' || cmd.emergencyState === 'ACTIVE') {
        setEmergencyState('ACTIVE');
        setMotorState('OFF');
        await sendSerialCommand('CMD:EMERGENCY');
        addLog(`[${sender}] PARADA DE EMERGÊNCIA acionada na Bancada ${bancadaId}!`, 'err');
        return;
      }

      // 2. Destravamento de Emergência
      if (action === 'RESET_EMERGENCY') {
        setEmergencyState('CLEAR');
        await sendSerialCommand('CMD:RESET_EMERGENCY');
        addLog(`[${sender}] Destravamento de emergência solicitado.`, 'info');
        return;
      }

      // 3. Comando de Partida (Ligar)
      const targetMotor = cmd.motorState;
      if (action === 'START' || targetMotor === 'ON') {
        if (emergencyStateRef.current === 'ACTIVE') {
          addLog(`[BLOQUEIO] Partida rejeitada: Emergência ATIVA na Bancada ${bancadaId}! Destrave o botão de segurança.`, 'err');
          return;
        }
        setMotorState('ON');
        await sendSerialCommand('CMD:MOTOR:ON');
        addLog(`[${sender}] Partida do motor solicitada!`, 'in');
        return;
      }

      // 4. Comando de Parada (Desligar)
      if (action === 'STOP' || targetMotor === 'OFF') {
        setMotorState('OFF');
        await sendSerialCommand('CMD:MOTOR:OFF');
        addLog(`[${sender}] Parada do motor solicitada!`, 'in');
        return;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [bancadaId]);

  const addLog = (text: string, type: 'in' | 'out' | 'info' | 'err' = 'info') => {
    setLogs((prev) => [
      ...prev.slice(-35),
      {
        time: new Date().toLocaleTimeString(),
        text,
        type,
      },
    ]);
  };

  const handleConnect = async () => {
    addLog(`Iniciando conexão USB com o Arduino da Bancada ${bancadaId}...`, 'info');

    const ok = await webSerial.connect(115200, {
      onConnected: (info) => {
        setIsConnected(true);
        setPortInfo(info);
        addLog(`Arduino Uno da Bancada ${bancadaId} conectado! (${info})`, 'info');
        webSerial.sendCommand('CMD:STATUS');
        updatePanelState(bancadaId, {
          arduinoConnected: true,
          motorState,
          emergencyState,
        });
      },
      onDisconnected: () => {
        setIsConnected(false);
        setPortInfo('Desconectado');
        addLog(`Arduino Uno da Bancada ${bancadaId} desconectado.`, 'err');
        updatePanelState(bancadaId, { arduinoConnected: false });
      },
      onLineReceived: (line) => {
        addLog(`ARDUINO ➔ ${line}`, 'in');

        if (line.includes('STATUS:MOTOR=ON')) {
          setMotorState('ON');
          updatePanelState(bancadaId, { motorState: 'ON' });
        } else if (line.includes('STATUS:MOTOR=OFF')) {
          setMotorState('OFF');
          updatePanelState(bancadaId, { motorState: 'OFF' });
        }

        if (line.includes('ALERT:EMERGENCY_ACTIVATED') || line.includes('EMERGENCY=ACTIVE')) {
          setEmergencyState('ACTIVE');
          setMotorState('OFF');
          updatePanelState(bancadaId, { motorState: 'OFF', emergencyState: 'ACTIVE' });
        } else if (line.includes('INFO:EMERGENCY_RESET') || line.includes('EMERGENCY=CLEAR')) {
          setEmergencyState('CLEAR');
          updatePanelState(bancadaId, { emergencyState: 'CLEAR' });
        }
      },
      onError: (err) => {
        addLog(`Erro Serial: ${err}`, 'err');
      },
    });

    if (!ok) {
      addLog('Falha ao selecionar porta serial.', 'err');
    }
  };

  const handleDisconnect = async () => {
    await webSerial.disconnect();
    setIsConnected(false);
  };

  const sendSerialCommand = async (cmd: string) => {
    addLog(`PC ➔ ARDUINO: ${cmd}`, 'out');
    if (isConnectedRef.current) {
      await webSerial.sendCommand(cmd);
    } else {
      addLog(`(Aviso: Arduino físico não conectado. Simulando comando localmente)`, 'info');
      if (cmd === 'CMD:MOTOR:ON') {
        setMotorState('ON');
        updatePanelState(bancadaId, { motorState: 'ON' });
      }
      if (cmd === 'CMD:MOTOR:OFF') {
        setMotorState('OFF');
        updatePanelState(bancadaId, { motorState: 'OFF' });
      }
      if (cmd === 'CMD:EMERGENCY') {
        setEmergencyState('ACTIVE');
        setMotorState('OFF');
        updatePanelState(bancadaId, { motorState: 'OFF', emergencyState: 'ACTIVE' });
      }
      if (cmd === 'CMD:RESET_EMERGENCY') {
        setEmergencyState('CLEAR');
        updatePanelState(bancadaId, { emergencyState: 'CLEAR' });
      }
    }
  };

  return (
    <RouteGuard requiredRole="admin">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Topo: Seleção da Bancada e Conexão USB */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Painel do Computador — Bancada de Ensaio
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cada aluno conecta o seu Arduino Uno nesta tela e aponta a câmera do celular para o QR Code abaixo.
            </p>

            {/* Selecionador de Bancada (1 a 12) */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs font-bold text-slate-300">Número da Bancada:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((num) => (
                  <button
                    key={num}
                    onClick={() => setBancadaId(num)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold text-xs transition-all ${
                      bancadaId === num
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 scale-105'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botão de Conexão Serial */}
          <div>
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={!browserSupported}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Usb className="w-5 h-5" />
                <span>Conectar Arduino (Bancada {bancadaId})</span>
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600/30 text-rose-300 font-bold text-xs transition-all"
              >
                <Power className="w-4 h-4" />
                <span>Desconectar Arduino (Bancada {bancadaId})</span>
              </button>
            )}
          </div>
        </div>

        {/* Grid: QR Code de Pareamento vs. Status da Bancada */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Card do QR Code para o Aluno (Foco Principal de Praticidade) */}
          <div className="md:col-span-5 p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider">
              <QrCode className="w-4 h-4" />
              <span>Pareamento do Celular</span>
            </div>

            <h2 className="text-lg font-bold text-white">
              BANCADA {bancadaId.padStart(2, '0')}
            </h2>

            <p className="text-xs text-slate-400 max-w-xs">
              Abra a câmera do seu celular e aponte para o QR Code abaixo para controlar este motor:
            </p>

            {/* QR Code Renderizado */}
            <div className="p-3 bg-white rounded-2xl shadow-xl">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Code Bancada ${bancadaId}`}
                  className="w-52 h-52 object-contain"
                />
              ) : (
                <div className="w-52 h-52 bg-slate-200 animate-pulse rounded-xl" />
              )}
            </div>

            {/* Link Alternativo / Código Curto */}
            <div className="w-full pt-2">
              <span className="block text-[11px] text-slate-500 mb-1">Ou acesse direto no celular:</span>
              <a
                href={controlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 underline"
              >
                <span>{controlUrl}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card de Status, Intertravamento e Teste Manual */}
          <div className="md:col-span-7 space-y-6 flex flex-col justify-between">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Status Operacional — Bancada {bancadaId}</span>
              </h2>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-500">Comunicação USB</span>
                  <div className={`font-bold flex items-center gap-1.5 ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                    <span>{isConnected ? 'Arduino Conectado' : 'Aguardando Cabo USB'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-500">Estado do Motor 220V</span>
                  <div className={`font-mono font-bold ${motorState === 'ON' ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {motorState === 'ON' ? 'LIGADO (Relé 24V Ativo)' : 'DESLIGADO (Seguro)'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-500">Segurança / NR-12</span>
                  <div className={`font-mono font-bold ${emergencyState === 'ACTIVE' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {emergencyState === 'ACTIVE' ? 'EMERGÊNCIA ACIONADA' : 'NORMAL (Liberado)'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-500">Porta Serial Aberta</span>
                  <div className="font-mono text-slate-300 truncate">
                    {portInfo}
                  </div>
                </div>
              </div>

              {/* Teste Manual pelo Computador */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="block text-[11px] font-bold text-slate-400 mb-2">Comandos Locais (Teste na Bancada):</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => sendSerialCommand('CMD:MOTOR:ON')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Testar Liga Motor
                  </button>
                  <button
                    onClick={() => sendSerialCommand('CMD:MOTOR:OFF')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                  >
                    Testar Desliga Motor
                  </button>
                  <button
                    onClick={() => sendSerialCommand('CMD:EMERGENCY')}
                    className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <OctagonAlert className="w-4 h-4" />
                    <span>Emergência</span>
                  </button>
                  {emergencyState === 'ACTIVE' && (
                    <button
                      onClick={() => sendSerialCommand('CMD:RESET_EMERGENCY')}
                      className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <span>Destravar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Console Serial da Bancada */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>Console Serial (Bancada {bancadaId})</span>
                </div>
                <button
                  onClick={() => setLogs([])}
                  className="text-[11px] text-slate-500 hover:text-slate-300"
                >
                  Limpar
                </button>
              </div>

              <div className="h-40 overflow-y-auto rounded-xl bg-slate-950 p-2.5 font-mono text-xs space-y-1 border border-slate-800/80">
                {logs.length === 0 ? (
                  <div className="text-slate-600 italic">Aguardando eventos da Bancada {bancadaId}...</div>
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
        </div>
      </div>
    </RouteGuard>
  );
}
