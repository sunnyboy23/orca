import { describe, expect, it } from 'vitest'
import { OrchestrationDb } from '../../orchestration/db'
import { resolveFeishuDecisionGate } from './gate-resolver'

describe('resolveFeishuDecisionGate', () => {
  it('resolves a pending gate only when it belongs to the requested run', () => {
    const db = new OrchestrationDb(':memory:')
    const run = db.createCoordinatorRun({ spec: 'work', coordinatorHandle: 'coord' })
    const task = db.createTask({ spec: 'needs approval', runId: run.id })
    const gate = db.createGate({ taskId: task.id, question: 'Proceed?', options: ['yes'] })

    const result = resolveFeishuDecisionGate(db, {
      runId: run.id,
      gateId: gate.id,
      resolution: 'yes'
    })

    expect(result.ok).toBe(true)
    expect(result).toMatchObject({ gate: { id: gate.id, status: 'resolved', resolution: 'yes' } })
    expect(db.getTask(task.id)?.status).toBe('ready')
    db.close()
  })

  it('rejects stale or cross-run gate resolution attempts', () => {
    const db = new OrchestrationDb(':memory:')
    const run = db.createCoordinatorRun({ spec: 'work', coordinatorHandle: 'coord' })
    const otherRun = db.createCoordinatorRun({ spec: 'other', coordinatorHandle: 'coord2' })
    const task = db.createTask({ spec: 'needs approval', runId: run.id })
    const gate = db.createGate({ taskId: task.id, question: 'Proceed?', options: ['yes'] })

    expect(
      resolveFeishuDecisionGate(db, {
        runId: otherRun.id,
        gateId: gate.id,
        resolution: 'yes'
      })
    ).toEqual({ ok: false, reason: 'run_mismatch' })

    db.resolveGate(gate.id, 'yes')
    expect(
      resolveFeishuDecisionGate(db, {
        runId: run.id,
        gateId: gate.id,
        resolution: 'yes again'
      })
    ).toEqual({ ok: false, reason: 'gate_already_closed' })
    db.close()
  })

  it('rejects missing fields and unknown gates', () => {
    const db = new OrchestrationDb(':memory:')

    expect(resolveFeishuDecisionGate(db, { runId: '', gateId: 'gate_1', resolution: 'yes' })).toEqual({
      ok: false,
      reason: 'missing_field'
    })
    expect(
      resolveFeishuDecisionGate(db, { runId: 'run_1', gateId: 'gate_missing', resolution: 'yes' })
    ).toEqual({ ok: false, reason: 'gate_not_found' })
    db.close()
  })
})
