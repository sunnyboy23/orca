import type { ElectronApplication } from '@stablyai/playwright-test'

export type WorkerHookOptions = {
  tokenPrefix: string
  workerPrefix: string
  workerCount: number
}

export type WorkerPrompt = {
  handle: string
  prompt: string
}

export async function installWorkerHooks(
  app: ElectronApplication,
  workspaceRoot: string,
  options: WorkerHookOptions
): Promise<string> {
  return app.evaluate(
    async (_, payload) => {
      const runtime = (globalThis as { __orcaE2ERuntime?: unknown }).__orcaE2ERuntime as
        | {
            listTerminals: (...args: unknown[]) => Promise<unknown>
            createTerminal: (...args: unknown[]) => Promise<unknown>
            sendTerminal: (...args: unknown[]) => Promise<unknown>
            probeWorktreeDrift: (...args: unknown[]) => Promise<unknown>
            getOrchestrationDb(): {
              getCoordinatorRun(id: string): { status: string } | undefined
              insertMessage(message: Record<string, unknown>): unknown
            }
          }
        | undefined
      if (!runtime) {
        throw new Error('E2E runtime accessor is unavailable')
      }

      const prompts = new Map<string, string>()
      const workers = Array.from(
        { length: payload.options.workerCount },
        (_, index) => `${payload.options.workerPrefix}_${index + 1}`
      )
      const originalListTerminals = runtime.listTerminals.bind(runtime)
      const originalCreateTerminal = runtime.createTerminal.bind(runtime)
      const originalSendTerminal = runtime.sendTerminal.bind(runtime)
      const originalProbeWorktreeDrift = runtime.probeWorktreeDrift.bind(runtime)

      runtime.listTerminals = async (): Promise<unknown> => ({
        terminals: workers.map((handle) => ({
          handle,
          worktreeId: `e2e-${payload.options.tokenPrefix}-${handle}`,
          worktreePath: payload.workspaceRoot,
          branch: 'main',
          tabId: `tab-${handle}`,
          leafId: `leaf-${handle}`,
          connected: true,
          writable: true,
          title: `E2E ${payload.options.tokenPrefix} ${handle}`,
          lastOutputAt: Date.now(),
          preview: ''
        })),
        totalCount: workers.length,
        truncated: false
      })
      runtime.createTerminal = async (): Promise<unknown> => ({
        handle: workers[0],
        worktreeId: `e2e-${payload.options.tokenPrefix}-created`,
        surface: 'background'
      })
      runtime.sendTerminal = async (...args: unknown[]): Promise<unknown> => {
        const handle = typeof args[0] === 'string' ? args[0] : ''
        const action = args[1] as { text?: string } | undefined
        if (!workers.includes(handle)) {
          return originalSendTerminal(handle, action)
        }
        prompts.set(handle, action?.text ?? '')
        return { handle, accepted: true, bytesWritten: action?.text?.length ?? 0 }
      }
      runtime.probeWorktreeDrift = async () => null

      const token = `${payload.options.tokenPrefix}-${Date.now()}-${Math.random()}`
      ;(globalThis as Record<string, unknown>)[`__orcaE2ERestore_${token}`] = () => {
        runtime.listTerminals = originalListTerminals
        runtime.createTerminal = originalCreateTerminal
        runtime.sendTerminal = originalSendTerminal
        runtime.probeWorktreeDrift = originalProbeWorktreeDrift
      }
      ;(globalThis as Record<string, unknown>)[`__orcaE2EWaitForPrompt_${token}`] = async (
        taskId: string
      ) => {
        const deadline = Date.now() + 10_000
        while (Date.now() < deadline) {
          for (const [handle, prompt] of prompts) {
            if (prompt.includes(`Your task ID is: ${taskId}`)) {
              return { handle, prompt }
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 25))
        }
        const promptsDebug = workers.map((handle) => ({
          handle,
          prompt: prompts.get(handle)?.slice(0, 240) ?? null
        }))
        throw new Error(
          `Coordinator did not dispatch task ${taskId}; prompts=${JSON.stringify(promptsDebug)}`
        )
      }
      ;(globalThis as Record<string, unknown>)[`__orcaE2EComplete_${token}`] = async (
        params: {
          runId: string
          taskId: string
          handle: string
          coordinatorHandle: string
          manifestPath?: string
        }
      ) => {
        runtime.getOrchestrationDb().insertMessage({
          from: params.handle,
          to: params.coordinatorHandle,
          subject: 'Done',
          type: 'worker_done',
          payload: JSON.stringify({
            runId: params.runId,
            taskId: params.taskId,
            manifestPath: params.manifestPath ?? `artifacts/${params.taskId}/manifest.json`
          })
        })
      }
      ;(globalThis as Record<string, unknown>)[`__orcaE2EWaitForRun_${token}`] = async (
        runId: string,
        status: string
      ) => {
        const db = runtime.getOrchestrationDb()
        const deadline = Date.now() + 10_000
        while (Date.now() < deadline) {
          if (db.getCoordinatorRun(runId)?.status === status) {
            return true
          }
          await new Promise((resolve) => setTimeout(resolve, 50))
        }
        throw new Error(`Run ${runId} did not reach ${status}: ${db.getCoordinatorRun(runId)?.status}`)
      }
      return token
    },
    { workspaceRoot, options }
  )
}

