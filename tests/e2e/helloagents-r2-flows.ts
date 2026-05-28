import type { ElectronApplication, Page } from '@stablyai/playwright-test'
import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import { callRuntime } from './helloagents-orchestration-runtime'
import {
  completeTask,
  installR2Hooks,
  restoreR2Hooks,
  waitForPrompt,
  waitForRunStatus
} from './helloagents-r2-hooks'

export type R2TaskIds = {
  api: string
  web: string
  verify: string
}

export type R2FlowResult = {
  runId: string
  tasks: R2TaskIds
  helloAgentsRoot: string
}

export type R2SuccessResult = R2FlowResult & {
  verifyPrompt: string
}

export async function runR2SuccessFixture(
  app: ElectronApplication,
  page: Page,
  workspaceRoot: string
): Promise<R2SuccessResult> {
  const token = await installR2Hooks(app, workspaceRoot)
  try {
    const worktree = `path:${workspaceRoot}`
    const tasks = await createR2Tasks(page, worktree)
    const helloAgentsRoot = path.join(workspaceRoot, '.helloagents', 'e2e-r2-success')
    const run = await startR2Run(page, {
      spec: 'R2 E2E DAG completes with upstream artifact propagation',
      worktree,
      workspaceRoot,
      helloAgentsRoot,
      maxConcurrent: 2
    })

    const apiPrompt = await waitForPrompt(app, token, tasks.api)
    writeManifest(workspaceRoot, {
      taskId: tasks.api,
      status: 'completed',
      file: 'src/api.ts',
      contract: 'api-contract',
      notes: 'API contract is ready for verification.'
    })
    await completeTask(app, token, { runId: run.runId, taskId: tasks.api, handle: apiPrompt.handle })
    const webPrompt = await waitForPrompt(app, token, tasks.web)
    writeManifest(workspaceRoot, {
      taskId: tasks.web,
      status: 'completed',
      file: 'src/web.tsx',
      contract: 'web-contract',
      notes: 'Web contract is ready for verification.'
    })
    await completeTask(app, token, { runId: run.runId, taskId: tasks.web, handle: webPrompt.handle })

    const verifyPrompt = await waitForPrompt(app, token, tasks.verify)
    writeManifest(workspaceRoot, {
      taskId: tasks.verify,
      status: 'completed',
      file: 'docs/r2-report.md',
      contract: 'verification-contract',
      notes: 'R2 verification consumed upstream artifacts.'
    })
    await completeTask(app, token, {
      runId: run.runId,
      taskId: tasks.verify,
      handle: verifyPrompt.handle
    })
    await waitForRunStatus(app, token, run.runId, 'completed')
    return { runId: run.runId, tasks, helloAgentsRoot, verifyPrompt: verifyPrompt.prompt }
  } finally {
    await restoreR2Hooks(app, token)
  }
}

export async function runR2FailureFixture(
  app: ElectronApplication,
  page: Page,
  workspaceRoot: string
): Promise<R2FlowResult> {
  const token = await installR2Hooks(app, workspaceRoot)
  try {
    const worktree = `path:${workspaceRoot}`
    const tasks = await createR2FailureTasks(page, worktree)
    const helloAgentsRoot = path.join(workspaceRoot, '.helloagents', 'e2e-r2-failure')
    const run = await startR2Run(page, {
      spec: 'R2 E2E DAG fails and blocks downstream verification',
      worktree,
      workspaceRoot,
      helloAgentsRoot,
      maxConcurrent: 1
    })

    const apiPrompt = await waitForPrompt(app, token, tasks.api)
    writeManifest(workspaceRoot, {
      taskId: tasks.api,
      status: 'failed',
      file: 'src/api.ts',
      contract: 'api-contract',
      notes: 'API worker failed before producing a usable contract.'
    })
    await completeTask(app, token, { runId: run.runId, taskId: tasks.api, handle: apiPrompt.handle })
    await waitForRunStatus(app, token, run.runId, 'failed')
    return { runId: run.runId, tasks, helloAgentsRoot }
  } finally {
    await restoreR2Hooks(app, token)
  }
}

async function createR2Tasks(page: Page, worktree: string): Promise<R2TaskIds> {
  const api = await createTask(page, 'R2 E2E API worker produces service contract', worktree)
  const web = await createTask(page, 'R2 E2E Web worker produces UI contract', worktree)
  const verify = await createTask(
    page,
    'R2 E2E Verify worker consumes upstream artifacts',
    worktree,
    [api, web]
  )
  return { api, web, verify }
}

async function createR2FailureTasks(page: Page, worktree: string): Promise<R2TaskIds> {
  const api = await createTask(page, 'R2 E2E API worker fails', worktree)
  const web = await createTask(page, 'R2 E2E Web worker blocked by API', worktree, [api])
  const verify = await createTask(page, 'R2 E2E Verify worker blocked by API', worktree, [api])
  return { api, web, verify }
}

async function createTask(
  page: Page,
  spec: string,
  worktree: string,
  deps?: string[]
): Promise<string> {
  const result = await callRuntime<{ task: { id: string } }>(page, 'orchestration.taskCreate', {
    spec,
    deps: deps ? JSON.stringify(deps) : undefined,
    worktree,
    artifactDir: 'artifacts/r2-e2e'
  })
  return result.task.id
}

async function startR2Run(
  page: Page,
  params: {
    spec: string
    worktree: string
    workspaceRoot: string
    helloAgentsRoot: string
    maxConcurrent: number
  }
): Promise<{ runId: string }> {
  return callRuntime<{ runId: string }>(page, 'orchestration.run', {
    spec: params.spec,
    from: 'coord_e2e_r2',
    pollIntervalMs: 25,
    maxConcurrent: params.maxConcurrent,
    worktree: params.worktree,
    workspaceRoot: params.workspaceRoot,
    helloAgentsRoot: params.helloAgentsRoot,
    mode: 'r2',
    source: 'desktop',
    rootRepoName: 'orca-e2e'
  })
}

function writeManifest(
  workspaceRoot: string,
  params: {
    taskId: string
    status: 'completed' | 'failed'
    file: string
    contract: string
    notes: string
  }
): void {
  const artifactDir = path.join(workspaceRoot, 'artifacts', params.taskId)
  mkdirSync(artifactDir, { recursive: true })
  writeFileSync(
    path.join(artifactDir, 'manifest.json'),
    `${JSON.stringify(
      {
        taskId: params.taskId,
        status: params.status,
        filesChanged: [params.file],
        contracts: [params.contract],
        verification: [{ command: `pnpm test -- ${params.taskId}`, status: verificationStatus(params.status) }],
        downstreamNotes: params.notes
      },
      null,
      2
    )}\n`
  )
}

function verificationStatus(status: 'completed' | 'failed'): 'passed' | 'failed' {
  return status === 'completed' ? 'passed' : 'failed'
}
