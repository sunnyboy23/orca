import { Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArtifactsPanel } from './ArtifactsPanel'
import { GatesPanel } from './GatesPanel'
import { RunSummary } from './RunSummary'
import { TaskDagPanel } from './TaskDagPanel'
import type { OrchestrationRunDetail } from './types'
import { useI18n } from '@/i18n'

export function RunDetail({
  detail
}: {
  detail: OrchestrationRunDetail | null
}): React.JSX.Element {
  const { messages } = useI18n()
  if (!detail) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        {messages.orchestrationPage.loadingRunDetail}
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-muted/20">
      <RunSummary detail={detail} />
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 p-6">
          <TaskDagPanel tasks={detail.tasks} />
          <div className="grid gap-4 xl:grid-cols-2">
            <GatesPanel gates={detail.gates} />
            <ArtifactsPanel artifacts={detail.artifacts} />
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
