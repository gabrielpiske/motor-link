import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, type Database } from 'firebase/database';
import { getFirestore, type Firestore } from 'firebase/firestore';
import type { BancadaTelemetry, MotorState, EmergencyState } from '@/types';

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
 */
export async function updateBancada(
  bancadaId: string, 
  data: Partial<BancadaTelemetry>
): Promise<void> {
  if (rtdb) {
    const bancadaRef = ref(rtdb, `bancadas/${bancadaId}`);
    await update(bancadaRef, {
      ...data,
      lastCommandAt: Date.now(),
    });
  }

  // Sempre emite no BroadcastChannel local para sincronizar testes no mesmo computador
  try {
    const channel = new BroadcastChannel(`motor-link-bancada-${bancadaId}`);
    channel.postMessage({ type: 'STATE_UPDATE', payload: data });
    channel.close();
  } catch {}
}

/**
 * Envia um comando do celular do aluno para a bancada específica.
 */
export async function sendCommandToBancada(
  bancadaId: string,
  motorState: MotorState,
  emergencyState: EmergencyState,
  sender: string = 'Celular do Aluno'
): Promise<void> {
  const payload = {
    motorState,
    emergencyState,
    lastCommandBy: sender,
    lastCommandAt: Date.now(),
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

export { app, db, rtdb };
