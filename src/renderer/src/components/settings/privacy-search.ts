// Settings-search entries for the Privacy pane. Kept in its own file to
// mirror the other per-pane search modules (notifications-search.ts,
// terminal-search.ts, etc.) and keep Settings.tsx imports uniform.

import type { SettingsSearchEntry } from './settings-search'
import { privacyEn } from '@/i18n/settings-core-panes-en'
import type { PrivacyMessages } from '@/i18n/settings-core-panes-types'

export function getPrivacyPaneSearchEntries(
  messages: PrivacyMessages = privacyEn
): SettingsSearchEntry[] {
  return [
    messages.diagnostics.search.pane,
    messages.telemetry,
    messages.diagnostics.search.bundle,
    messages.diagnostics.search.environment
  ]
}

export const PRIVACY_PANE_SEARCH_ENTRIES: SettingsSearchEntry[] = getPrivacyPaneSearchEntries()
