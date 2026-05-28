import type { Page } from '@stablyai/playwright-test'

export type RuntimeTask = {
  id: string
  spec: string
  status: string
  result: string | null
}

export type RuntimeDetail = {
  run: { status: string }
  tasks: RuntimeTask[]
  artifacts: { task_id: string; manifest_path: string; status: string }[]
}

export async function activeWorktreePath(page: Page): Promise<string> {
  return page.evaluate(() => {
    const store = window.__store
    if (!store?.getState().activeWorktreeId) {
      throw new Error('No active worktree for HelloAGENTS E2E')
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

export async function callRuntime<T>(page: Page, method: string, params?: unknown): Promise<T> {
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

export async function openOrchestration(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__store?.getState().openOrchestrationPage()
  })
}
