import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { ArtifactManifestRow, CoordinatorRun, TaskRow } from './types'

export type HelloAgentsRunSnapshot = {
  run: CoordinatorRun
  tasks: TaskRow[]
  artifacts: ArtifactManifestRow[]
  updatedAt: string
}

export type HelloAgentsFileSet = {
  statusJson: string
  stateMd: string
  changelogMd: string
  planMd: string
  tasksMd: string
  contractJson: string
}

export type HelloAgentsFilePaths = {
  statusJsonPath: string
  statePath: string
  changelogPath: string
  planPath: string
  tasksPath: string
  contractPath: string
}

export function buildHelloAgentsFileSet(snapshot: HelloAgentsRunSnapshot): HelloAgentsFileSet {
  return {
    statusJson: `${JSON.stringify(buildStatusJson(snapshot), null, 2)}\n`,
    stateMd: buildStateMarkdown(snapshot),
    changelogMd: buildChangelogMarkdown(snapshot),
    planMd: buildPlanMarkdown(snapshot),
    tasksMd: buildTasksMarkdown(snapshot),
    contractJson: `${JSON.stringify(buildContractJson(snapshot), null, 2)}\n`
  }
}

export async function writeHelloAgentsFileSet(params: {
  rootDir: string
  files: HelloAgentsFileSet
  paths?: Partial<HelloAgentsFilePaths>
}): Promise<HelloAgentsFilePaths> {
  const paths = resolveHelloAgentsPaths(params.rootDir, params.paths)
  await writeUtf8(paths.statusJsonPath, params.files.statusJson)
  await writeUtf8(paths.statePath, params.files.stateMd)
  await writeUtf8(paths.changelogPath, params.files.changelogMd)
  await writeUtf8(paths.planPath, params.files.planMd)
  await writeUtf8(paths.tasksPath, params.files.tasksMd)
  await writeUtf8(paths.contractPath, params.files.contractJson)
  return paths
}

export function resolveHelloAgentsPaths(
  rootDir: string,
  overrides: Partial<HelloAgentsFilePaths> = {}
): HelloAgentsFilePaths {
  return {
    statusJsonPath: overrides.statusJsonPath ?? join(rootDir, '.status.json'),
    statePath: overrides.statePath ?? join(rootDir, 'STATE.md'),
    changelogPath: overrides.changelogPath ?? join(rootDir, 'CHANGELOG.md'),
    planPath: overrides.planPath ?? join(rootDir, 'plan.md'),
    tasksPath: overrides.tasksPath ?? join(rootDir, 'tasks.md'),
    contractPath: overrides.contractPath ?? join(rootDir, 'contract.json')
  }
}

function buildStatusJson(snapshot: HelloAgentsRunSnapshot): Record<string, unknown> {
  const total = snapshot.tasks.length
  const completed = snapshot.tasks.filter((task) => task.status === 'completed').length
  const failed = snapshot.tasks.filter((task) => task.status === 'failed').length
  const blocked = snapshot.tasks.filter((task) => task.status === 'blocked').length
  const pending = snapshot.tasks.filter((task) =>
    ['pending', 'ready', 'dispatched'].includes(task.status)
  ).length
  const percent = total === 0 ? 100 : Math.round((completed / total) * 100)
  const current =
    snapshot.tasks.find((task) => ['dispatched', 'ready', 'pending'].includes(task.status)) ??
    snapshot.tasks.at(-1)

  return {
    status: snapshot.run.status === 'running' ? 'in_progress' : snapshot.run.status,
    run_id: snapshot.run.id,
    mode: snapshot.run.mode,
    source: snapshot.run.source,
    completed,
    failed,
    blocked,
    pending,
    total,
    percent,
    current: current?.spec ?? snapshot.run.spec,
    updated_at: snapshot.updatedAt
  }
}

function buildStateMarkdown(snapshot: HelloAgentsRunSnapshot): string {
  const lines = [
    '# 恢复快照',
    '',
    '## 主线目标',
    snapshot.run.spec,
    '',
    '## 正在做什么',
    `Run ${snapshot.run.id} 当前状态：${snapshot.run.status}。`,
    '',
    '## 关键上下文',
    `- 模式：${snapshot.run.mode}`,
    `- 来源：${snapshot.run.source}`,
    `- 任务数：${snapshot.tasks.length}`,
    `- Artifact 数：${snapshot.artifacts.length}`,
    '',
    '## 下一步',
    nextStep(snapshot),
    '',
    '## 阻塞项',
    blockedSummary(snapshot),
    ''
  ]
  return `${lines.join('\n')}\n`
}

