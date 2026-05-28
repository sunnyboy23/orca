import type { FeishuLocalRepoBinding } from '../../../../shared/types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { SettingsSubsectionHeader } from './SettingsFormControls'
import { useI18n, type I18nMessages } from '@/i18n'

export function FeishuRepoBindingEditor({
  bindings,
  onChange
}: {
  bindings: FeishuLocalRepoBinding[]
  onChange: (bindings: FeishuLocalRepoBinding[]) => void
}): React.JSX.Element {
  const { messages } = useI18n()
  const updateBinding = (index: number, updates: Partial<FeishuLocalRepoBinding>): void => {
    onChange(bindings.map((binding, i) => (i === index ? { ...binding, ...updates } : binding)))
  }

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <SettingsSubsectionHeader
        title={messages.feishu.localBindingsTitle}
        description={messages.feishu.localBindingsDescription}
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([...bindings, { repoName: '', localPath: '' }])}
          >
            {messages.feishu.addBinding}
          </Button>
        }
      />
      {bindings.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {messages.feishu.noBindings}
        </p>
      ) : (
        <div className="space-y-3">
          {bindings.map((binding, index) => (
            <BindingRow
              key={index}
              binding={binding}
              messages={messages}
              onUpdate={(updates) => updateBinding(index, updates)}
              onRemove={() => onChange(bindings.filter((_, i) => i !== index))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function BindingRow({
  binding,
  onUpdate,
  onRemove,
  messages
}: {
  binding: FeishuLocalRepoBinding
  onUpdate: (updates: Partial<FeishuLocalRepoBinding>) => void
  onRemove: () => void
  messages: I18nMessages
}): React.JSX.Element {
  return (
    <div className="grid gap-3 rounded-md border border-border bg-card/30 p-3 xl:grid-cols-[1fr_1.4fr_1.4fr_auto]">
      <Input
        value={binding.repoName}
        placeholder="repo_name"
        onChange={(event) => onUpdate({ repoName: event.target.value })}
      />
      <Input
        value={binding.localPath}
        placeholder={messages.feishu.localRepoPath}
        onChange={(event) => onUpdate({ localPath: event.target.value })}
      />
      <Input
        value={binding.worktreePath ?? ''}
        placeholder={messages.feishu.optionalWorktreePath}
        onChange={(event) => onUpdate({ worktreePath: event.target.value })}
      />
      <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
        {messages.common.remove}
      </Button>
    </div>
  )
}
