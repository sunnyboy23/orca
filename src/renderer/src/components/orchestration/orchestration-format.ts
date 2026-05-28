import type {
  OrchestrationArtifact,
  OrchestrationGate,
  OrchestrationRunStatus,
  OrchestrationTask,
  OrchestrationTaskStatus
} from './types'
import { getMessages } from '@/i18n'
import type { SupportedLocale } from '@/i18n'

export function runStatusLabel(
  status: OrchestrationRunStatus,
  locale: SupportedLocale = 'en'
): string {
  return getMessages(locale).orchestrationPage.runStatus[status]
}

export function taskStatusLabel(
  status: OrchestrationTaskStatus,
  locale: SupportedLocale = 'en'
): string {
  return getMessages(locale).orchestrationPage.taskStatus[status]
}

export function formatDateTime(
  value: string | null | undefined,
  locale?: SupportedLocale
): string {
  if (!value) {
    return getMessages(locale ?? 'en').orchestrationPage.unknown
  }
  const parsed = Date.parse(value)
  if (!Number.isFinite(parsed)) {
    return value
  }
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(parsed))
}

export function safeJsonArray<T>(value: string | null | undefined): T[] {
  if (!value) {
    return []
  }
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

export function parseTaskDeps(task: Pick<OrchestrationTask, 'deps'>): string[] {
  return safeJsonArray<string>(task.deps)
}

export function parseGateOptions(gate: Pick<OrchestrationGate, 'options'>): string[] {
  return safeJsonArray<string>(gate.options)
}

export function parseArtifactFiles(artifact: Pick<OrchestrationArtifact, 'files_changed'>): string[] {
  return safeJsonArray<string>(artifact.files_changed)
}

export function getTaskError(
  task: Pick<OrchestrationTask, 'result' | 'status'>,
  locale: SupportedLocale = 'en'
): string | null {
  if (task.status !== 'failed' && task.status !== 'blocked') {
    return null
  }
  const messages = getMessages(locale).orchestrationPage
  if (!task.result) {
    return task.status === 'blocked' ? messages.taskBlocked : messages.taskFailed
  }
  try {
    const parsed = JSON.parse(task.result) as Record<string, unknown>
    if (typeof parsed.reason === 'string') {
      return parsed.reason
    }
    if (typeof parsed.error === 'string') {
      return parsed.error
    }
    if (typeof parsed.blockedBy === 'string') {
      return messages.blockedBy(parsed.blockedBy)
    }
  } catch {
    return task.result
  }
  return task.result
}

export function getCurrentGate(gates: OrchestrationGate[]): OrchestrationGate | null {
  return gates.find((gate) => gate.status === 'pending') ?? null
}
