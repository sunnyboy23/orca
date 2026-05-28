import type { SettingsSearchEntry } from './settings-search'
import { floatingWorkspaceEn } from '@/i18n/settings-floating-workspace-en'
import type { FloatingWorkspaceMessages } from '@/i18n/settings-floating-workspace-types'

export function getFloatingWorkspaceSearchEntries(
  messages: FloatingWorkspaceMessages = floatingWorkspaceEn
): SettingsSearchEntry[] {
  return [messages.search]
}

export const FLOATING_WORKSPACE_SEARCH_ENTRIES: SettingsSearchEntry[] =
  getFloatingWorkspaceSearchEntries()
