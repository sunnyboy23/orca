import { describe, expect, it } from 'vitest'
import {
  getCurrentGate,
  getTaskError,
  parseArtifactFiles,
  parseGateOptions,
  parseTaskDeps
} from './orchestration-format'
import type { OrchestrationGate, OrchestrationTask } from './types'

describe('orchestration format helpers', () => {
  it('parses task dependencies, gate options, and artifact files safely', () => {
    expect(parseTaskDeps({ deps: '["task_a","task_b"]' })).toEqual(['task_a', 'task_b'])
    expect(parseTaskDeps({ deps: '{bad' })).toEqual([])
    expect(parseGateOptions({ options: '["yes","no"]' })).toEqual(['yes', 'no'])
    expect(parseArtifactFiles({ files_changed: '["src/app.ts"]' })).toEqual(['src/app.ts'])
  })

  it('extracts task error summaries for blocked and failed tasks', () => {
    const blocked = {
      status: 'blocked',
      result: JSON.stringify({ blockedBy: 'task_upstream' })
    } as Pick<OrchestrationTask, 'status' | 'result'>
    const failed = {
      status: 'failed',
      result: JSON.stringify({ reason: 'manifest missing' })
    } as Pick<OrchestrationTask, 'status' | 'result'>

    expect(getTaskError(blocked)).toBe('Blocked by task_upstream.')
    expect(getTaskError(failed)).toBe('manifest missing')
    expect(getTaskError({ status: 'completed', result: null })).toBeNull()
  })

  it('selects the pending gate as the current gate', () => {
    const gates = [
      { id: 'gate_done', status: 'resolved' },
      { id: 'gate_wait', status: 'pending' }
    ] as OrchestrationGate[]

    expect(getCurrentGate(gates)?.id).toBe('gate_wait')
    expect(getCurrentGate([{ id: 'gate_done', status: 'resolved' } as OrchestrationGate])).toBeNull()
  })
})
