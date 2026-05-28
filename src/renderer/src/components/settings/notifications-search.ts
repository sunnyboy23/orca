import { notificationsEn } from '@/i18n/settings-panes-en'
import type { NotificationsMessages } from '@/i18n/settings-panes-types'
import type { SettingsSearchEntry } from './settings-search'

export function getNotificationsPaneSearchEntries(
  messages: NotificationsMessages = notificationsEn
): SettingsSearchEntry[] {
  const fields = messages.fields
  return [
    fields.enable,
    fields.agentTaskComplete,
    fields.terminalBell,
    fields.suppressWhileFocused,
    fields.sound,
    fields.volume,
    fields.sendTest
  ]
}

export const NOTIFICATIONS_PANE_SEARCH_ENTRIES = getNotificationsPaneSearchEntries()
