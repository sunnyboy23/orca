import type { GlobalSettings } from '../../../../shared/types'
import { Label } from '../ui/label'
import { useAppStore } from '../../store'
import { SearchableSetting } from './SearchableSetting'
import { matchesSettingsSearch } from './settings-search'
import {
  EXPERIMENTAL_PANE_SEARCH_ENTRIES,
  getExperimentalPaneSearchEntries,
  getExperimentalSearchEntry
} from './experimental-search'
import { HiddenExperimentalGroup } from './HiddenExperimentalGroup'
import { useI18n } from '@/i18n'

export { EXPERIMENTAL_PANE_SEARCH_ENTRIES, getExperimentalPaneSearchEntries }

type ExperimentalPaneProps = {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void
  /** Hidden-experimental group is only rendered once the user has unlocked
   *  it via Shift-clicking the Experimental sidebar entry. */
  hiddenExperimentalUnlocked?: boolean
}

export function ExperimentalPane({
  settings,
  updateSettings,
  hiddenExperimentalUnlocked = false
}: ExperimentalPaneProps): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.settingsPanes.experimental
  const experimentalSearchEntry = getExperimentalSearchEntry(copy)
  const searchQuery = useAppStore((s) => s.settingsSearchQuery)
  const showPet = matchesSettingsSearch(searchQuery, [experimentalSearchEntry.pet])
  const showAgentsView = matchesSettingsSearch(searchQuery, [experimentalSearchEntry.activity])
  const showWorktreeSymlinks = matchesSettingsSearch(searchQuery, [
    experimentalSearchEntry.symlinks
  ])

  return (
    <div className="space-y-4">
      {showPet ? (
        <SearchableSetting
          title={copy.pet.title}
          description={copy.pet.description}
          keywords={copy.pet.keywords}
          className="space-y-3 py-2"
          id="experimental-pet"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 shrink space-y-1.5">
              <Label>{copy.pet.title}</Label>
              <p className="text-xs text-muted-foreground">{copy.pet.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.experimentalPet}
              onClick={() => {
                updateSettings({ experimentalPet: !settings.experimentalPet })
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors ${
                settings.experimentalPet ? 'bg-foreground' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-background shadow-sm transition-transform ${
                  settings.experimentalPet ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </SearchableSetting>
      ) : null}

      {showAgentsView ? (
        <SearchableSetting
          title={copy.agentsView.title}
          description={copy.agentsView.description}
          keywords={copy.agentsView.keywords}
          className="space-y-3 py-2"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 shrink space-y-0.5">
              <Label>{copy.agentsView.title}</Label>
              <p className="text-xs text-muted-foreground">{copy.agentsView.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.experimentalActivity}
              onClick={() =>
                updateSettings({
                  experimentalActivity: !settings.experimentalActivity
                })
              }
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors ${
                settings.experimentalActivity ? 'bg-foreground' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-background shadow-sm transition-transform ${
                  settings.experimentalActivity ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </SearchableSetting>
      ) : null}

      {showWorktreeSymlinks ? (
        <SearchableSetting
          title={copy.symlinks.title}
          description={copy.symlinks.description}
          keywords={copy.symlinks.keywords}
          className="space-y-3 py-2"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 shrink space-y-0.5">
              <Label>{copy.symlinks.title}</Label>
              <p className="text-xs text-muted-foreground">{copy.symlinks.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.experimentalWorktreeSymlinks}
              onClick={() =>
                updateSettings({
                  experimentalWorktreeSymlinks: !settings.experimentalWorktreeSymlinks
                })
              }
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors ${
                settings.experimentalWorktreeSymlinks ? 'bg-foreground' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-background shadow-sm transition-transform ${
                  settings.experimentalWorktreeSymlinks ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </SearchableSetting>
      ) : null}

      {hiddenExperimentalUnlocked ? <HiddenExperimentalGroup /> : null}
    </div>
  )
}
