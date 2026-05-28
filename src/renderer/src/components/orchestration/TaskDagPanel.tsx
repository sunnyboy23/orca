import { CircleDot, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { parseTaskDeps, getTaskError } from './orchestration-format'
import { TaskStatusBadge } from './status-badge'
import type { OrchestrationTask } from './types'
import { useI18n } from '@/i18n'

export function TaskDagPanel({ tasks }: { tasks: OrchestrationTask[] }): React.JSX.Element {
  const { locale, messages } = useI18n()
  if (tasks.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
        {messages.orchestrationPage.noTasks}
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-border bg-background">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">{messages.orchestrationPage.taskDag}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {messages.orchestrationPage.taskDagDescription}
        </p>
      </div>
      <div className="divide-y divide-border">
        {tasks.map((task) => {
          const deps = parseTaskDeps(task)
          const error = getTaskError(task, locale)
          return (
            <div key={task.id} className="grid gap-3 px-4 py-3 lg:grid-cols-[1fr_220px]">
              <div className="min-w-0 space-y-2">
                <div className="flex min-w-0 items-start gap-2">
                  <CircleDot className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">{task.spec}</span>
                      <TaskStatusBadge status={task.status} />
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                      {task.id}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-5">
                  {deps.length > 0 ? (
                    deps.map((dep) => (
                      <Badge key={dep} variant="outline" className="h-5 font-mono text-[10px]">
                        {messages.orchestrationPage.depends(dep)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[11px] text-muted-foreground">
                      {messages.orchestrationPage.noDependencies}
                    </span>
                  )}
                </div>
                {error ? <p className="pl-5 text-xs leading-5 text-destructive">{error}</p> : null}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <FileText className="size-3.5" />
                  <span className="truncate">
                    {task.artifact_dir ?? messages.orchestrationPage.noArtifactDir}
                  </span>
                </div>
                <div className="truncate">
                  {messages.orchestrationPage.repo}: {task.repo_name ?? messages.orchestrationPage.unassigned}
                </div>
                <div className="truncate">
                  {messages.orchestrationPage.worktree}:{' '}
                  {task.worktree_selector ?? messages.orchestrationPage.unresolved}
                </div>
                <div className="truncate">
                  {messages.orchestrationPage.agent}:{' '}
                  {task.assignee_handle ?? messages.orchestrationPage.notDispatched}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
