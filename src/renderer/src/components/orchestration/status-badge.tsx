import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OrchestrationRunStatus, OrchestrationTaskStatus } from './types'
import { runStatusLabel, taskStatusLabel } from './orchestration-format'
import { useI18n } from '@/i18n'

type BadgeTone = 'neutral' | 'active' | 'success' | 'danger' | 'blocked' | 'waiting'

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'border-border text-muted-foreground',
  active: 'border-ring/40 bg-accent text-accent-foreground',
  success: 'border-border bg-secondary text-secondary-foreground',
  danger: 'border-destructive/35 text-destructive',
  blocked: 'border-destructive/30 bg-destructive/10 text-destructive',
  waiting: 'border-border text-muted-foreground'
}

function runTone(status: OrchestrationRunStatus): BadgeTone {
  if (status === 'running') {
    return 'active'
  }
  if (status === 'completed') {
    return 'success'
  }
  if (status === 'failed') {
    return 'danger'
  }
  return 'neutral'
}

function taskTone(status: OrchestrationTaskStatus): BadgeTone {
  if (status === 'dispatched' || status === 'ready') {
    return 'active'
  }
  if (status === 'completed') {
    return 'success'
  }
  if (status === 'failed') {
    return 'danger'
  }
  if (status === 'blocked') {
    return 'blocked'
  }
  return 'waiting'
}

export function RunStatusBadge({ status }: { status: OrchestrationRunStatus }): React.JSX.Element {
  const { locale } = useI18n()
  return (
    <Badge variant="outline" className={cn('h-5 text-[10px]', toneClasses[runTone(status)])}>
      {runStatusLabel(status, locale)}
    </Badge>
  )
}

export function TaskStatusBadge({
  status
}: {
  status: OrchestrationTaskStatus
}): React.JSX.Element {
  const { locale } = useI18n()
  return (
    <Badge variant="outline" className={cn('h-5 text-[10px]', toneClasses[taskTone(status)])}>
      {taskStatusLabel(status, locale)}
    </Badge>
  )
}
