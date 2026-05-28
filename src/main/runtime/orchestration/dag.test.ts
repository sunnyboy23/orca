import { describe, expect, it } from 'vitest'
import {
  DagValidationError,
  buildTopologicalLayers,
  getReadyLayer,
  validateTaskDag
} from './dag'

describe('task DAG utilities', () => {
  it('validates a well-formed DAG and normalizes deps', () => {
    const result = validateTaskDag([
      { id: 'task_b', deps: '["task_a", "task_a"]' },
      { id: 'task_a', deps: [] }
    ])

    expect(result).toEqual({
      ok: true,
      tasks: [
        { id: 'task_b', deps: ['task_a'], status: undefined },
        { id: 'task_a', deps: [], status: undefined }
      ]
    })
  })

  it('reports duplicate tasks, invalid deps, and missing dependencies', () => {
    const result = validateTaskDag([
      { id: 'task_a', deps: [] },
      { id: 'task_a', deps: [] },
      { id: 'task_b', deps: '{' },
      { id: 'task_c', deps: ['task_missing'] }
    ])

    expect(result).toMatchObject({
      ok: false,
      issues: [
        { kind: 'duplicate_task', taskId: 'task_a' },
        { kind: 'invalid_deps', taskId: 'task_b' },
        { kind: 'missing_dependency', taskId: 'task_c', dependencyId: 'task_missing' }
      ]
    })
  })

  it('detects dependency cycles', () => {
    const result = validateTaskDag([
      { id: 'task_a', deps: ['task_c'] },
      { id: 'task_b', deps: ['task_a'] },
      { id: 'task_c', deps: ['task_b'] }
    ])

    expect(result).toMatchObject({
      ok: false,
      issues: [{ kind: 'cycle', taskIds: ['task_a', 'task_c', 'task_b', 'task_a'] }]
    })
  })

  it('builds deterministic topological layers', () => {
    const layers = buildTopologicalLayers([
      { id: 'task_d', deps: ['task_b', 'task_c'] },
      { id: 'task_b', deps: ['task_a'] },
      { id: 'task_a', deps: [] },
      { id: 'task_c', deps: ['task_a'] }
    ])

    expect(layers).toEqual([['task_a'], ['task_b', 'task_c'], ['task_d']])
  })

  it('throws a typed error for invalid topology requests', () => {
    expect(() => buildTopologicalLayers([{ id: 'task_a', deps: ['task_missing'] }])).toThrow(
      DagValidationError
    )

    try {
      buildTopologicalLayers([{ id: 'task_a', deps: ['task_missing'] }])
    } catch (err) {
      expect(err).toBeInstanceOf(DagValidationError)
      expect((err as DagValidationError).issues).toEqual([
        { kind: 'missing_dependency', taskId: 'task_a', dependencyId: 'task_missing' }
      ])
    }
  })

  it('returns only currently ready tasks whose dependencies completed', () => {
    const ready = getReadyLayer(
      [
        { id: 'task_a', deps: [], status: 'completed' },
        { id: 'task_b', deps: ['task_a'], status: 'ready' },
        { id: 'task_c', deps: ['task_a'], status: 'ready' },
        { id: 'task_d', deps: ['task_b'], status: 'ready' },
        { id: 'task_e', deps: [], status: 'dispatched' }
      ],
      10
    )

    expect(ready).toEqual({ taskIds: ['task_b', 'task_c'], deferredTaskIds: [] })
  })

  it('applies max concurrency with stable deferred ordering', () => {
    const ready = getReadyLayer(
      [
        { id: 'task_c', deps: [], status: 'ready' },
        { id: 'task_a', deps: [], status: 'ready' },
        { id: 'task_b', deps: [], status: 'ready' }
      ],
      2
    )

    expect(ready).toEqual({ taskIds: ['task_a', 'task_b'], deferredTaskIds: ['task_c'] })
  })

  it('treats invalid concurrency as one slot', () => {
    const ready = getReadyLayer(
      [
        { id: 'task_a', deps: [], status: 'ready' },
        { id: 'task_b', deps: [], status: 'ready' }
      ],
      0
    )

    expect(ready).toEqual({ taskIds: ['task_a'], deferredTaskIds: ['task_b'] })
  })
})
