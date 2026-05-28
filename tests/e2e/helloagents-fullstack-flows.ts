import type { ElectronApplication, Page } from '@stablyai/playwright-test'
import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import { convertFullstackState } from '../../src/main/runtime/helloagents/fullstack-adapter'
import type { OrchestratorTaskSpec } from '../../src/main/runtime/helloagents/output-parser'
import { callRuntime } from './helloagents-orchestration-runtime'
import {
  completeWorkerTask,
  installWorkerHooks,
  restoreWorkerHooks,
  waitForWorkerPrompt,
  waitForWorkerRunStatus
} from './helloagents-worker-hooks'

const COORDINATOR_HANDLE = 'coord_e2e_fullstack'

export type FullstackFlowResult = {
  runId: string
  helloAgentsRoot: string
  tasks: Record<string, string>
  prompts: Record<string, string>
  requirement: string
}

type FullstackSourceTask = {
  task_id: string
  engineer_id?: string
  project?: string
  description: string
  depends_on: string[]
  status?: string
  verification_status?: string
  closeout_status?: string
  task_contract?: Record<string, unknown>
}

type FullstackFixture = {
  task_group_id: string
  requirement: string
  status: string
  tasks: Record<string, FullstackSourceTask>
  required_artifacts: { key: string; description: string }[]
}

export async function runFullstackFixture(
  app: ElectronApplication,
  page: Page,
  workspaceRoot: string
): Promise<FullstackFlowResult> {
  const token = await installWorkerHooks(app, workspaceRoot, {
    tokenPrefix: 'fullstack',
    workerPrefix: 'term_e2e_fullstack_worker',
    workerCount: 2
  })
  try {
    const fixture = createFullstackFixture()
    const conversion = convertFullstackState(fixture)
    if (!conversion.ok) {
      throw new Error(`Fullstack fixture did not convert: ${conversion.error.message}`)
    }

    const worktree = `path:${workspaceRoot}`
    const taskIds = await createConvertedTasks(page, conversion.conversion.tasks, worktree)
    const helloAgentsRoot = path.join(workspaceRoot, '.helloagents', 'e2e-fullstack')
    const run = await startFullstackRun(page, {
      spec: fixture.requirement,
      worktree,
      workspaceRoot,
      helloAgentsRoot,
      planPath: path.join('.helloagents', 'fullstack', fixture.task_group_id, 'current.json')
    })

    const prompts: Record<string, string> = {}
    const domainPrompt = await waitForWorkerPrompt(app, token, taskIds.T1)
    prompts.T1 = domainPrompt.prompt
    writeManifest(workspaceRoot, {
      taskId: taskIds.T1,
      manifestPath: manifestPath('T1', taskIds.T1),
      file: 'services/config-domain.ts',
      contract: 'fullstack/contracts/domain-config.md',
      notes: 'Domain model and config contract are ready for API integration.'
    })
    await completeWorkerTask(app, token, {
      runId: run.runId,
      taskId: taskIds.T1,
      handle: domainPrompt.handle,
      coordinatorHandle: COORDINATOR_HANDLE,
      manifestPath: manifestPath('T1', taskIds.T1)
    })

    const apiPrompt = await waitForWorkerPrompt(app, token, taskIds.T2)
    prompts.T2 = apiPrompt.prompt
    writeManifest(workspaceRoot, {
      taskId: taskIds.T2,
      manifestPath: manifestPath('T2', taskIds.T2),
      file: 'api/config-controller.ts',
      contract: 'fullstack/contracts/config-api.md',
      notes: 'API contract consumes the domain artifact and exposes review feedback fields.'
    })
    await completeWorkerTask(app, token, {
      runId: run.runId,
      taskId: taskIds.T2,
      handle: apiPrompt.handle,
      coordinatorHandle: COORDINATOR_HANDLE,
      manifestPath: manifestPath('T2', taskIds.T2)
    })

    const reportPrompt = await waitForWorkerPrompt(app, token, taskIds.T3)
    prompts.T3 = reportPrompt.prompt
    writeManifest(workspaceRoot, {
      taskId: taskIds.T3,
      manifestPath: manifestPath('T3', taskIds.T3),
      file: 'fullstack/reports/config-management-report.md',
      contract: 'fullstack/reports/feedback-summary.md',
      notes: 'Final fullstack report includes implementation feedback and verification summary.'
    })
    await completeWorkerTask(app, token, {
      runId: run.runId,
      taskId: taskIds.T3,
      handle: reportPrompt.handle,
      coordinatorHandle: COORDINATOR_HANDLE,
      manifestPath: manifestPath('T3', taskIds.T3)
    })

    await waitForWorkerRunStatus(app, token, run.runId, 'completed')
    return {
      runId: run.runId,
      helloAgentsRoot,
      tasks: taskIds,
      prompts,
      requirement: fixture.requirement
    }
  } finally {
    await restoreWorkerHooks(app, token)
  }
}

