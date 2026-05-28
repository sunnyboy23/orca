import { z } from 'zod'

export type OrchestratorOutputParseResult =
  | { ok: true; event: OrchestratorOutputEvent }
  | { ok: false; error: OrchestratorOutputParseError }

export type OrchestratorOutputParseError = {
  kind: 'missing_block' | 'invalid_json' | 'invalid_schema'
  message: string
}

export type OrchestratorOutputEvent =
  | RoutingEvent
  | GateEvent
  | TaskDagEvent
  | RunStatusEvent

export type RoutingEvent = {
  type: 'routing'
  mode: 'r0' | 'r1' | 'r2' | 'fullstack'
  summary: string
  response?: string
  task?: OrchestratorTaskSpec
}

export type GateEvent = {
  type: 'gate'
  gateId?: string
  question: string
  options: string[]
}

export type TaskDagEvent = {
  type: 'task_dag'
  tasks: OrchestratorTaskSpec[]
}

export type RunStatusEvent = {
  type: 'run_status'
  status: 'completed' | 'failed' | 'blocked'
  summary: string
  reason?: string
}

export type OrchestratorTaskSpec = {
  id: string
  title: string
  spec: string
  repoName?: string
  deps: string[]
  artifactRequired: boolean
}

const RawTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  spec: z.string().min(1),
  repo_name: z.string().min(1).optional(),
  repoName: z.string().min(1).optional(),
  deps: z.array(z.string().min(1)).default([]),
  artifact_required: z.boolean().optional(),
  artifactRequired: z.boolean().optional()
})

const RoutingSchema = z.object({
  type: z.literal('routing').optional(),
  mode: z.enum(['r0', 'r1', 'r2', 'fullstack']),
  summary: z.string().min(1),
  response: z.string().min(1).optional(),
  task: RawTaskSchema.optional()
})

const GateSchema = z.object({
  type: z.literal('gate').optional(),
  gateId: z.string().min(1).optional(),
  gate_id: z.string().min(1).optional(),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).default([])
})

const TaskDagSchema = z.object({
  type: z.literal('task_dag').optional(),
  tasks: z.array(RawTaskSchema).min(1)
})

const RunStatusSchema = z.object({
  type: z.literal('run_status').optional(),
  status: z.enum(['completed', 'failed', 'blocked']),
  summary: z.string().min(1),
  reason: z.string().min(1).optional()
})

const TypedEventSchema = z.discriminatedUnion('type', [
  RoutingSchema.required({ type: true }),
  GateSchema.required({ type: true }),
  TaskDagSchema.required({ type: true }),
  RunStatusSchema.required({ type: true })
])

const FENCED_JSON_RE = /```(?:json|orchestrator-event|helloagents)\s*([\s\S]*?)```/i

export function parseOrchestratorOutput(text: string): OrchestratorOutputParseResult {
  const jsonText = extractFencedJson(text)
  if (!jsonText) {
    return {
      ok: false,
      error: { kind: 'missing_block', message: 'No fenced Orchestrator JSON block found' }
    }
  }

  let value: unknown
  try {
    value = JSON.parse(jsonText)
  } catch (err) {
    return {
      ok: false,
      error: {
        kind: 'invalid_json',
        message: err instanceof Error ? err.message : 'Invalid JSON'
      }
    }
  }

  return parseOrchestratorEvent(value)
}

export function parseOrchestratorEvent(value: unknown): OrchestratorOutputParseResult {
  const normalized = inferEventType(value)
  const parsed = TypedEventSchema.safeParse(normalized)
  if (!parsed.success) {
    return {
      ok: false,
      error: { kind: 'invalid_schema', message: z.prettifyError(parsed.error) }
    }
  }
  return { ok: true, event: normalizeEvent(parsed.data) }
}

function extractFencedJson(text: string): string | null {
  const match = FENCED_JSON_RE.exec(text)
  return match?.[1]?.trim() || null
}

function inferEventType(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value
  }
  const record = value as Record<string, unknown>
  if (typeof record.type === 'string') {
    return record
  }
  if (typeof record.mode === 'string') {
    return { ...record, type: 'routing' }
  }
  if (Array.isArray(record.tasks)) {
    return { ...record, type: 'task_dag' }
  }
  if (typeof record.question === 'string') {
    return { ...record, type: 'gate' }
  }
  if (typeof record.status === 'string') {
    return { ...record, type: 'run_status' }
  }
  return record
}

function normalizeEvent(value: z.infer<typeof TypedEventSchema>): OrchestratorOutputEvent {
  switch (value.type) {
    case 'routing':
      return {
        type: 'routing',
        mode: value.mode,
        summary: value.summary,
        response: value.response,
        task: value.task ? normalizeTask(value.task) : undefined
      }
    case 'gate':
      return {
        type: 'gate',
        gateId: value.gateId ?? value.gate_id,
        question: value.question,
        options: value.options
      }
    case 'task_dag':
      return {
        type: 'task_dag',
        tasks: value.tasks.map(normalizeTask)
      }
    case 'run_status':
      return {
        type: 'run_status',
        status: value.status,
        summary: value.summary,
        reason: value.reason
      }
  }
}

function normalizeTask(value: z.infer<typeof RawTaskSchema>): OrchestratorTaskSpec {
  return {
    id: value.id,
    title: value.title,
    spec: value.spec,
    repoName: value.repoName ?? value.repo_name,
    deps: value.deps,
    artifactRequired: value.artifactRequired ?? value.artifact_required ?? true
  }
}
