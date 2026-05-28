import { runtimeEn } from '@/i18n/settings-panes-en'
import type { RuntimeMessages } from '@/i18n/settings-panes-types'
import type { SettingsSearchEntry } from './settings-search'

export function getRuntimeEnvironmentsSearchEntry(
  messages: RuntimeMessages = runtimeEn
): SettingsSearchEntry {
  return messages.search
}

export function getWebRuntimeEnvironmentsSearchEntry(
  messages: RuntimeMessages = runtimeEn
): SettingsSearchEntry {
  return messages.webSearch
}

export const RUNTIME_ENVIRONMENTS_SEARCH_ENTRY = getRuntimeEnvironmentsSearchEntry()
export const WEB_RUNTIME_ENVIRONMENTS_SEARCH_ENTRY = getWebRuntimeEnvironmentsSearchEntry()
