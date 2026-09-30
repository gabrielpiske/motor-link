/**
 * Motor-Link V2 — Hook de Controle de Motor Refatorado
 * 
 * Resolve os bugs de concorrência da V1:
 * 1. Debounce individual por painel (Map<string, Timeout>)
 * 2. Emergência SEMPRE bypassa debounce (prioridade absoluta NR-12)
 * 3. Escrita atômica multi-path para emergência geral (1 write = 12 painéis)
 * 4. Separação física de state/ vs command/ no RTDB
 * 5. commandId UUID para idempotência
 */

import { rtdb } from '@/lib/firebase-v2';
import { ref, onValue, update } from 'firebase/database';
import type { PanelState, PanelCommand, PanelNode } from '@/lib/firebase-v2';
import type { BancadaAction, MotorState, EmergencyState } from '@/types';

const TOTAL_PANELS = 12;
const DEBOUNCE_MS = 300;

// Mapa de debounce independente por painel — evita que clicks rápidos no supervisório
// enviem rajadas de update() para o mesmo nó RTDB
const debounceMap = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Gera um ID único para cada comando (idempotência).
 * O PC da bancada usa este ID para evitar processar o mesmo comando duas vezes.
 */
function generateCommandId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Deriva motorState e emergencyState a partir da ação solicitada.
 * Fail-Safe: qualquer ação desconhecida resulta em motor OFF.
 */
function resolveStatesFromAction(action: BancadaAction): { motorState: MotorState; emergencyState: EmergencyState } {
  switch (action) {
    case 'START':
      return { motorState: 'ON', emergencyState: 'CLEAR' };
    case 'STOP':
      return { motorState: 'OFF', emergencyState: 'CLEAR' };
    case 'EMERGENCY':
      return { motorState: 'OFF', emergencyState: 'ACTIVE' };
    case 'RESET_EMERGENCY':
      return { motorState: 'OFF', emergencyState: 'CLEAR' };
    default:
      // Fail-Safe: estado desconhecido → motor desligado
      return { motorState: 'OFF', emergencyState: 'CLEAR' };
  }
}

// ============================================================
// FUNÇÕES STANDALONE (exportadas para uso sem hook)
// ============================================================

/**
 * Escuta o estado de um painel específico em tempo real.
 * Ouve apenas o nó `panels/{id}/state` (leitura isolada de comandos).
 */
export function subscribeToPanelState(
  panelId: string,
  callback: (state: PanelState) => void
): () => void {
  if (!rtdb) return () => {};
  const stateRef = ref(rtdb, `panels/${panelId}/state`);
  const unsubscribe = onValue(stateRef, (snapshot) => {
    const data = snapshot.val();
    if (data) callback(data);
  });
  return () => unsubscribe();
}

/**
 * Escuta o comando pendente de um painel (usado pelo PC da bancada).
 * Ouve apenas `panels/{id}/command`.
 */
export function subscribeToPanelCommand(
  panelId: string,
  callback: (command: PanelCommand) => void
): () => void {
  if (!rtdb) return () => {};
  const commandRef = ref(rtdb, `panels/${panelId}/command`);
  const unsubscribe = onValue(commandRef, (snapshot) => {
    const data = snapshot.val();
    if (data) callback(data);
  });
  return () => unsubscribe();
}

/**
 * Escuta TODOS os painéis simultaneamente (visão do supervisor).
 */
export function subscribeToAllPanels(
  callback: (panels: Record<string, PanelNode>) => void
): () => void {
  if (!rtdb) return () => {};
  const panelsRef = ref(rtdb, 'panels');
  const unsubscribe = onValue(panelsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) callback(data);
  });
  return () => unsubscribe();
}

/**
 * Envia um comando para um painel específico.
 * 
 * - Aplica debounce de 300ms por painel para evitar rajadas
 * - Emergência SEMPRE bypassa o debounce (NR-12: prioridade absoluta)
 * - Escreve APENAS em `panels/{id}/command` (nunca em `state`)
 */
