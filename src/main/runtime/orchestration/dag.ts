import type { TaskStatus } from './types'

export type DagTask = {
  id: string
  deps: string | string[]
  status?: TaskStatus
}

export type DagIssue =
  | { kind: 'duplicate_task'; taskId: string }
  | { kind: 'invalid_deps'; taskId: string; reason: string }
  | { kind: 'missing_dependency'; taskId: string; dependencyId: string }
  | { kind: 'cycle'; taskIds: string[] }

export type DagValidationResult =
  | { ok: true; tasks: NormalizedDagTask[] }
  | { ok: false; issues: DagIssue[] }

export type NormalizedDagTask = {
  id: string
  deps: string[]
  status?: TaskStatus
}

export type ReadyLayer = {
  taskIds: string[]
  deferredTaskIds: string[]
}

export function validateTaskDag(tasks: DagTask[]): DagValidationResult {
  const { normalized, issues } = normalizeTasks(tasks)
  const missing = findMissingDependencies(normalized)
  const cycles = findCycles(normalized)
  const allIssues = [...issues, ...missing, ...cycles]
  if (allIssues.length > 0) {
    return { ok: false, issues: allIssues }
  }

  return { ok: true, tasks: normalized }
}

export function buildTopologicalLayers(tasks: DagTask[]): string[][] {
  const validation = validateTaskDag(tasks)
  if (!validation.ok) {
    throw new DagValidationError(validation.issues)
  }

  const remaining = new Map(validation.tasks.map((task) => [task.id, task]))
  const completed = new Set<string>()
  const layers: string[][] = []

  while (remaining.size > 0) {
    const layer = [...remaining.values()]
      .filter((task) => task.deps.every((dependencyId) => completed.has(dependencyId)))
      .map((task) => task.id)
      .sort()

    if (layer.length === 0) {
      throw new DagValidationError([{ kind: 'cycle', taskIds: [...remaining.keys()].sort() }])
    }

    layers.push(layer)
    for (const taskId of layer) {
      remaining.delete(taskId)
      completed.add(taskId)
    }
  }

  return layers
}

export function getReadyLayer(tasks: DagTask[], maxConcurrency: number): ReadyLayer {
  const validation = validateTaskDag(tasks)
  if (!validation.ok) {
    throw new DagValidationError(validation.issues)
  }

  const completed = new Set(
    validation.tasks.filter((task) => task.status === 'completed').map((task) => task.id)
  )
  const ready = validation.tasks
    .filter((task) => task.status === 'ready')
    .filter((task) => task.deps.every((dependencyId) => completed.has(dependencyId)))
    .map((task) => task.id)
    .sort()

  const limit = normalizeConcurrency(maxConcurrency)
  return {
    taskIds: ready.slice(0, limit),
    deferredTaskIds: ready.slice(limit)
  }
}

export class DagValidationError extends Error {
  readonly issues: DagIssue[]

  constructor(issues: DagIssue[]) {
    super(formatDagIssues(issues))
    this.name = 'DagValidationError'
    this.issues = issues
  }
}

function normalizeTasks(tasks: DagTask[]): {
  normalized: NormalizedDagTask[]
  issues: DagIssue[]
} {
  const seen = new Set<string>()
  const normalized: NormalizedDagTask[] = []
  const issues: DagIssue[] = []

  for (const task of tasks) {
    if (seen.has(task.id)) {
      issues.push({ kind: 'duplicate_task', taskId: task.id })
      continue
    }
    seen.add(task.id)

    const deps = parseDeps(task)
    if (!deps.ok) {
      issues.push({ kind: 'invalid_deps', taskId: task.id, reason: deps.reason })
      continue
    }

    normalized.push({ id: task.id, deps: deps.value, status: task.status })
  }

  return { normalized, issues }
}

function parseDeps(task: DagTask): { ok: true; value: string[] } | { ok: false; reason: string } {
  if (Array.isArray(task.deps)) {
    return task.deps.every((dependencyId) => typeof dependencyId === 'string')
      ? { ok: true, value: uniqueSorted(task.deps) }
      : { ok: false, reason: 'deps array must contain only strings' }
  }

  try {
    const parsed = JSON.parse(task.deps) as unknown
    if (!Array.isArray(parsed) || !parsed.every((dependencyId) => typeof dependencyId === 'string')) {
      return { ok: false, reason: 'deps JSON must be a string array' }
    }
    return { ok: true, value: uniqueSorted(parsed) }
  } catch {
    return { ok: false, reason: 'deps must be valid JSON' }
  }
}

function findMissingDependencies(tasks: NormalizedDagTask[]): DagIssue[] {
  const ids = new Set(tasks.map((task) => task.id))
  return tasks.flatMap((task) =>
    task.deps
      .filter((dependencyId) => !ids.has(dependencyId))
      .map((dependencyId) => ({
        kind: 'missing_dependency' as const,
        taskId: task.id,
        dependencyId
      }))
  )
}

function findCycles(tasks: NormalizedDagTask[]): DagIssue[] {
  const byId = new Map(tasks.map((task) => [task.id, task]))
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const issues: DagIssue[] = []

  function visit(taskId: string, path: string[]): void {
    if (visited.has(taskId)) {
      return
    }
    if (visiting.has(taskId)) {
      const cycleStart = path.indexOf(taskId)
      issues.push({ kind: 'cycle', taskIds: path.slice(cycleStart) })
      return
    }

    const task = byId.get(taskId)
    if (!task) {
      return
    }

    visiting.add(taskId)
    for (const dependencyId of task.deps) {
      visit(dependencyId, [...path, dependencyId])
    }
    visiting.delete(taskId)
    visited.add(taskId)
  }

  for (const task of tasks) {
    visit(task.id, [task.id])
  }

  return issues
}

function normalizeConcurrency(maxConcurrency: number): number {
  if (!Number.isFinite(maxConcurrency) || maxConcurrency < 1) {
    return 1
  }
  return Math.floor(maxConcurrency)
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort()
}

function formatDagIssues(issues: DagIssue[]): string {
  return issues.map(formatDagIssue).join('; ')
}

function formatDagIssue(issue: DagIssue): string {
  switch (issue.kind) {
    case 'duplicate_task':
      return `duplicate task: ${issue.taskId}`
    case 'invalid_deps':
      return `invalid deps for ${issue.taskId}: ${issue.reason}`
    case 'missing_dependency':
      return `missing dependency ${issue.dependencyId} for ${issue.taskId}`
    case 'cycle':
      return `cycle detected: ${issue.taskIds.join(' -> ')}`
  }
}
