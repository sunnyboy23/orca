import type { OrchestrationDb, DecisionGateRow } from '../../orchestration/db'

export type FeishuGateResolutionRequest = {
  runId: string
  gateId: string
  resolution: string
}

export type FeishuGateResolutionResult =
  | {
      ok: true
      gate: DecisionGateRow
    }
  | {
      ok: false
      reason:
        | 'missing_field'
        | 'gate_not_found'
        | 'task_not_found'
        | 'run_mismatch'
        | 'gate_already_closed'
        | 'resolve_failed'
    }

export type FeishuGateResolutionDb = Pick<
  OrchestrationDb,
  'getGate' | 'getTask' | 'resolveGate'
>

export function resolveFeishuDecisionGate(
  db: FeishuGateResolutionDb,
  request: FeishuGateResolutionRequest
): FeishuGateResolutionResult {
  if (!request.runId.trim() || !request.gateId.trim() || !request.resolution.trim()) {
    return { ok: false, reason: 'missing_field' }
  }

  const gate = db.getGate(request.gateId)
  if (!gate) {
    return { ok: false, reason: 'gate_not_found' }
  }
  if (gate.status !== 'pending') {
    return { ok: false, reason: 'gate_already_closed' }
  }

  const task = db.getTask(gate.task_id)
  if (!task) {
    return { ok: false, reason: 'task_not_found' }
  }
  if (task.run_id !== request.runId) {
    return { ok: false, reason: 'run_mismatch' }
  }

  const resolved = db.resolveGate(request.gateId, request.resolution)
  return resolved ? { ok: true, gate: resolved } : { ok: false, reason: 'resolve_failed' }
}
