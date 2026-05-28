import type { SettingsSearchEntry } from './settings-search'
import { inputEn } from '@/i18n/settings-core-panes-en'
import type { InputMessages } from '@/i18n/settings-core-panes-types'

export function getInputPaneSearchEntries(messages: InputMessages = inputEn): SettingsSearchEntry[] {
  return [messages.middleClickPaste]
}

export const INPUT_PANE_SEARCH_ENTRIES: SettingsSearchEntry[] = getInputPaneSearchEntries()
