import type { ElectronApplication, Page } from '@stablyai/playwright-test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { test, expect } from './helpers/orca-app'
import { waitForActiveWorktree, waitForSessionReady } from './helpers/store'

type R1FlowResult = {
  runId: string
  taskId: string
  helloAgentsRoot: string
}

async function activeWorktreePath(page: Page): Promise<string> {
  return page.evaluate(() => {
    const store = window.__store
    if (!store?.getState().activeWorktreeId) {
      throw new Error('No active worktree for R1 E2E')
    }
    const state = store.getState()
    const worktree = Object.values(state.worktreesByRepo)
      .flat()
      .find((candidate) => candidate.id === state.activeWorktreeId)
    if (!worktree) {
      throw new Error(`Active worktree not found: ${state.activeWorktreeId}`)
    }
    return worktree.path
  })
}

async function runR1Fixture(
  app: ElectronApplication,
  page: Page,
  workspaceRoot: string
): Promise<R1FlowResult> {
  const restoreToken = await app.evaluate(async (_, workspaceRoot) => {
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
    const terminalHandle = 'term_e2e_worker_r1'
    const worktreeSelector = `path:${workspaceRoot}`
    const sentPrompts: string[] = []

    const originalListTerminals = runtime.listTerminals.bind(runtime)
    const originalCreateTerminal = runtime.createTerminal.bind(runtime)
    const originalSendTerminal = runtime.sendTerminal.bind(runtime)
    const originalProbeWorktreeDrift = runtime.probeWorktreeDrift.bind(runtime)

    runtime.listTerminals = async (selector?: string): Promise<unknown> => {
      if (!selector || selector === worktreeSelector) {
        return {
          terminals: [
            {
              handle: terminalHandle,
              worktreeId: 'e2e-r1-worktree',
              worktreePath: workspaceRoot,
              branch: 'main',
              tabId: 'e2e-r1-tab',
              leafId: 'e2e-r1-leaf',
              title: 'E2E R1 Worker',
              connected: true,
              writable: true,
              lastOutputAt: Date.now(),
              preview: ''
            }
          ],
          totalCount: 1,
          truncated: false
        }
      }
      return originalListTerminals(selector)
    }
    runtime.createTerminal = async (selector?: string, opts?: unknown): Promise<unknown> => {
      if (!selector || selector === worktreeSelector) {
        return { handle: terminalHandle, worktreeId: 'e2e-r1-worktree', surface: 'background' }
      }
      return originalCreateTerminal(selector, opts)
    }
    runtime.sendTerminal = async (
      handle: string,
      action: { text?: string }
    ): Promise<unknown> => {
      if (handle !== terminalHandle) {
        return originalSendTerminal(handle, action)
      }
      sentPrompts.push(action.text ?? '')
      return { handle, accepted: true, bytesWritten: action.text?.length ?? 0 }
    }
    runtime.probeWorktreeDrift = async () => null

    const token = `r1-${Date.now()}-${Math.random()}`
    ;(globalThis as Record<string, unknown>)[`__orcaE2ERestore_${token}`] = () => {
      runtime.listTerminals = originalListTerminals
      runtime.createTerminal = originalCreateTerminal
      runtime.sendTerminal = originalSendTerminal
      runtime.probeWorktreeDrift = originalProbeWorktreeDrift
    }
    ;(globalThis as Record<string, unknown>)[`__orcaE2EWaitForDispatch_${token}`] = async () => {
      const deadline = Date.now() + 10_000
      while (Date.now() < deadline && sentPrompts.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 25))
      }
      if (sentPrompts.length === 0) {
        throw new Error('Coordinator did not dispatch the R1 worker prompt')
      }
      return true
    }
    ;(globalThis as Record<string, unknown>)[`__orcaE2EComplete_${token}`] = async (
      runId: string,
      taskId: string
    ) => {
      const db = runtime.getOrchestrationDb()
      db.insertMessage({
        from: terminalHandle,
        to: 'coord_e2e_r1',
        subject: 'Done',
        type: 'worker_done',
        payload: JSON.stringify({
          runId,
          taskId,
          manifestPath: `artifacts/${taskId}/manifest.json`,
          filesModified: ['src/index.ts']
        })
      })

      const deadline = Date.now() + 10_000
      while (Date.now() < deadline) {
        const current = db.getCoordinatorRun(runId)
        if (current?.status === 'completed') {
          return true
        }
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
      throw new Error(`R1 run did not complete: ${db.getCoordinatorRun(runId)?.status}`)
    }
    return token
  }, workspaceRoot)

  try {
    const worktreeSelector = `path:${workspaceRoot}`
    const task = await callRuntime<{ task: { id: string } }>(page, 'orchestration.taskCreate', {
      spec: 'R1 E2E single worker writes artifact and persistence',
      worktree: worktreeSelector,
      artifactDir: 'artifacts/r1-e2e'
    })
    const helloAgentsRoot = path.join(workspaceRoot, '.helloagents', 'e2e-r1')
    const run = await callRuntime<{ runId: string }>(page, 'orchestration.run', {
      spec: 'R1 E2E user input to completed artifact',
      from: 'coord_e2e_r1',
      pollIntervalMs: 25,
      maxConcurrent: 1,
      worktree: worktreeSelector,
      workspaceRoot,
      helloAgentsRoot,
      mode: 'r1',
      source: 'desktop',
      rootRepoName: 'orca-e2e'
    })

    await app.evaluate(async (_, token) => {
      const waitForDispatch = (globalThis as Record<string, unknown>)[
        `__orcaE2EWaitForDispatch_${token}`
      ] as (() => Promise<boolean>) | undefined
      if (!waitForDispatch) {
        throw new Error('Missing R1 E2E dispatch hook')
      }
      await waitForDispatch()
    }, restoreToken)

    const artifactDir = path.join(workspaceRoot, 'artifacts', task.task.id)
    mkdirSync(artifactDir, { recursive: true })
    writeFileSync(
      path.join(artifactDir, 'manifest.json'),
      `${JSON.stringify(
        {
          taskId: task.task.id,
          status: 'completed',
          filesChanged: ['src/index.ts'],
          contracts: ['r1-e2e-contract'],
          verification: [{ command: 'pnpm test -- R1', status: 'passed' }],
          downstreamNotes: 'R1 E2E completed through mocked worker.'
        },
        null,
        2
      )}\n`
    )

    await app.evaluate(
      async (_, payload) => {
        const complete = (globalThis as Record<string, unknown>)[
          `__orcaE2EComplete_${payload.token}`
        ] as ((runId: string, taskId: string) => Promise<boolean>) | undefined
        if (!complete) {
          throw new Error('Missing R1 E2E completion hook')
        }
        await complete(payload.runId, payload.taskId)
      },
      { token: restoreToken, runId: run.runId, taskId: task.task.id }
    )

    return { runId: run.runId, taskId: task.task.id, helloAgentsRoot }
  } finally {
    await app.evaluate((_, token) => {
      const key = `__orcaE2ERestore_${token}`
      const restore = (globalThis as Record<string, unknown>)[key] as (() => void) | undefined
      restore?.()
      delete (globalThis as Record<string, unknown>)[key]
      delete (globalThis as Record<string, unknown>)[`__orcaE2EComplete_${token}`]
      delete (globalThis as Record<string, unknown>)[`__orcaE2EWaitForDispatch_${token}`]
    }, restoreToken)
  }
}