export async function restoreWorkerHooks(app: ElectronApplication, token: string): Promise<void> {
  await app.evaluate((_, token) => {
    const key = `__orcaE2ERestore_${token}`
    const restore = (globalThis as Record<string, unknown>)[key] as (() => void) | undefined
    restore?.()
    delete (globalThis as Record<string, unknown>)[key]
    delete (globalThis as Record<string, unknown>)[`__orcaE2EWaitForPrompt_${token}`]
    delete (globalThis as Record<string, unknown>)[`__orcaE2EComplete_${token}`]
    delete (globalThis as Record<string, unknown>)[`__orcaE2EWaitForRun_${token}`]
  }, token)
}

export async function waitForWorkerPrompt(
  app: ElectronApplication,
  token: string,
  taskId: string
): Promise<WorkerPrompt> {
  return app.evaluate(
    async (_, payload) => {
      const hook = (globalThis as Record<string, unknown>)[
        `__orcaE2EWaitForPrompt_${payload.token}`
      ] as ((taskId: string) => Promise<WorkerPrompt>) | undefined
      if (!hook) {
        throw new Error('Missing E2E prompt hook')
      }
      return hook(payload.taskId)
    },
    { token, taskId }
  )
}

export async function completeWorkerTask(
  app: ElectronApplication,
  token: string,
  params: {
    runId: string
    taskId: string
    handle: string
    coordinatorHandle: string
    manifestPath?: string
  }
): Promise<void> {
  await app.evaluate(
    async (_, payload) => {
      const hook = (globalThis as Record<string, unknown>)[
        `__orcaE2EComplete_${payload.token}`
      ] as ((params: typeof payload.params) => Promise<void>) | undefined
      if (!hook) {
        throw new Error('Missing E2E completion hook')
      }
      await hook(payload.params)
    },
    { token, params }
  )
}

export async function waitForWorkerRunStatus(
  app: ElectronApplication,
  token: string,
  runId: string,
  status: 'completed' | 'failed'
): Promise<void> {
  await app.evaluate(
    async (_, payload) => {
      const hook = (globalThis as Record<string, unknown>)[
        `__orcaE2EWaitForRun_${payload.token}`
      ] as ((runId: string, status: string) => Promise<boolean>) | undefined
      if (!hook) {
        throw new Error('Missing E2E run hook')
      }
      await hook(payload.runId, payload.status)
    },
    { token, runId, status }
  )
}
