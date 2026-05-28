import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { z } from 'zod'
import type { OrchestratorTaskSpec } from './output-parser'
import { validateTaskDag, type DagIssue } from '../orchestration/dag'

export type FullstackDagConversion = {
  groupId?: string
  requirement: string
  status?: string
  requiredArtifacts: FullstackArtifactRequirement[]
  tasks: OrchestratorTaskSpec[]
}

export type FullstackArtifactRequirement = {
  key: string
  description?: string
}

export type FullstackConversionError = {
  kind:
    | 'cli_failed'
    | 'file_read_failed'
    | 'invalid_json'
    | 'invalid_schema'
    | 'missing_tasks'
    | 'invalid_dag'
  message: string
  stdout?: string
  stderr?: string
  issues?: DagIssue[]
}

export type FullstackConversionResult =
  | { ok: true; conversion: FullstackDagConversion }
  | { ok: false; error: FullstackConversionError }

export type FullstackCliExecution = {
  exitCode: number
  stdout?: string
  stderr?: string
}

const MAX_CLI_SUMMARY_LENGTH = 2000

const FullstackArtifactRequirementSchema = z.object({
  key: z.string().min(1),
  description: z.string().min(1).optional()
})

const FullstackTaskSchema = z.object({
  task_id: z.string().min(1),
  engineer_id: z.string().min(1).optional(),
  project: z.string().min(1).optional(),
  description: z.string().min(1),
  depends_on: z.array(z.string().min(1)).default([]),
  status: z.string().min(1).optional(),
  retry_count: z.number().int().nonnegative().optional(),
  verification_status: z.string().min(1).optional(),
  closeout_status: z.string().min(1).optional(),
  task_contract: z.record(z.string(), z.unknown()).optional()
})

const FullstackStateSchema = z.object({
  task_group_id: z.string().min(1).optional(),
  requirement: z.string().min(1).default(''),
  status: z.string().min(1).optional(),
  tasks: z
    .union([z.record(z.string(), FullstackTaskSchema), z.array(FullstackTaskSchema)])
    .optional(),
  required_artifacts: z.array(FullstackArtifactRequirementSchema).default([])
})

type FullstackState = z.infer<typeof FullstackStateSchema>
type FullstackTask = z.infer<typeof FullstackTaskSchema>

export async function readFullstackDagFromFile(filePath: string): Promise<FullstackConversionResult> {
  let text: string
  try {
    text = await readFile(filePath, 'utf8')
  } catch (err) {
    return {
      ok: false,
      error: {
        kind: 'file_read_failed',
        message: err instanceof Error ? err.message : `Failed to read ${filePath}`
      }
    }
  }

  return convertFullstackJsonText(text)
}

export function convertFullstackCliExecution(
  execution: FullstackCliExecution
): FullstackConversionResult {
  if (execution.exitCode !== 0) {
    return {
      ok: false,
      error: {
        kind: 'cli_failed',
        message: `helloagents fullstack exited with code ${execution.exitCode}`,
        stdout: summarizeCliText(execution.stdout),
        stderr: summarizeCliText(execution.stderr)
      }
    }
  }

  return convertFullstackJsonText(execution.stdout ?? '')
}

export function convertFullstackJsonText(text: string): FullstackConversionResult {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch (err) {
    return {
      ok: false,
      error: {
        kind: 'invalid_json',
        message: err instanceof Error ? err.message : 'Invalid fullstack JSON'
      }
    }
  }

  return convertFullstackState(value)
}

export function convertFullstackState(value: unknown): FullstackConversionResult {
  const parsed = FullstackStateSchema.safeParse(value)
  if (!parsed.success) {
    return {
      ok: false,
      error: { kind: 'invalid_schema', message: z.prettifyError(parsed.error) }
    }
  }

  const tasks = normalizeTasks(parsed.data)
  if (tasks.length === 0) {
    return {
      ok: false,
      error: { kind: 'missing_tasks', message: 'Fullstack state does not contain tasks' }
    }
  }

  const orchestratorTasks = tasks.map((task) => toOrchestratorTask(task, parsed.data))
  const dagValidation = validateTaskDag(orchestratorTasks)
  if (!dagValidation.ok) {
    return {
      ok: false,
      error: {
        kind: 'invalid_dag',
        message: 'Fullstack tasks contain invalid dependencies',
        issues: dagValidation.issues
      }
    }
  }

  return {
    ok: true,
    conversion: {
      groupId: parsed.data.task_group_id,
      requirement: parsed.data.requirement,
      status: parsed.data.status,
      requiredArtifacts: parsed.data.required_artifacts,
      tasks: orchestratorTasks
    }
  }
}

function normalizeTasks(state: FullstackState): FullstackTask[] {
  if (!state.tasks) {
    return []
  }

  const tasks = Array.isArray(state.tasks) ? state.tasks : Object.values(state.tasks)
  return tasks.sort((left, right) => left.task_id.localeCompare(right.task_id))
}

function toOrchestratorTask(task: FullstackTask, state: FullstackState): OrchestratorTaskSpec {
  const repoName = task.project ? basename(task.project) : undefined
  return {
    id: task.task_id,
    title: buildTaskTitle(task),
    spec: buildTaskSpec(task, state, repoName),
    repoName,
    deps: [...new Set(task.depends_on)].sort(),
    artifactRequired: true
  }
}

function buildTaskTitle(task: FullstackTask): string {
  const owner = task.engineer_id ? `${task.engineer_id}: ` : ''
  return `${owner}${task.description}`
}

function buildTaskSpec(task: FullstackTask, state: FullstackState, repoName?: string): string {
  const lines = [
    `Fullstack requirement: ${state.requirement || '(not provided)'}`,
    `Task: ${task.description}`,
    `Engineer: ${task.engineer_id ?? 'unassigned'}`,
    `Repo name: ${repoName ?? 'unresolved'}`
  ]

  if (task.project) {
    // Fullstack runtime may contain absolute paths from another host/worktree.
    lines.push('Project path: redacted; resolve repo_name through Orca Team Config before dispatch')
  }
  if (task.status) {
    lines.push(`Fullstack status: ${task.status}`)
  }
  if (task.verification_status) {
    lines.push(`Verification status: ${task.verification_status}`)
  }
  if (task.closeout_status) {
    lines.push(`Closeout status: ${task.closeout_status}`)
  }

  const requiredArtifacts = extractTaskArtifactKeys(task.task_contract)
  if (requiredArtifacts.length > 0) {
    lines.push(`Required artifacts: ${requiredArtifacts.join(', ')}`)
  }

  return lines.join('\n')
}

function extractTaskArtifactKeys(contract: Record<string, unknown> | undefined): string[] {
  const value = contract?.required_artifacts
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return item
      }
      if (item && typeof item === 'object' && 'key' in item) {
        const key = (item as { key?: unknown }).key
        return typeof key === 'string' ? key : ''
      }
      return ''
    })
    .filter(Boolean)
    .sort()
}

function summarizeCliText(text: string | undefined): string | undefined {
  if (!text) {
    return undefined
  }
  const trimmed = text.trim()
  if (trimmed.length <= MAX_CLI_SUMMARY_LENGTH) {
    return trimmed
  }
  return `${trimmed.slice(0, MAX_CLI_SUMMARY_LENGTH)}...`
}