async function callRuntime<T>(page: Page, method: string, params?: unknown): Promise<T> {
  return page.evaluate(
    async ({ method, params }) => {
      const response = await window.api.runtime.call({ method, params })
      if (!response.ok) {
        throw new Error(response.error.message)
      }
      return response.result as T
    },
    { method, params }
  )
}

test.describe('HelloAGENTS R1 orchestration E2E', () => {
  test.beforeEach(async ({ orcaPage }) => {
    await waitForSessionReady(orcaPage)
    await waitForActiveWorktree(orcaPage)
  })

  test('completes a single-worker R1 run, indexes artifacts, persists files, and renders UI', async ({
    electronApp,
    orcaPage
  }) => {
    const workspaceRoot = await activeWorktreePath(orcaPage)
    const result = await runR1Fixture(electronApp, orcaPage, workspaceRoot)

    await orcaPage.evaluate(() => {
      window.__store?.getState().openOrchestrationPage()
    })

    await expect(orcaPage.getByRole('heading', { name: 'Task DAG' })).toBeVisible({
      timeout: 10_000
    })
    await expect(
      orcaPage.getByRole('heading', { name: 'R1 E2E user input to completed artifact' })
    ).toBeVisible()
    await expect(orcaPage.getByText(result.runId, { exact: true }).nth(1)).toBeVisible()
    await expect(orcaPage.getByText(result.taskId, { exact: true })).toBeVisible()
    await expect(orcaPage.getByText('completed', { exact: true })).toBeVisible()
    await expect(orcaPage.getByText(`artifacts/${result.taskId}/manifest.json`)).toBeVisible()
    await expect(orcaPage.getByText('src/index.ts')).toBeVisible()

    await expect
      .poll(() => existsSync(path.join(result.helloAgentsRoot, '.status.json')), {
        timeout: 10_000,
        message: 'R1 HelloAGENTS status file was not persisted'
      })
      .toBe(true)
    const status = JSON.parse(readFileSync(path.join(result.helloAgentsRoot, '.status.json'), 'utf8'))
    expect(status).toMatchObject({
      status: 'completed',
      run_id: result.runId,
      mode: 'r1',
      completed: 1,
      total: 1,
      percent: 100
    })
    expect(readFileSync(path.join(result.helloAgentsRoot, 'STATE.md'), 'utf8')).toContain(
      'R1 E2E user input to completed artifact'
    )
    expect(readFileSync(path.join(result.helloAgentsRoot, 'tasks.md'), 'utf8')).toContain(
      result.taskId
    )
    expect(readFileSync(path.join(result.helloAgentsRoot, 'contract.json'), 'utf8')).toContain(
      'r1-e2e-contract'
    )

    mkdirSync(path.join(workspaceRoot, '.helloagents'), { recursive: true })
    writeFileSync(path.join(workspaceRoot, '.helloagents', '.e2e-r1-cleanup'), result.runId)
  })
})
