import type { SettingsSearchEntry } from './settings-search'
import { sshEn } from '@/i18n/settings-ssh-en'
import type { SshSettingsMessages } from '@/i18n/settings-ssh-types'

export function getSshPaneSearchEntries(
  messages: SshSettingsMessages = sshEn
): SettingsSearchEntry[] {
  return [
    messages.search.connections,
    messages.search.addTarget,
    messages.search.importConfig,
    messages.search.testConnection
  ]
}

export const SSH_PANE_SEARCH_ENTRIES = getSshPaneSearchEntries()
