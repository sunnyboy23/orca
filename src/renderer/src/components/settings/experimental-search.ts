import type { SettingsSearchEntry } from './settings-search'
import { experimentalEn } from '@/i18n/settings-core-panes-en'
import type { ExperimentalMessages } from '@/i18n/settings-core-panes-types'

export function getExperimentalPaneSearchEntries(
  messages: ExperimentalMessages = experimentalEn
): SettingsSearchEntry[] {
  return [messages.pet, messages.agentsView, messages.symlinks]
}

export const EXPERIMENTAL_PANE_SEARCH_ENTRIES: SettingsSearchEntry[] =
  getExperimentalPaneSearchEntries()

// Why: title-keyed lookup avoids a fragile numeric-index invariant — the array
// shape can change without breaking consumers, and a typo/rename throws loudly
// instead of silently matching the wrong (or empty) entry.
function findEntry(
  entries: readonly SettingsSearchEntry[],
  title: string,
  messages: ExperimentalMessages
): SettingsSearchEntry {
  const entry = entries.find((e) => e.title === title)
  if (!entry) {
    throw new Error(messages.missingSearchEntry(title))
  }
  return entry
}

export function getExperimentalSearchEntry(messages: ExperimentalMessages = experimentalEn): {
  pet: SettingsSearchEntry
  activity: SettingsSearchEntry
  symlinks: SettingsSearchEntry
} {
  const entries = getExperimentalPaneSearchEntries(messages)
  return {
    pet: findEntry(entries, messages.pet.title, messages),
    activity: findEntry(entries, messages.agentsView.title, messages),
    symlinks: findEntry(entries, messages.symlinks.title, messages)
  }
}

export const EXPERIMENTAL_SEARCH_ENTRY = getExperimentalSearchEntry()
