import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CoordinatorRun, MessageRow } from '../orchestration/db'
import type { OrchestratorLaunchPlan } from './adapter'
import {
  OrchestratorTerminalManager,
  type OrchestratorTerminalDb,
  type OrchestratorTerminalRuntime
} from './orchestrator-terminal'
import type { OrchestratorTerminalEvent } from './orchestrator-events'

type MockRuntime = OrchestratorTerminalRuntime & {
  sent: { handle: string; text: string; enter?: boolean }[]
  emitData(handle: string, chunk: string): void
  resolveExit(handle: string): void
}

type InsertedMessage = MessageRow

type FakeDb = OrchestratorTerminalDb & {
  runs: CoordinatorRun[]
  messages: InsertedMessage[]
  getUnreadMessages(toHandle: string): InsertedMessage[]
  close(): void
}

function createLaunchPlan(overrides: Partial<OrchestratorLaunchPlan> = {}): OrchestratorLaunchPlan {
  return {
    command: '/bin/claude',
    args: [],
    env: { HELLOAGENTS_CONFIG: '/home/dev/.helloagents/helloagents.json' },
    ready: true,
    issues: [],
    ...overrides
  }
}

function createMockRuntime(): MockRuntime {
  const dataListeners = new Map<string, (data: string) => void>()
  const exitResolvers = new Map<string, () => void>()
  const runtime: MockRuntime = {
    sent: [],
    async createTerminal(_worktree, _opts) {
      return { handle: 'term_orchestrator', worktreeId: 'wt1' }
    },
    async sendTerminal(handle, action) {
      runtime.sent.push({ handle, text: action.text ?? '', enter: action.enter })
      return { accepted: true }
    },
    waitForTerminal(handle) {
      return new Promise((resolve) => {
        exitResolvers.set(handle, () => resolve({ handle, condition: 'exit' }))
      })
    },
    subscribeToTerminalData(handle, listener) {
      dataListeners.set(handle, listener)
      return () => {
        dataListeners.delete(handle)
      }
    },
    emitData(handle, chunk) {
      dataListeners.get(handle)?.(chunk)
    },
    resolveExit(handle) {
      exitResolvers.get(handle)?.()
    }
  }
  return runtime
}

function createFakeDb(): FakeDb {
  const db: FakeDb = {
    runs: [],
    messages: [],
    createCoordinatorRun(run) {
      const row: CoordinatorRun = {
        id: `run_${db.runs.length}`,
        spec: run.spec,
        status: 'running',
        mode: 'unknown',
        source: 'unknown',
        coordinator_handle: run.coordinatorHandle,
        poll_interval_ms: run.pollIntervalMs ?? 2000,
        project_id: null,
        root_repo_name: null,
        plan_path: null,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        completed_at: null
      }
      db.runs.push(row)
      return row
    },
    getCoordinatorRun(id) {
      return db.runs.find((run) => run.id === id)
    },
    getActiveCoordinatorRun() {
      return db.runs.find((run) => run.status === 'running')
    },
    updateCoordinatorRun(id, status) {
      const run = db.getCoordinatorRun(id)
      if (!run) {
        return undefined
      }
      run.status = status
      if (status === 'completed' || status === 'failed') {
        run.completed_at = new Date().toISOString()
      }
      run.updated_at = new Date().toISOString()
      return run
    },
    insertMessage(message) {
      const row: MessageRow = {
        id: `msg_${db.messages.length}`,
        from_handle: message.from,
        to_handle: message.to,
        subject: message.subject,
        body: message.body ?? '',
        type: message.type ?? 'status',
        priority: 'normal',
        thread_id: message.threadId ?? null,
        payload: null,
        read: 0,
        sequence: db.messages.length,
        created_at: new Date().toISOString(),
        delivered_at: null
      }
      db.messages.push(row)
      return row
    },
    getUnreadMessages(toHandle) {
      return db.messages.filter((message) => message.to_handle === toHandle)
    },
    close() {}
  }
  return db
}

