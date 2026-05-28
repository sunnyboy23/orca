import type { GlobalSettings } from '../../../../shared/types'
import { useI18n } from '@/i18n'
import { Label } from '../ui/label'
import { getAgentAwakeDescription, getAgentAwakeSearchKeywords } from './agent-awake-copy'
import { SearchableSetting } from './SearchableSetting'

type AgentAwakeSettingProps = {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void
}

export function AgentAwakeSetting({
  settings,
  updateSettings
}: AgentAwakeSettingProps): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.settingsPanes.agents
  const title = copy.awake.title
  const description = getAgentAwakeDescription(copy)

  return (
    <section className="space-y-3">
      <SearchableSetting
        title={title}
        description={description}
        keywords={getAgentAwakeSearchKeywords(copy)}
      >
        <div className="flex items-start justify-between gap-4 py-2">
          <div className="min-w-0 flex-1 space-y-0.5">
            <Label>{title}</Label>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {/* Why: this button is read directly from the React element tree by tests
              that walk props (without rendering), so the role/aria attributes
              must remain on a literal <button>, not behind a component wrapper. */}
          <button
            type="button"
            role="switch"
            aria-label={title}
            aria-checked={settings.keepComputerAwakeWhileAgentsRun}
            onClick={() =>
              updateSettings({
                keepComputerAwakeWhileAgentsRun: !settings.keepComputerAwakeWhileAgentsRun
              })
            }
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors ${
              settings.keepComputerAwakeWhileAgentsRun ? 'bg-foreground' : 'bg-muted-foreground/30'
            } outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50`}
          >
            <span
              className={`pointer-events-none block size-3.5 rounded-full bg-background shadow-sm transition-transform ${
                settings.keepComputerAwakeWhileAgentsRun ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </SearchableSetting>
    </section>
  )
}
