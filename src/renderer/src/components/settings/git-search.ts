import type { SettingsSearchEntry } from './settings-search'
import { gitEn } from '@/i18n/settings-git-en'
import type { GitMessages } from '@/i18n/settings-panes-types'

export function getGitPaneSearchEntries(messages: GitMessages = gitEn): SettingsSearchEntry[] {
  return [
    messages.branchPrefix,
    messages.refreshLocalBaseRef,
    messages.githubApiBudget,
    messages.attribution
  ]
}

export const GIT_PANE_SEARCH_ENTRIES = getGitPaneSearchEntries()
