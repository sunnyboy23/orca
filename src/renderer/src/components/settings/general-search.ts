import type { SettingsSearchEntry } from './settings-search'
import { enSettingsMessages, type SettingsMessages } from '@/i18n/settings'

const toEntry = (copy: {
  title: string
  description?: string
  keywords?: string[]
}): SettingsSearchEntry => ({
  title: copy.title,
  description: copy.description,
  keywords: copy.keywords ?? []
})

export function getGeneralWorkspaceSearchEntries(
  messages: SettingsMessages = enSettingsMessages,
  languageEntry: SettingsSearchEntry = {
    title: 'Language',
    description: 'Choose the display language for Orca.',
    keywords: ['language', 'locale', '中文', 'chinese', 'english', '语言']
  }
): SettingsSearchEntry[] {
  const fields = messages.general.fields
  return [
    languageEntry,
    toEntry(fields.workspaceDirectory),
    toEntry(fields.nestWorkspaces),
    toEntry(fields.askBeforeDeletingWorkspaces),
    toEntry(fields.askBeforeDeletingAutomations),
    toEntry(fields.openInMenu)
  ]
}

export function getGeneralEditorSearchEntries(
  messages: SettingsMessages = enSettingsMessages
): SettingsSearchEntry[] {
  const fields = messages.general.fields
  return [
    toEntry(fields.autoSaveFiles),
    toEntry(fields.autoSaveDelay),
    toEntry(fields.defaultDiffView),
    toEntry(fields.defaultDiffFileTree),
    toEntry(fields.minimap),
    toEntry(fields.markdownReviewNotes)
  ]
}

export const GENERAL_CLI_SEARCH_ENTRIES: SettingsSearchEntry[] = [
  {
    title: 'Shell command',
    description: 'Register or remove the orca shell command.',
    keywords: ['cli', 'path', 'terminal', 'command']
  },
  {
    title: 'Agent skill',
    description: 'Install the Orca skill so agents know to use the orca CLI.',
    keywords: ['skill', 'agents', 'npx']
  }
]

export function getGeneralUpdateSearchEntries(
  messages: SettingsMessages = enSettingsMessages
): SettingsSearchEntry[] {
  return [toEntry(messages.general.updates.check)]
}

export function getGeneralCacheTimerSearchEntries(
  messages: SettingsMessages = enSettingsMessages
): SettingsSearchEntry[] {
  return [toEntry(messages.general.cacheTimer.header)]
}

export function getGeneralSupportSearchEntries(
  messages: SettingsMessages = enSettingsMessages
): SettingsSearchEntry[] {
  return [toEntry(messages.general.support.star)]
}

export function getGeneralPaneSearchEntries(
  messages: SettingsMessages = enSettingsMessages,
  languageEntry?: SettingsSearchEntry
): SettingsSearchEntry[] {
  return [
    ...getGeneralWorkspaceSearchEntries(messages, languageEntry),
    ...getGeneralEditorSearchEntries(messages),
    ...GENERAL_CLI_SEARCH_ENTRIES,
    ...getGeneralCacheTimerSearchEntries(messages),
    ...getGeneralUpdateSearchEntries(messages),
    ...getGeneralSupportSearchEntries(messages)
  ]
}

export const GENERAL_WORKSPACE_SEARCH_ENTRIES = getGeneralWorkspaceSearchEntries()
export const GENERAL_EDITOR_SEARCH_ENTRIES = getGeneralEditorSearchEntries()
export const GENERAL_UPDATE_SEARCH_ENTRIES = getGeneralUpdateSearchEntries()
export const GENERAL_CACHE_TIMER_SEARCH_ENTRIES = getGeneralCacheTimerSearchEntries()
export const GENERAL_SUPPORT_SEARCH_ENTRIES = getGeneralSupportSearchEntries()
export const GENERAL_PANE_SEARCH_ENTRIES = getGeneralPaneSearchEntries()
