import type { SettingsSearchEntry } from './settings-search'
import { tasksEn } from '@/i18n/settings-core-panes-en'
import type { TasksMessages } from '@/i18n/settings-core-panes-types'

export function getTasksPaneSearchEntries(messages: TasksMessages = tasksEn): SettingsSearchEntry[] {
  return [messages.providersSearch]
}

export const TASKS_PANE_SEARCH_ENTRIES: SettingsSearchEntry[] = getTasksPaneSearchEntries()
