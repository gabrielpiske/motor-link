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

// === AUTH & RBAC ===
export type UserRole = 'admin' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  assignedPanel: number | null; // 1-12 para alunos, null para admin
  createdAt: number;
  updatedAt: number;
}

// === REALTIME DATABASE V2 (Isolamento de Painéis) ===
export interface PanelState {
  motorState: MotorState;
  emergencyState: EmergencyState;
  arduinoConnected: boolean;
  studentConnected: boolean;
  activeRelayPin: number;
  uptimeSeconds: number;
  lastHeartbeat: number;
}

export interface PanelCommand {
  targetMotorState: MotorState;
  targetEmergencyState: EmergencyState;
  action: BancadaAction;
  commandBy: string;
  commandAt: number;
  commandId: string; // UUID para idempotência
  processed: boolean;
}

export interface PanelNode {
  state: PanelState;
  command: PanelCommand;
  meta: {
    name: string;
    assignedStudentUid: string | null;
    assignedStudentName: string | null;
  };
}

// === EMERGENCY GLOBAL ===
export interface GlobalEmergency {
  active: boolean;
  triggeredBy: string;
  triggeredAt: number;
}
