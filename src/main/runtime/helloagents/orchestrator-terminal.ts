import type { CoordinatorRun, CoordinatorStatus, MessageRow } from '../orchestration/db'
import type { OrchestratorLaunchPlan } from './adapter'
import type { OrchestratorTerminalEvent, OrchestratorTerminalSnapshot } from './orchestrator-events'

export type OrchestratorTerminalRuntime = {
  createTerminal(
    worktreeSelector?: string,
    opts?: { command?: string; env?: Record<string, string>; title?: string; focus?: boolean }
  ): Promise<{ handle: string; worktreeId: string }>
  sendTerminal(handle: string, action: { text?: string; enter?: boolean }): Promise<unknown>
  waitForTerminal(
    handle: string,
    options?: { condition?: string; timeoutMs?: number }
  ): Promise<{ handle: string; condition: string }>
  subscribeToTerminalData?(handle: string, listener: (data: string) => void): () => void
}

export type OrchestratorTerminalDb = {
  createCoordinatorRun(run: {
    spec: string
    coordinatorHandle: string
    pollIntervalMs?: number
  }): CoordinatorRun
  getCoordinatorRun(id: string): CoordinatorRun | undefined
  getActiveCoordinatorRun(): CoordinatorRun | undefined
  updateCoordinatorRun(id: string, status: CoordinatorStatus): CoordinatorRun | undefined
  insertMessage(message: {
    from: string
    to: string
    subject: string
    body?: string
    type?: MessageRow['type']
    threadId?: string
  }): MessageRow
}

export type OrchestratorTerminalManagerOptions = {
  db: OrchestratorTerminalDb
  runtime: OrchestratorTerminalRuntime
  launchPlan: OrchestratorLaunchPlan
  worktree?: string
  title?: string
  onEvent?: (event: OrchestratorTerminalEvent) => void
}

type ActiveOrchestrator = {
  runId: string
  handle: string
  worktreeId: string
  unsubscribe?: () => void
  lastOutput: string
}

const LAST_OUTPUT_LIMIT = 16_000

export class OrchestratorTerminalManager {
  private readonly db: OrchestratorTerminalDb
  private readonly runtime: OrchestratorTerminalRuntime
  private readonly launchPlan: OrchestratorLaunchPlan
  private readonly worktree?: string
  private readonly title: string
  private readonly onEvent: (event: OrchestratorTerminalEvent) => void
  private active: ActiveOrchestrator | null = null

  constructor(options: OrchestratorTerminalManagerOptions) {
    this.db = options.db
    this.runtime = options.runtime
    this.launchPlan = options.launchPlan
    this.worktree = options.worktree
    this.title = options.title ?? 'HelloAGENTS Orchestrator'
    this.onEvent = options.onEvent ?? (() => {})
  }

  getActiveSnapshot(): OrchestratorTerminalSnapshot | null {
    if (!this.active) {
      return null
    }
    const run = this.db.getCoordinatorRun(this.active.runId)
    return {
      runId: this.active.runId,
      handle: this.active.handle,
      worktreeId: this.active.worktreeId,
      status: run?.status === 'completed' ? 'completed' : run?.status === 'failed' ? 'failed' : 'running',
      lastOutput: this.active.lastOutput
    }
  }

  async start(spec: string): Promise<OrchestratorTerminalSnapshot> {
    this.assertReady()
    if (this.active) {
      throw new Error(`Orchestrator already running: ${this.active.runId}`)
    }
    const existing = this.db.getActiveCoordinatorRun()
    if (existing) {
      throw new Error(`Coordinator already running: ${existing.id}`)
    }

    const terminal = await this.runtime.createTerminal(this.worktree, {
      command: this.launchPlan.command ?? undefined,
      env: this.launchPlan.env,
      title: this.title,
      focus: true
    })
    const run = this.db.createCoordinatorRun({
      spec,
      coordinatorHandle: terminal.handle
    })

    this.active = {
      runId: run.id,
      handle: terminal.handle,
      worktreeId: terminal.worktreeId,
      unsubscribe: this.runtime.subscribeToTerminalData?.(terminal.handle, (chunk) => {
        this.recordOutput(chunk)
      }),
      lastOutput: ''
    }
    this.emit({ type: 'started', runId: run.id, handle: terminal.handle, worktreeId: terminal.worktreeId })
    this.watchExit(this.active)
    return this.getActiveSnapshotOrThrow()
  }

  async sendInput(text: string): Promise<void> {
    const active = this.active
    if (!active) {
      throw new Error('No active orchestrator terminal')
    }
    await this.runtime.sendTerminal(active.handle, { text, enter: true })
    this.db.insertMessage({
      from: 'user',
      to: active.handle,
      subject: 'User input',
      body: text,
      type: 'status',
      threadId: active.runId
    })
    this.emit({ type: 'input', runId: active.runId, handle: active.handle, text })
  }

  markCompleted(reason = 'completed'): void {
    const active = this.active
    if (!active) {
      throw new Error('No active orchestrator terminal')
    }
    this.finish(active, 'completed', reason)
  }

  private assertReady(): void {
    if (!this.launchPlan.ready || !this.launchPlan.command) {
      const issues = this.launchPlan.issues.length > 0 ? this.launchPlan.issues.join('; ') : 'unknown'
      throw new Error(`HelloAGENTS orchestrator is not ready: ${issues}`)
    }
  }

  private watchExit(active: ActiveOrchestrator): void {
    void this.runtime
      .waitForTerminal(active.handle, { condition: 'exit' })
      .then(() => {
        if (this.active === active) {
          this.finish(active, 'failed', 'Orchestrator terminal exited')
        }
      })
      .catch((err: unknown) => {
        if (this.active === active) {
          const message = err instanceof Error ? err.message : String(err)
          this.emit({ type: 'error', runId: active.runId, handle: active.handle, message })
          this.finish(active, 'failed', message)
        }
      })
  }

  private recordOutput(chunk: string): void {
    const active = this.active
    if (!active) {
      return
    }
    active.lastOutput = (active.lastOutput + chunk).slice(-LAST_OUTPUT_LIMIT)
    this.db.insertMessage({
      from: active.handle,
      to: 'coordinator',
      subject: 'Orchestrator output',
      body: chunk,
      type: 'status',
      threadId: active.runId
    })
    this.emit({ type: 'output', runId: active.runId, handle: active.handle, chunk })
  }

  private finish(active: ActiveOrchestrator, status: 'completed' | 'failed', reason: string): void {
    active.unsubscribe?.()
    this.db.updateCoordinatorRun(active.runId, status)
    this.emit({ type: 'exit', runId: active.runId, handle: active.handle, status, reason })
    if (this.active === active) {
      this.active = null
    }
  }

  private getActiveSnapshotOrThrow(): OrchestratorTerminalSnapshot {
    const snapshot = this.getActiveSnapshot()
    if (!snapshot) {
      throw new Error('No active orchestrator terminal')
    }
    return snapshot
  }

  private emit(event: OrchestratorTerminalEvent): void {
    this.onEvent(event)
  }
}
