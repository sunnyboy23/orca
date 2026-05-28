import { AlertCircle, GitBranch, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store'
import { RunDetail } from './RunDetail'
import { RunList } from './RunList'
import { useOrchestrationRuns } from './use-orchestration-runs'
import { useI18n } from '@/i18n'

function PageShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div className="flex min-h-0 flex-1 flex-col bg-background">{children}</div>
}

function CenterState({
  icon: Icon,
  title,
  body,
  action
}: {
  icon: typeof GitBranch
  title: string
  body: string
  action?: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <Icon className="size-7 text-muted-foreground" />
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs leading-5 text-muted-foreground">{body}</p>
        </div>
        {action}
      </div>
    </div>
  )
}

export default function OrchestrationRunsPage(): React.JSX.Element {
  const { messages } = useI18n()
  const closeOrchestrationPage = useAppStore((s) => s.closeOrchestrationPage)
  const { state, selectedRunId, selectRun, refresh } = useOrchestrationRuns()

  return (
    <PageShell>
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex min-w-0 items-center gap-2">
          <GitBranch className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <div className="text-sm font-semibold">{messages.orchestrationPage.title}</div>
            <div className="text-[11px] text-muted-foreground">
              {messages.orchestrationPage.subtitle}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={messages.orchestrationPage.refreshRuns}
            onClick={() => {
              void refresh()
            }}
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={closeOrchestrationPage}>
            {messages.orchestrationPage.back}
          </Button>
        </div>
      </header>

      {state.kind === 'loading' ? (
        <CenterState
          icon={Loader2}
          title={messages.orchestrationPage.loadingRuns}
          body={messages.orchestrationPage.loadingRunsBody}
        />
      ) : null}

      {state.kind === 'empty' ? (
        <CenterState
          icon={GitBranch}
          title={messages.orchestrationPage.noRuns}
          body={messages.orchestrationPage.noRunsBody}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void refresh()
              }}
            >
              <RefreshCw className="size-4" />
              {messages.orchestrationPage.refresh}
            </Button>
          }
        />
      ) : null}

      {state.kind === 'error' ? (
        <CenterState
          icon={AlertCircle}
          title={messages.orchestrationPage.loadError}
          body={state.message}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void refresh()
              }}
            >
              <RefreshCw className="size-4" />
              {messages.orchestrationPage.retry}
            </Button>
          }
        />
      ) : null}

      {state.kind === 'ready' ? (
        <div className="flex min-h-0 flex-1">
          <RunList runs={state.runs} selectedRunId={selectedRunId} onSelect={selectRun} />
          <RunDetail detail={state.detail} />
        </div>
      ) : null}
    </PageShell>
  )
}
