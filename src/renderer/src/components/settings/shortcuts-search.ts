import { KEYBINDING_DEFINITIONS } from '../../../../shared/keybindings'
import { shortcutsEn } from '@/i18n/settings-shortcuts-en'
import type { ShortcutsMessages } from '@/i18n/settings-shortcuts-types'
import { getShortcutGroupLabel, getShortcutActionCopy } from './shortcut-copy'
import type { SettingsSearchEntry } from './settings-search'

export function getCtrlTabBehaviorSearchEntry(
  messages: ShortcutsMessages = shortcutsEn
): SettingsSearchEntry {
  return messages.search.ctrlTab
}

export function getTerminalShortcutPolicySearchEntry(
  messages: ShortcutsMessages = shortcutsEn
): SettingsSearchEntry {
  return messages.search.terminalPolicy
}

export const CTRL_TAB_BEHAVIOR_SEARCH_ENTRY: SettingsSearchEntry = getCtrlTabBehaviorSearchEntry()

export const TERMINAL_SHORTCUT_POLICY_SEARCH_ENTRY: SettingsSearchEntry =
  getTerminalShortcutPolicySearchEntry()

export function getShortcutsPaneSearchEntries(
  messages: ShortcutsMessages = shortcutsEn
): SettingsSearchEntry[] {
  return [
    ...KEYBINDING_DEFINITIONS.map((item) => {
      // Why: Settings builds search metadata before any pane renders. Falling
      // back to the registry copy keeps one missing locale entry from blanking
      // the whole Settings surface in development or after partial i18n work.
      const actionCopy = getShortcutActionCopy(messages, item.id) ?? {
        title: item.title,
        keywords: [...item.searchKeywords]
      }
      const group = getShortcutGroupLabel(messages, item.group)
      return {
        title: actionCopy.title,
        description: messages.search.actionDescription(group),
        keywords: actionCopy.keywords
      }
    }),
    getTerminalShortcutPolicySearchEntry(messages),
    getCtrlTabBehaviorSearchEntry(messages)
  ]
}

export const SHORTCUTS_PANE_SEARCH_ENTRIES: SettingsSearchEntry[] = getShortcutsPaneSearchEntries()
