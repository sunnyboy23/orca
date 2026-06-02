import React from 'react'
import { Info } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Field } from './automation-page-parts'
import type { AutomationDraft } from './AutomationEditorDialog'

type AutomationSessionFieldProps = {
  draft: AutomationDraft
  toggleItemClassName: string
  onDraftChange: (updater: (current: AutomationDraft) => AutomationDraft) => void
}

export function AutomationSessionField({
  draft,
  toggleItemClassName,
  onDraftChange
}: AutomationSessionFieldProps): React.JSX.Element {
  return (
    <Field
      label={
        <span className="inline-flex items-center gap-1">
          会话
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="会话复用说明"
                className="rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <Info className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6} className="max-w-72">
              复用会把后续运行发送到上一次仍在线的自动化会话；如果该会话已不存在，Orca
              会启动一个新会话。
            </TooltipContent>
          </Tooltip>
        </span>
      }
    >
      <ToggleGroup
        type="single"
        value={draft.workspaceMode === 'existing' && draft.reuseSession ? 'reuse' : 'fresh'}
        onValueChange={(value) => {
          if (!value) {
            return
          }
          onDraftChange((current) => ({
            ...current,
            reuseSession: value === 'reuse',
            workspaceMode: value === 'reuse' ? 'existing' : current.workspaceMode
          }))
        }}
        variant="outline"
        size="sm"
        className="grid w-full grid-cols-2"
      >
        <ToggleGroupItem value="fresh" className={toggleItemClassName}>
          新建
        </ToggleGroupItem>
        <ToggleGroupItem value="reuse" className={toggleItemClassName}>
          复用
        </ToggleGroupItem>
      </ToggleGroup>
    </Field>
  )
}
