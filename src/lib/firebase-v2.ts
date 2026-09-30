import { app, db, rtdb } from './firebase';
import type { MotorState, EmergencyState, BancadaAction } from '@/types';

// Types for the new isolated structure
export interface PanelState {
  motorState: MotorState;
  emergencyState: EmergencyState;
  arduinoConnected: boolean;
  studentConnected: boolean;
  activeRelayPin: number;
  uptimeSeconds: number;
  lastHeartbeat: number;
  currentAmps?: number;
  temperature?: number;
  updatedAt?: number;
  lastCommandIdProcessed?: string;
  isOnline?: boolean;
}

export interface PanelCommand {
  commandId: string;
  motorState: MotorState;
  emergencyState: EmergencyState;
  action: BancadaAction;
  sender: string;
  timestamp: number;
}

export interface PanelMeta {
  name: string;
  assignedStudentUid?: string;
  assignedStudentName?: string;
}

export interface PanelNode {
  state?: PanelState;
  command?: PanelCommand;
  meta?: PanelMeta;
}

export { app, db, rtdb };
