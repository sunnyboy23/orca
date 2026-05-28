import type { SettingsSearchEntry } from './settings-search'
import { terminalEn } from '@/i18n/settings-terminal-en'
import type { SettingsTerminalMessages } from '@/i18n/settings-terminal-types'

export function getTerminalWindowsShellSearchEntry(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return [messages.windowsShell.defaultShell]
}

export function getTerminalWindowsPowerShellImplementationSearchEntry(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return [messages.windowsShell.powerShellVersion]
}

export function getTerminalRightClickToPasteSearchEntry(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return [messages.windowsShell.rightClickToPaste]
}

export function getTerminalWindowsSearchEntries(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return [
    ...getTerminalWindowsShellSearchEntry(messages),
    ...getTerminalWindowsPowerShellImplementationSearchEntry(messages),
    ...getTerminalRightClickToPasteSearchEntry(messages)
  ]
}

export const TERMINAL_WINDOWS_SHELL_SEARCH_ENTRY = getTerminalWindowsShellSearchEntry()
export const TERMINAL_WINDOWS_POWERSHELL_IMPLEMENTATION_SEARCH_ENTRY =
  getTerminalWindowsPowerShellImplementationSearchEntry()
export const TERMINAL_RIGHT_CLICK_TO_PASTE_SEARCH_ENTRY = getTerminalRightClickToPasteSearchEntry()
export const TERMINAL_WINDOWS_SEARCH_ENTRIES = [
  ...TERMINAL_WINDOWS_SHELL_SEARCH_ENTRY,
  ...TERMINAL_WINDOWS_POWERSHELL_IMPLEMENTATION_SEARCH_ENTRY,
  ...TERMINAL_RIGHT_CLICK_TO_PASTE_SEARCH_ENTRY
]