describe('OrchestratorTerminalManager', () => {
  let db: FakeDb

  afterEach(() => {
    db?.close()
  })

  it('starts one orchestrator terminal and records the run', async () => {
    db = createFakeDb()
    const runtime = createMockRuntime()
    const events: OrchestratorTerminalEvent[] = []
    const manager = new OrchestratorTerminalManager({
      db,
      runtime,
      launchPlan: createLaunchPlan(),
      onEvent: (event) => events.push(event)
    })

    const snapshot = await manager.start('Build a feature')
    const run = db.getCoordinatorRun(snapshot.runId)

    expect(snapshot).toMatchObject({
      handle: 'term_orchestrator',
      status: 'running',
      worktreeId: 'wt1'
    })
    expect(run?.coordinator_handle).toBe('term_orchestrator')
    expect(events[0]).toMatchObject({ type: 'started', runId: snapshot.runId })
  })

  it('rejects startup when HelloAGENTS launch plan is not ready', async () => {
    db = createFakeDb()
    const manager = new OrchestratorTerminalManager({
      db,
      runtime: createMockRuntime(),
      launchPlan: createLaunchPlan({
        command: null,
        ready: false,
        issues: ['helloagents CLI not found on PATH']
      })
    })

    await expect(manager.start('Build a feature')).rejects.toThrow(
      'helloagents CLI not found on PATH'
    )
  })

  it('prevents a second active orchestrator run', async () => {
    db = createFakeDb()
    const runtime = createMockRuntime()
    const manager = new OrchestratorTerminalManager({
      db,
      runtime,
      launchPlan: createLaunchPlan()
    })

    const first = await manager.start('First')

    await expect(manager.start('Second')).rejects.toThrow(first.runId)
  })

  it('forwards user input to the original orchestrator terminal', async () => {
    db = createFakeDb()
    const runtime = createMockRuntime()
    const events: OrchestratorTerminalEvent[] = []
    const manager = new OrchestratorTerminalManager({
      db,
      runtime,
      launchPlan: createLaunchPlan(),
      onEvent: (event) => events.push(event)
    })

    const snapshot = await manager.start('Need confirmation')
    await manager.sendInput('1')
    const messages = db.getUnreadMessages(snapshot.handle)

    expect(runtime.sent).toEqual([{ handle: snapshot.handle, text: '1', enter: true }])
    expect(messages[0]?.body).toBe('1')
    expect(events.at(-1)).toMatchObject({ type: 'input', text: '1' })
  })

  it('records terminal output and marks exit as failed', async () => {
    db = createFakeDb()
    vi.useFakeTimers()
    const runtime = createMockRuntime()
    const events: OrchestratorTerminalEvent[] = []
    const manager = new OrchestratorTerminalManager({
      db,
      runtime,
      launchPlan: createLaunchPlan(),
      onEvent: (event) => events.push(event)
    })

    const snapshot = await manager.start('Run')
    runtime.emitData(snapshot.handle, 'waiting for confirmation')
    runtime.resolveExit(snapshot.handle)
    await vi.runAllTimersAsync()

    const run = db.getCoordinatorRun(snapshot.runId)
    const output = db.getUnreadMessages('coordinator')

    expect(output[0]?.body).toBe('waiting for confirmation')
    expect(run?.status).toBe('failed')
    expect(events.at(-1)).toMatchObject({ type: 'exit', status: 'failed' })
    vi.useRealTimers()
  })

  it('can mark the orchestrator run completed explicitly', async () => {
    db = createFakeDb()
    const runtime = createMockRuntime()
    const manager = new OrchestratorTerminalManager({
      db,
      runtime,
      launchPlan: createLaunchPlan()
    })

    const snapshot = await manager.start('Run')
    manager.markCompleted()

    expect(db.getCoordinatorRun(snapshot.runId)?.status).toBe('completed')
    expect(manager.getActiveSnapshot()).toBeNull()
  })
})
