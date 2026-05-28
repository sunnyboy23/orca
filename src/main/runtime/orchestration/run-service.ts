import { join } from 'node:path'
import { Coordinator, type CoordinatorRuntime } from './coordinator'
import type { OrchestrationDb } from './db'
import { persistRunSnapshot } from './persistence'
import type { CoordinatorRunMode, CoordinatorRunSource } from './types'

export type StartCoordinatorRunParams = {
  spec: string
  from?: string
  pollIntervalMs?: number
  maxConcurrent?: number
  worktree?: string
  mode?: CoordinatorRunMode
  source?: CoordinatorRunSource
  projectId?: string
  rootRepoName?: string
  planPath?: string
  workspaceRoot?: string
  helloAgentsRoot?: string
}

export type StartCoordinatorRunResult = {
  runId: string
  status: 'running'
}

let activeCoordinator: Coordinator | null = null

export function startCoordinatorRun(
  db: OrchestrationDb,
  runtime: CoordinatorRuntime,
  params: StartCoordinatorRunParams
): StartCoordinatorRunResult {
  const existing = db.getActiveCoordinatorRun()
  if (existing) {
    throw new Error(`Coordinator already running: ${existing.id}`)
  }

  const coordinatorHandle = params.from ?? 'coordinator'
  const coordinator = new Coordinator(db, runtime, {
    spec: params.spec,
    coordinatorHandle,
    pollIntervalMs: params.pollIntervalMs,
    maxConcurrent: params.maxConcurrent,
    worktree: params.worktree,
    workspaceRoot: params.workspaceRoot
  })

  activeCoordinator = coordinator

  const run = db.createCoordinatorRun({
    spec: params.spec,
    coordinatorHandle,
    pollIntervalMs: params.pollIntervalMs,
    mode: params.mode,
    source: params.source,
    projectId: params.projectId,
    rootRepoName: params.rootRepoName,
    planPath: params.planPath
  })
  db.attachUnscopedTasksToRun(run.id)

  const helloAgentsRoot = params.helloAgentsRoot ?? defaultHelloAgentsRoot(params.workspaceRoot)

  // Why: orchestration.run is fire-and-forget. The run state is persisted in DB
  // and read through orchestration.runDetail/taskList instead of this call.
  coordinator
    .runFromExistingRun(run.id)
    .catch(() => {})
    .finally(() => {
      if (helloAgentsRoot) {
        void persistRunSnapshot({ db, runId: run.id, helloAgentsRoot }).catch(() => {})
      }
      if (activeCoordinator === coordinator) {
        activeCoordinator = null
      }
    })

  return { runId: run.id, status: 'running' }
}

export function stopActiveCoordinatorRun(db: OrchestrationDb): { runId: string; stopped: true } {
  const run = db.getActiveCoordinatorRun()
  if (!run) {
    throw new Error('No active coordinator run')
  }

  if (activeCoordinator) {
    activeCoordinator.stop()
    activeCoordinator = null
  }

  return { runId: run.id, stopped: true }
}

export function defaultHelloAgentsRoot(workspaceRoot: string | undefined): string | undefined {
  return workspaceRoot ? join(workspaceRoot, '.helloagents') : undefined
}
