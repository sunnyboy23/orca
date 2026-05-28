import { Archive } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, parseArtifactFiles } from './orchestration-format'
import type { OrchestrationArtifact } from './types'
import { useI18n } from '@/i18n'

export function ArtifactsPanel({
  artifacts
}: {
  artifacts: OrchestrationArtifact[]
}): React.JSX.Element {
  const { locale, messages } = useI18n()
  return (
    <section className="rounded-lg border border-border bg-background">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">{messages.orchestrationPage.artifactsTitle}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {messages.orchestrationPage.artifactsDescription}
        </p>
      </div>
      {artifacts.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          {messages.orchestrationPage.noArtifacts}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {artifacts.map((artifact) => {
            const files = parseArtifactFiles(artifact)
            return (
              <div key={artifact.id} className="space-y-2 px-4 py-3">
                <div className="flex min-w-0 items-start gap-2">
                  <Archive className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="truncate font-mono text-sm">{artifact.manifest_path}</span>
                      <Badge variant="outline" className="h-5 text-[10px]">
                        {artifact.status}
                      </Badge>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {messages.orchestrationPage.task} {artifact.task_id} ·{' '}
                      {messages.orchestrationPage.updated.toLowerCase()}{' '}
                      {formatDateTime(artifact.updated_at, locale)}
                    </div>
                  </div>
                </div>
                <div className="space-y-1 pl-6">
                  {files.length > 0 ? (
                    files.slice(0, 6).map((file) => (
                      <div key={file} className="truncate font-mono text-[11px] text-muted-foreground">
                        {file}
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-muted-foreground">
                      {messages.orchestrationPage.noChangedFiles}
                    </div>
                  )}
                  {files.length > 6 ? (
                    <div className="text-[11px] text-muted-foreground">
                      {messages.orchestrationPage.moreFiles(files.length - 6)}
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
