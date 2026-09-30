/**
 * @deprecated This file contains the legacy V1 database structure and functions.
 * Please use firebase-v2.ts and the useMotorControl hook for the new isolated structure.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, type Database } from 'firebase/database';
import { getFirestore, type Firestore } from 'firebase/firestore';
import type { BancadaTelemetry, MotorState, EmergencyState, BancadaAction } from '@/types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
};

export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    rtdb = getDatabase(app);
  } catch (error) {
    console.warn('[Firebase] Erro ao conectar ao Firebase:', error);
  }
}

/**
 * Escuta as atualizações de estado de uma bancada específica em tempo real.
 */
export function subscribeToBancada(
  bancadaId: string, 
  callback: (data: Partial<BancadaTelemetry>) => void
): () => void {
  // Se o Firebase estiver ativo, usa Realtime Database
  if (rtdb) {
    const bancadaRef = ref(rtdb, `bancadas/${bancadaId}`);
    const unsubscribe = onValue(bancadaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    });
    return () => unsubscribe();
  }

  // Fallback para BroadcastChannel (permite testar múltiplas abas no mesmo PC sem Firebase)
  try {
    const channel = new BroadcastChannel(`motor-link-bancada-${bancadaId}`);
    channel.onmessage = (event) => {
      if (event.data?.payload) {
        callback(event.data.payload);
      }
    };
    return () => channel.close();
  } catch {
    return () => {};
  }
}

/**
 * Atualiza o estado da bancada (chamado pelo PC da bancada com o Arduino conectado).
 * Não altera timestamps de comando para evitar loops de reprocessamento.
 */
export async function updateBancada(
  bancadaId: string, 
  data: Partial<BancadaTelemetry>
): Promise<void> {
  if (rtdb) {
    const bancadaRef = ref(rtdb, `bancadas/${bancadaId}`);
    await update(bancadaRef, data);
  }

  // Sempre emite no BroadcastChannel local para sincronizar testes no mesmo computador
  try {
    const channel = new BroadcastChannel(`motor-link-bancada-${bancadaId}`);
    channel.postMessage({ type: 'STATE_UPDATE', payload: data });
    channel.close();
  } catch {}
}

/**
 * Envia um comando do celular do aluno ou do professor para a bancada específica.
 */
export async function sendCommandToBancada(
  bancadaId: string,
  motorState: MotorState,
  emergencyState: EmergencyState,
  sender: string = 'Celular do Aluno',
  action?: BancadaAction
): Promise<void> {
  const resolvedAction: BancadaAction = action ?? (
    emergencyState === 'ACTIVE'
      ? 'EMERGENCY'
      : motorState === 'ON'
      ? 'START'
      : 'STOP'
  );

  const payload: Partial<BancadaTelemetry> = {
    motorState,
    emergencyState,
    targetMotorState: motorState,
    targetEmergencyState: emergencyState,
    lastCommandBy: sender,
    lastCommandAt: Date.now(),
    lastCommandAction: resolvedAction,
  };

  if (rtdb) {
    const bancadaRef = ref(rtdb, `bancadas/${bancadaId}`);
    await update(bancadaRef, payload);
  }

  try {
    const channel = new BroadcastChannel(`motor-link-bancada-${bancadaId}`);
    channel.postMessage({ type: 'COMMAND', payload });
    channel.close();
  } catch {}
}

/**
 * Escuta todas as bancadas do laboratório simultaneamente (Painel do Supervisor/Professor).
 */
export function subscribeToAllBancadas(
  callback: (bancadas: Record<string, Partial<BancadaTelemetry>>) => void
): () => void {
  if (rtdb) {
    const bancadasRef = ref(rtdb, 'bancadas');
    const unsubscribe = onValue(bancadasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    });
    return () => unsubscribe();
  }

  return () => {};
}

/**
 * Aciona parada de emergência geral em todas as 12 bancadas simultaneamente (Corte Geral da Sala).
 */
export async function emergencyStopAllBancadas(totalBancadas: number = 12): Promise<void> {
  for (let i = 1; i <= totalBancadas; i++) {
    const id = String(i);
    await sendCommandToBancada(id, 'OFF', 'ACTIVE', 'Professor (Emergência Geral da Sala)', 'EMERGENCY');
  }
}

export { app, db, rtdb };
