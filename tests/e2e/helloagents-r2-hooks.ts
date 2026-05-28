import type { ElectronApplication } from '@stablyai/playwright-test'
import {
  completeWorkerTask,
  installWorkerHooks,
  restoreWorkerHooks,
  waitForWorkerPrompt,
  waitForWorkerRunStatus,
  type WorkerPrompt
} from './helloagents-worker-hooks'

export type R2Prompt = WorkerPrompt

export async function installR2Hooks(
  app: ElectronApplication,
  workspaceRoot: string
): Promise<string> {
  return installWorkerHooks(app, workspaceRoot, {
    tokenPrefix: 'r2',
    workerPrefix: 'term_e2e_r2_worker',
    workerCount: 3
  })
}

export async function restoreR2Hooks(app: ElectronApplication, token: string): Promise<void> {
  await restoreWorkerHooks(app, token)
}

export async function waitForPrompt(
  app: ElectronApplication,
  token: string,
  taskId: string
): Promise<R2Prompt> {
  return waitForWorkerPrompt(app, token, taskId)
}

export async function completeTask(
  app: ElectronApplication,
  token: string,
  params: { runId: string; taskId: string; handle: string }
): Promise<void> {
  await completeWorkerTask(app, token, {
    ...params,
    coordinatorHandle: 'coord_e2e_r2'
  })
}

export async function waitForRunStatus(
  app: ElectronApplication,
  token: string,
  runId: string,
  status: 'completed' | 'failed'
): Promise<void> {
  await waitForWorkerRunStatus(app, token, runId, status)
}
