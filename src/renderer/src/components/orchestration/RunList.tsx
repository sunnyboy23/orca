import { GitBranch } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatDateTime } from './orchestration-format'
import { RunStatusBadge } from './status-badge'
import type { OrchestrationRun } from './types'
import { useI18n } from '@/i18n'

export function RunList({
  runs,
  selectedRunId,
  onSelect
}: {
  runs: OrchestrationRun[]
  selectedRunId: string | null
  onSelect: (runId: string) => void
}): React.JSX.Element {
  const { locale, messages } = useI18n()
  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-r border-border bg-background">
      <div className="border-b border-border px-4 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          {messages.orchestrationPage.runs}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {messages.orchestrationPage.recorded(runs.length)}
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-1 p-2">
          {runs.map((run) => (
            <button
              key={run.id}
              type="button"
              data-current={selectedRunId === run.id ? 'true' : undefined}
              onClick={() => onSelect(run.id)}
              className={cn(
                'flex w-full min-w-0 flex-col gap-2 rounded-md border border-transparent px-3 py-2.5 text-left transition-colors',
                selectedRunId === run.id
                  ? 'border-border bg-accent text-accent-foreground'
                  : 'hover:bg-accent'
              )}
            >
              <div className="flex min-w-0 items-start gap-2">
                <GitBranch className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{run.spec}</div>
                  <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                    {run.id}
                  </div>
                </div>
                <RunStatusBadge status={run.status} />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{run.mode.toUpperCase()}</span>
                <span>·</span>
                <span>{run.source}</span>
                <span>·</span>
                <span>{formatDateTime(run.updated_at ?? run.created_at, locale)}</span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
