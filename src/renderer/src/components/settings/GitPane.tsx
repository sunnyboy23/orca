import type { GlobalSettings } from '../../../../shared/types'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useAppStore } from '../../store'
import { getGitPaneSearchEntries, GIT_PANE_SEARCH_ENTRIES } from './git-search'
import { SearchableSetting } from './SearchableSetting'
import { matchesSettingsSearch } from './settings-search'
import { GitHubRateLimitPanel } from '../github/github-rate-limit-display'
import { useI18n } from '@/i18n'

export { GIT_PANE_SEARCH_ENTRIES }

type GitPaneProps = {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void
  displayedGitUsername: string
}

export function GitPane({
  settings,
  updateSettings,
  displayedGitUsername
}: GitPaneProps): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.settingsPanes.git
  const searchQuery = useAppStore((s) => s.settingsSearchQuery)
  const searchEntries = getGitPaneSearchEntries(copy)

  const visibleSections = [
    matchesSettingsSearch(searchQuery, searchEntries[0]) ? (
      <SearchableSetting
        key="branch-prefix"
        title={copy.branchPrefix.title}
        description={copy.branchPrefix.description}
        keywords={copy.branchPrefix.keywords}
        className="space-y-3"
      >
        <div className="flex w-fit gap-1 rounded-md border border-border/50 p-1">
          {(['git-username', 'custom', 'none'] as const).map((option) => (
            <button
              key={option}
              onClick={() => updateSettings({ branchPrefix: option })}
              className={`rounded-sm px-3 py-1 text-sm transition-colors ${
                settings.branchPrefix === option
                  ? 'bg-accent font-medium text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {option === 'git-username'
                ? copy.branchPrefix.options.gitUsername
                : option === 'custom'
                  ? copy.branchPrefix.options.custom
                  : copy.branchPrefix.options.none}
            </button>
          ))}
        </div>
        {(settings.branchPrefix === 'custom' || settings.branchPrefix === 'git-username') && (
          <Input
            value={
              settings.branchPrefix === 'git-username'
                ? displayedGitUsername
                : settings.branchPrefixCustom
            }
            onChange={(e) => updateSettings({ branchPrefixCustom: e.target.value })}
            placeholder={
              settings.branchPrefix === 'git-username'
                ? copy.branchPrefix.noGitUsername
                : copy.branchPrefix.customPlaceholder
            }
            className="max-w-xs"
            readOnly={settings.branchPrefix === 'git-username'}
          />
        )}
      </SearchableSetting>
    ) : null,
    matchesSettingsSearch(searchQuery, searchEntries[1]) ? (
      <SearchableSetting
        key="refresh-base-ref"
        title={copy.refreshLocalBaseRef.title}
        description={copy.refreshLocalBaseRef.description}
        keywords={copy.refreshLocalBaseRef.keywords}
        className="flex items-center justify-between gap-4 py-2"
      >
        <div className="space-y-0.5">
          <Label>{copy.refreshLocalBaseRef.title}</Label>
          <p className="text-xs text-muted-foreground">{copy.refreshLocalBaseRef.rowDescription}</p>
        </div>
        <button
          role="switch"
          aria-checked={settings.refreshLocalBaseRefOnWorktreeCreate}
          onClick={() =>
            updateSettings({
              refreshLocalBaseRefOnWorktreeCreate: !settings.refreshLocalBaseRefOnWorktreeCreate
            })
          }
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors ${
            settings.refreshLocalBaseRefOnWorktreeCreate
              ? 'bg-foreground'
              : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`pointer-events-none block size-3.5 rounded-full bg-background shadow-sm transition-transform ${
              settings.refreshLocalBaseRefOnWorktreeCreate ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </SearchableSetting>
    ) : null,
    matchesSettingsSearch(searchQuery, searchEntries[2]) ? (
      <SearchableSetting
        key="github-api-budget"
        title={copy.githubApiBudget.title}
        description={copy.githubApiBudget.description}
        keywords={copy.githubApiBudget.keywords}
        className="space-y-3"
      >
        <GitHubRateLimitPanel />
      </SearchableSetting>
    ) : null,
    matchesSettingsSearch(searchQuery, searchEntries[3]) ? (
      <SearchableSetting
        key="github-attribution"
        title={copy.attribution.title}
        description={copy.attribution.description}
        keywords={copy.attribution.keywords}
        className="flex items-center justify-between gap-4 py-2"
      >
        <div className="space-y-0.5">
          <Label>{copy.attribution.title}</Label>
          <p className="text-xs text-muted-foreground">{copy.attribution.description}</p>
        </div>
        <button
          role="switch"
          aria-checked={settings.enableGitHubAttribution}
          onClick={() =>
            updateSettings({
              enableGitHubAttribution: !settings.enableGitHubAttribution
            })
          }
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors ${
            settings.enableGitHubAttribution ? 'bg-foreground' : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`pointer-events-none block size-3.5 rounded-full bg-background shadow-sm transition-transform ${
              settings.enableGitHubAttribution ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </SearchableSetting>
    ) : null
  ].filter(Boolean)

  return <div className="space-y-4">{visibleSections}</div>
}
