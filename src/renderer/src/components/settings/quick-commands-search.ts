import { quickCommandsEn } from '@/i18n/settings-panes-en'
import type { QuickCommandsMessages } from '@/i18n/settings-panes-types'
import type { SettingsSearchEntry } from './settings-search'

export function getQuickCommandsPaneSearchEntries(
  messages: QuickCommandsMessages = quickCommandsEn
): SettingsSearchEntry[] {
  return [messages.search]
}

export const QUICK_COMMANDS_PANE_SEARCH_ENTRIES = getQuickCommandsPaneSearchEntries()
