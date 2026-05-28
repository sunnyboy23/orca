import { AlertCircle, CheckCircle2, Clock3, GitBranch, PauseCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, getCurrentGate } from './orchestration-format'
import { RunStatusBadge } from './status-badge'
import type { OrchestrationRunDetail } from './types'
import { useI18n } from '@/i18n'

function CountItem({
  icon: Icon,
  label,
  value
}: {
  icon: typeof CheckCircle2
  label: string
  value: number
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
      <Icon className="size-4 text-muted-foreground" />
      <div>
        <div className="text-sm font-semibold">{value}</div>
        <div className="text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

export function RunSummary({ detail }: { detail: OrchestrationRunDetail }): React.JSX.Element {
  const { locale, messages } = useI18n()
  const { run, tasks, gates, artifacts } = detail
  const completed = tasks.filter((task) => task.status === 'completed').length
  const running = tasks.filter((task) => task.status === 'dispatched' || task.status === 'ready').length
  const blocked = tasks.filter((task) => task.status === 'blocked').length
  const failed = tasks.filter((task) => task.status === 'failed').length
  const currentGate = getCurrentGate(gates)

  return (
    <section className="border-b border-border bg-background px-6 py-5">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <RunStatusBadge status={run.status} />
            <Badge variant="outline" className="h-5 text-[10px]">
              {run.mode.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="h-5 text-[10px]">
              {run.source}
            </Badge>
          </div>
          <h1 className="truncate text-lg font-semibold tracking-tight">{run.spec}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex min-w-0 items-center gap-1">
              <GitBranch className="size-3.5" />
              <span className="truncate font-mono">{run.id}</span>
            </span>
            <span>
              {messages.orchestrationPage.updated}{' '}
              {formatDateTime(run.updated_at ?? run.created_at, locale)}
            </span>
            {run.root_repo_name ? (
              <span>
                {messages.orchestrationPage.root} {run.root_repo_name}
              </span>
            ) : null}
          </div>
        </div>
        {currentGate ? (
          <div className="max-w-sm rounded-md border border-border bg-accent px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              <PauseCircle className="size-4 text-muted-foreground" />
              {messages.orchestrationPage.waitingForDecision}
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{currentGate.question}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <CountItem icon={CheckCircle2} label={messages.orchestrationPage.counts.completed} value={completed} />
        <CountItem icon={Clock3} label={messages.orchestrationPage.counts.runningOrReady} value={running} />
        <CountItem icon={PauseCircle} label={messages.orchestrationPage.counts.blocked} value={blocked} />
        <CountItem icon={AlertCircle} label={messages.orchestrationPage.counts.failed} value={failed} />
        <CountItem icon={GitBranch} label={messages.orchestrationPage.counts.artifacts} value={artifacts.length} />
      </div>
    </section>
  )
}