export function sendCommand(
  panelId: string,
  action: BancadaAction,
  sender: string
): void {
  if (!rtdb) return;

  const isEmergency = action === 'EMERGENCY';

  // Debounce: bloqueia comandos repetidos ao mesmo painel dentro de 300ms
  // EXCETO emergência — que tem prioridade absoluta sobre tudo
  if (!isEmergency) {
    if (debounceMap.has(panelId)) {
      console.warn(`[Motor-Link] Debounce: comando para painel ${panelId} ignorado (< ${DEBOUNCE_MS}ms)`);
      return;
    }
    debounceMap.set(panelId, setTimeout(() => {
      debounceMap.delete(panelId);
    }, DEBOUNCE_MS));
  } else {
    // Se é emergência, limpa qualquer debounce pendente para este painel
    const pendingTimer = debounceMap.get(panelId);
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      debounceMap.delete(panelId);
    }
  }

  const { motorState, emergencyState } = resolveStatesFromAction(action);

  const command: PanelCommand = {
    commandId: generateCommandId(),
    motorState,
    emergencyState,
    action,
    sender,
    timestamp: Date.now(),
  };

  // Escrita isolada: apenas no nó command/ do painel alvo
  const rootRef = ref(rtdb);
  update(rootRef, {
    [`panels/${panelId}/command`]: command,
  }).catch((err) => {
    console.error(`[Motor-Link] Falha ao enviar comando para painel ${panelId}:`, err);
  });
}

/**
 * PARADA DE EMERGÊNCIA GERAL — Corte em todas as 12 bancadas.
 * 
 * CORREÇÃO CRÍTICA DA V1:
 * - V1 usava `for` sequencial com `await` → se uma bancada falhasse, as demais não recebiam o corte
 * - V2 usa UMA ÚNICA chamada `update()` com multi-path → operação ATÔMICA
 * - Também seta `global/emergency` para sinalizar emergência geral
 */
export async function emergencyStopAll(sender: string): Promise<void> {
  if (!rtdb) return;

  const updates: Record<string, unknown> = {};
  const baseId = generateCommandId();

  for (let i = 1; i <= TOTAL_PANELS; i++) {
    const panelId = String(i);

    updates[`panels/${panelId}/command`] = {
      commandId: `${baseId}-${panelId}`,
      motorState: 'OFF',
      emergencyState: 'ACTIVE',
      action: 'EMERGENCY',
      sender,
      timestamp: Date.now(),
    } satisfies PanelCommand;

    // Limpa debounce de todos os painéis
    const timer = debounceMap.get(panelId);
    if (timer) {
      clearTimeout(timer);
      debounceMap.delete(panelId);
    }
  }

  // Flag global de emergência
  updates['global/emergency'] = {
    active: true,
    triggeredBy: sender,
    triggeredAt: Date.now(),
  };

  // UMA ÚNICA escrita atômica para todos os 12 painéis + flag global
  const rootRef = ref(rtdb);
  await update(rootRef, updates);
}

/**
 * Reset geral — libera todas as 12 bancadas da emergência.
 * Também usa escrita atômica multi-path.
 */
export async function resetAll(sender: string): Promise<void> {
  if (!rtdb) return;

  const updates: Record<string, unknown> = {};
  const baseId = generateCommandId();

  for (let i = 1; i <= TOTAL_PANELS; i++) {
    const panelId = String(i);

    updates[`panels/${panelId}/command`] = {
      commandId: `${baseId}-${panelId}`,
      motorState: 'OFF',
      emergencyState: 'CLEAR',
      action: 'RESET_EMERGENCY',
      sender,
      timestamp: Date.now(),
    } satisfies PanelCommand;
  }

  updates['global/emergency'] = {
    active: false,
    triggeredBy: sender,
    triggeredAt: Date.now(),
  };

  const rootRef = ref(rtdb);
  await update(rootRef, updates);
}

/**
 * Atualiza o estado de um painel (chamado pelo PC da bancada com Arduino).
 * Escreve APENAS em `panels/{id}/state` (nunca em `command`).
 */
export async function updatePanelState(
  panelId: string,
  state: Partial<PanelState>
): Promise<void> {
  if (!rtdb) return;

  const stateRef = ref(rtdb, `panels/${panelId}/state`);
  await update(stateRef, state);
}

// ============================================================
// HOOK REACT (encapsula as funções para uso em componentes)
// ============================================================

export interface UseMotorControlReturn {
  subscribeToPanelState: typeof subscribeToPanelState;
  subscribeToPanelCommand: typeof subscribeToPanelCommand;
  subscribeToAllPanels: typeof subscribeToAllPanels;
  sendCommand: typeof sendCommand;
  emergencyStopAll: typeof emergencyStopAll;
  resetAll: typeof resetAll;
  updatePanelState: typeof updatePanelState;
}

/**
 * Hook principal de controle de motor para componentes React.
 * Expõe todas as funções de controle com debounce e isolamento embutidos.
 */
export function useMotorControl(): UseMotorControlReturn {
  return {
    subscribeToPanelState,
    subscribeToPanelCommand,
    subscribeToAllPanels,
    sendCommand,
    emergencyStopAll,
    resetAll,
    updatePanelState,
  };
}
