import type { FeishuGateResolutionRequest } from './gate-resolver'

export type FeishuCardAction =
  | {
      type: 'resolve_gate'
      request: FeishuGateResolutionRequest
    }
  | {
      type: 'unknown'
    }

export function extractFeishuCardAction(body: Record<string, unknown>): FeishuCardAction {
  const value =
    readRecord(readRecord(readRecord(body, 'event'), 'action'), 'value') ??
    readRecord(readRecord(body, 'action'), 'value') ??
    readRecord(body, 'value')
  const action = readString(value, 'action')
  if (action !== 'resolve_gate') {
    return { type: 'unknown' }
  }
  return {
    type: 'resolve_gate',
    request: {
      runId: readString(value, 'run_id') ?? '',
      gateId: readString(value, 'gate_id') ?? '',
      resolution: readString(value, 'resolution') ?? ''
    }
  }
}

function readRecord(record: Record<string, unknown> | null, key: string): Record<string, unknown> | null {
  const value = record?.[key]
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function readString(record: Record<string, unknown> | null, key: string): string | undefined {
  const value = record?.[key]
  return typeof value === 'string' ? value : undefined
}
