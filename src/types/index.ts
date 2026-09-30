export type MotorState = 'ON' | 'OFF';
export type EmergencyState = 'ACTIVE' | 'CLEAR';
export type BancadaAction = 'START' | 'STOP' | 'EMERGENCY' | 'RESET_EMERGENCY';

export interface BancadaTelemetry {
  id: string; // ex: '1', '2', '3'
  name: string; // ex: 'Bancada 01'
  motorState: MotorState;
  emergencyState: EmergencyState;
  lastCommandBy?: string; // ex: 'Aluno (Celular)' ou 'Professor (Painel)'
  lastCommandAt?: number; // timestamp
  lastCommandAction?: BancadaAction;
  targetMotorState?: MotorState;
  targetEmergencyState?: EmergencyState;
  arduinoConnected: boolean;
  studentConnected: boolean;
  activeRelayPin: number;
  uptimeSeconds: number;
}

export interface DidacticModule {
  id: string;
  title: string;
  category: 'componentes' | 'circuitos' | 'seguranca';
  summary: string;
  readTime: string;
  content: string;
  highlights: string[];
}
