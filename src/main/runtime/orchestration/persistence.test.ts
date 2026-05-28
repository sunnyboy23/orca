import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { OrchestrationDb } from './db'
import { buildRunSnapshot, persistRunSnapshot } from './persistence'

describe('HelloAGENTS deterministic persistence', () => {
  let db: OrchestrationDb | undefined
  let tempDir: string | undefined

  afterEach(async () => {
    db?.close()
    db = undefined
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true })
      tempDir = undefined
    }
  })

  async function createTempDir(): Promise<string> {
    tempDir = await mkdtemp(join(tmpdir(), 'orca-ha-persist-'))
    return tempDir
  }

  it('builds a run snapshot from DB state', () => {
    db = new OrchestrationDb(':memory:')
    const run = db.createCoordinatorRun({
      spec: 'Implement feature',
      coordinatorHandle: 'coord',
      mode: 'r2',
      source: 'desktop'
    })
    const task = db.createTask({ spec: 'work', runId: run.id })
    db.updateTaskStatus(task.id, 'completed')
    db.upsertArtifactManifest({
      runId: run.id,
      taskId: task.id,
      manifestPath: `artifacts/${task.id}/manifest.json`,
      status: 'completed'
    })

    const snapshot = buildRunSnapshot({
      db,
      runId: run.id,
      now: '2026-05-26T00:00:00.000Z'
    })

    expect(snapshot.run.id).toBe(run.id)
    expect(snapshot.tasks).toHaveLength(1)
    expect(snapshot.artifacts).toHaveLength(1)
    expect(snapshot.updatedAt).toBe('2026-05-26T00:00:00.000Z')
  })

  it('writes status, state, changelog, plan, tasks, and contract files', async () => {
    db = new OrchestrationDb(':memory:')
    const root = await createTempDir()
    const run = db.createCoordinatorRun({
      spec: 'Build HelloAGENTS integration',
      coordinatorHandle: 'coord',
      mode: 'r1',
      source: 'desktop'
    })
    const task = db.createTask({ spec: 'write persistence', runId: run.id })
    db.updateTaskStatus(task.id, 'completed')
    db.upsertArtifactManifest({
      runId: run.id,
      taskId: task.id,
      manifestPath: `artifacts/${task.id}/manifest.json`,
      status: 'completed',
      filesChanged: ['src/main/runtime/orchestration/persistence.ts'],
      verification: [{ command: 'pnpm test', status: 'passed' }]
    })
    db.updateCoordinatorRun(run.id, 'completed')

    const result = await persistRunSnapshot({
      db,
      runId: run.id,
      helloAgentsRoot: root,
      now: '2026-05-26T00:00:00.000Z'
    })

    expect(result.ok).toBe(true)
    const status = JSON.parse(await readFile(join(root, '.status.json'), 'utf8')) as {
      status: string
      completed: number
      total: number
      percent: number
    }
    expect(status).toMatchObject({
      status: 'completed',
      completed: 1,
      total: 1,
      percent: 100
    })
    await expect(readFile(join(root, 'STATE.md'), 'utf8')).resolves.toContain(
      'Build HelloAGENTS integration'
    )
    await expect(readFile(join(root, 'CHANGELOG.md'), 'utf8')).resolves.toContain(run.id)
    await expect(readFile(join(root, 'plan.md'), 'utf8')).resolves.toContain('Run 信息')
    await expect(readFile(join(root, 'tasks.md'), 'utf8')).resolves.toContain(task.id)
    const contract = JSON.parse(await readFile(join(root, 'contract.json'), 'utf8')) as {
    run: { id: string }
    artifacts: { filesChanged: string[] }[]
    }
    expect(contract.run.id).toBe(run.id)
    expect(contract.artifacts[0].filesChanged).toEqual([
      'src/main/runtime/orchestration/persistence.ts'
    ])
  })

  it('returns failed result when the run is missing', async () => {
    db = new OrchestrationDb(':memory:')
    const root = await createTempDir()

    const result = await persistRunSnapshot({
      db,
      runId: 'run_missing',
      helloAgentsRoot: root
    })

    expect(result).toEqual({
      ok: false,
      reason: 'Coordinator run not found: run_missing'
    })
  })

  it('returns failed result when a configured output path is impossible to write', async () => {
    db = new OrchestrationDb(':memory:')
    const root = await createTempDir()
    const run = db.createCoordinatorRun({ spec: 'work', coordinatorHandle: 'coord' })

    const result = await persistRunSnapshot({
      db,
      runId: run.id,
      helloAgentsRoot: root,
      paths: {
        statusJsonPath: root
      }
    })

    expect(result.ok).toBe(false)
    expect(result.ok ? '' : result.reason).toMatch(/EISDIR|illegal operation/)
  })
})
