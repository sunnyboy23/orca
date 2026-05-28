import { MessageSquareWarning } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, parseGateOptions } from './orchestration-format'
import type { OrchestrationGate } from './types'
import { useI18n } from '@/i18n'

export function GatesPanel({ gates }: { gates: OrchestrationGate[] }): React.JSX.Element {
  const { locale, messages } = useI18n()
  return (
    <section className="rounded-lg border border-border bg-background">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">{messages.orchestrationPage.gates}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {messages.orchestrationPage.gatesDescription}
        </p>
      </div>
      {gates.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          {messages.orchestrationPage.noGates}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {gates.map((gate) => {
            const options = parseGateOptions(gate)
            return (
              <div key={gate.id} className="space-y-2 px-4 py-3">
                <div className="flex items-start gap-2">
                  <MessageSquareWarning className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{gate.question}</span>
                      <Badge variant="outline" className="h-5 text-[10px]">
                        {gate.status}
                      </Badge>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                      {gate.id} · {messages.orchestrationPage.task} {gate.task_id} ·{' '}
                      {formatDateTime(gate.created_at, locale)}
                    </div>
                  </div>
                </div>
                {options.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pl-6">
                    {options.map((option) => (
                      <Badge key={option} variant="outline" className="h-5 text-[10px]">
                        {option}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                {gate.resolution ? (
                  <p className="pl-6 text-xs text-muted-foreground">
                    {messages.orchestrationPage.resolved}: {gate.resolution}
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