function createFullstackFixture(): FullstackFixture {
  return {
    task_group_id: '20260526-config-management',
    requirement: '~fullstack E2E config management feedback/report flow',
    status: 'in_progress',
    tasks: {
      T1: {
        task_id: 'T1',
        engineer_id: 'be-node-main',
        project: '/Users/other-machine/project/config-service',
        description: '实现配置领域模型和持久化契约',
        depends_on: [],
        status: 'pending',
        verification_status: 'pending',
        closeout_status: 'pending',
        task_contract: {
          required_artifacts: [{ key: 'fullstack/contracts/domain-config.md' }]
        }
      },
      T2: {
        task_id: 'T2',
        engineer_id: 'be-node-main',
        project: '/Users/other-machine/project/config-api',
        description: '实现配置 API 并回传执行反馈',
        depends_on: ['T1'],
        status: 'pending',
        verification_status: 'pending',
        closeout_status: 'pending',
        task_contract: {
          required_artifacts: [{ key: 'fullstack/contracts/config-api.md' }]
        }
      },
      T3: {
        task_id: 'T3',
        engineer_id: 'qa-report',
        project: '/Users/other-machine/project/config-web',
        description: '汇总 fullstack 验收报告和反馈',
        depends_on: ['T2'],
        status: 'pending',
        verification_status: 'pending',
        closeout_status: 'pending',
        task_contract: {
          required_artifacts: [{ key: 'fullstack/reports/feedback-summary.md' }]
        }
      }
    },
    required_artifacts: [
      {
        key: 'fullstack/reports/feedback-summary.md',
        description: 'Fullstack feedback and verification report'
      }
    ]
  }
}

async function createConvertedTasks(
  page: Page,
  tasks: OrchestratorTaskSpec[],
  worktree: string
): Promise<Record<string, string>> {
  const created: Record<string, string> = {}
  for (const task of tasks) {
    const result = await callRuntime<{ task: { id: string } }>(page, 'orchestration.taskCreate', {
      spec: task.spec,
      deps: JSON.stringify(task.deps.map((dep) => created[dep] ?? dep)),
      repoName: task.repoName,
      worktree,
      artifactDir: `artifacts/fullstack-e2e/${task.id}`
    })
    created[task.id] = result.task.id
  }
  return created
}

async function startFullstackRun(
  page: Page,
  params: {
    spec: string
    worktree: string
    workspaceRoot: string
    helloAgentsRoot: string
    planPath: string
  }
): Promise<{ runId: string }> {
  return callRuntime<{ runId: string }>(page, 'orchestration.run', {
    spec: params.spec,
    from: COORDINATOR_HANDLE,
    pollIntervalMs: 25,
    maxConcurrent: 2,
    worktree: params.worktree,
    workspaceRoot: params.workspaceRoot,
    helloAgentsRoot: params.helloAgentsRoot,
    mode: 'fullstack',
    source: 'desktop',
    rootRepoName: 'orca-e2e',
    planPath: params.planPath
  })
}

function manifestPath(sourceTaskId: string, taskId: string): string {
  return `artifacts/fullstack-e2e/${sourceTaskId}/${taskId}/manifest.json`
}

function writeManifest(
  workspaceRoot: string,
  params: {
    taskId: string
    manifestPath: string
    file: string
    contract: string
    notes: string
  }
): void {
  const fullPath = path.join(workspaceRoot, params.manifestPath)
  mkdirSync(path.dirname(fullPath), { recursive: true })
  writeFileSync(
    fullPath,
    `${JSON.stringify(
      {
        taskId: params.taskId,
        status: 'completed',
        filesChanged: [params.file],
        contracts: [params.contract],
        verification: [{ command: `pnpm test -- ${params.taskId}`, status: 'passed' }],
        downstreamNotes: params.notes
      },
      null,
      2
    )}\n`
  )
}
