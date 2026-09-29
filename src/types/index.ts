export type MotorState = 'ON' | 'OFF';
export type EmergencyState = 'ACTIVE' | 'CLEAR';

export interface BancadaTelemetry {
  motorState: MotorState;
  emergencyState: EmergencyState;
  lastCommandBy: string; // ex: 'Aluno (Celular)' ou 'Professor (Painel)'
  lastCommandAt: number; // timestamp
  arduinoConnected: boolean;
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