function buildChangelogMarkdown(snapshot: HelloAgentsRunSnapshot): string {
  const lines = [
    '# CHANGELOG',
    '',
    `## ${snapshot.updatedAt}`,
    '',
    `- **orchestration**: run ${snapshot.run.id} ${snapshot.run.status}，任务 ${snapshot.tasks.length} 个，artifact ${snapshot.artifacts.length} 个。`
  ]
  return `${lines.join('\n')}\n`
}

function buildPlanMarkdown(snapshot: HelloAgentsRunSnapshot): string {
  const lines = [
    `# Run ${snapshot.run.id} — 执行计划`,
    '',
    '## 目标',
    snapshot.run.spec,
    '',
    '## Run 信息',
    `- 状态：${snapshot.run.status}`,
    `- 模式：${snapshot.run.mode}`,
    `- 来源：${snapshot.run.source}`,
    `- Root Repo：${snapshot.run.root_repo_name ?? '未设置'}`,
    '',
    '## Artifact',
    artifactSummary(snapshot),
    ''
  ]
  return `${lines.join('\n')}\n`
}

function buildTasksMarkdown(snapshot: HelloAgentsRunSnapshot): string {
  const lines = [
    `# Run ${snapshot.run.id} — 任务记录`,
    '',
    ...snapshot.tasks.map(formatTaskLine),
    ''
  ]
  return `${lines.join('\n')}\n`
}

function buildContractJson(snapshot: HelloAgentsRunSnapshot): Record<string, unknown> {
  return {
    version: 1,
    updatedAt: snapshot.updatedAt,
    run: {
      id: snapshot.run.id,
      status: snapshot.run.status,
      mode: snapshot.run.mode,
      source: snapshot.run.source,
      spec: snapshot.run.spec
    },
    tasks: snapshot.tasks.map((task) => ({
      id: task.id,
      status: task.status,
      deps: parseJsonArray<string>(task.deps),
      repoName: task.repo_name,
      artifactDir: task.artifact_dir,
      result: parseJsonValue(task.result)
    })),
    artifacts: snapshot.artifacts.map((artifact) => ({
      id: artifact.id,
      taskId: artifact.task_id,
      status: artifact.status,
      manifestPath: artifact.manifest_path,
      filesChanged: parseJsonArray<string>(artifact.files_changed),
      contracts: parseJsonArray<string>(artifact.contracts),
      verification: parseJsonArray<unknown>(artifact.verification),
      downstreamNotes: artifact.downstream_notes
    }))
  }
}

function nextStep(snapshot: HelloAgentsRunSnapshot): string {
  const active = snapshot.tasks.find((task) =>
    ['dispatched', 'ready', 'pending'].includes(task.status)
  )
  if (active) {
    return `${active.id}: ${active.spec}`
  }
  return snapshot.run.status === 'completed' ? '当前 run 已完成。' : '检查失败或阻塞任务。'
}

function blockedSummary(snapshot: HelloAgentsRunSnapshot): string {
  const blocked = snapshot.tasks.filter((task) => task.status === 'blocked')
  if (blocked.length === 0) {
    return '（无）'
  }
  return blocked.map((task) => `- ${task.id}: ${task.spec}`).join('\n')
}

function artifactSummary(snapshot: HelloAgentsRunSnapshot): string {
  if (snapshot.artifacts.length === 0) {
    return '（无）'
  }
  return snapshot.artifacts
    .map((artifact) => `- ${artifact.task_id}: ${artifact.status}，${artifact.manifest_path}`)
    .join('\n')
}

function formatTaskLine(task: TaskRow): string {
  const deps = parseJsonArray<string>(task.deps)
  const depText = deps.length > 0 ? `；依赖：${deps.join(', ')}` : ''
  const artifactText = task.artifact_dir ? `；artifact：${task.artifact_dir}` : ''
  return `- [${taskStatusMark(task.status)}] ${task.id}: ${task.spec}（${task.status}${depText}${artifactText}）`
}

function taskStatusMark(status: TaskRow['status']): string {
  if (status === 'completed') {
    return '√'
  }
  if (status === 'failed' || status === 'blocked') {
    return 'X'
  }
  return ' '
}

function parseJsonArray<T>(value: string): T[] {
  const parsed = parseJsonValue(value)
  return Array.isArray(parsed) ? (parsed as T[]) : []
}

function parseJsonValue(value: string | null): unknown {
  if (!value) {
    return null
  }
  try {
    return JSON.parse(value) as unknown
  } catch {
    return value
  }
}

async function writeUtf8(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, content, 'utf8')
}
