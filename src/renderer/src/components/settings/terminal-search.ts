import type { SettingsSearchEntry } from './settings-search'
import { getTerminalWindowsSearchEntries } from './terminal-windows-search'
import { terminalEn } from '@/i18n/settings-terminal-en'
import type { SettingFieldCopy } from '@/i18n/settings'
import type { SettingsTerminalMessages } from '@/i18n/settings-terminal-types'

function fieldsToEntries(fields: readonly SettingFieldCopy[]): SettingsSearchEntry[] {
  return fields.map((field) => ({
    title: field.title,
    description: field.description,
    keywords: field.keywords
  }))
}

export function getTerminalTypographySearchEntries(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return fieldsToEntries([
    messages.typography.fontSize,
    messages.typography.fontFamily,
    messages.typography.fontWeight,
    messages.typography.lineHeight,
    messages.typography.fontLigatures
  ])
}

export function getTerminalRenderingSearchEntries(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return [messages.rendering.gpuAcceleration]
}

export function getTerminalCursorSearchEntries(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return fieldsToEntries([messages.cursor.shape, messages.cursor.blink, messages.cursor.opacity])
}

export function getTerminalPaneStyleSearchEntries(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return fieldsToEntries([
    messages.paneStyle.inactivePaneOpacity,
    messages.paneStyle.dividerThickness,
    messages.paneStyle.focusFollowsMouse,
    messages.paneStyle.copyOnSelect,
    messages.paneStyle.osc52
  ])
}

export function getTerminalDarkThemeSearchEntries(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return [messages.theme.darkTheme, messages.theme.darkDivider]
}

export function getTerminalLightThemeSearchEntries(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return [messages.theme.separateLight, messages.theme.lightTheme, messages.theme.lightDivider]
}

export function getTerminalAdvancedSearchEntries(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return fieldsToEntries([messages.advanced.scrollback, messages.advanced.wordSeparators])
}

export function getTerminalMacOptionSearchEntries(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return [messages.macOption.optionAsAlt]
}

export function getTerminalGhosttyImportSearchEntries(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return [messages.ghosttyImport]
}

export function getManageSessionsSearchEntries(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return [messages.manageSessions.search]
}

export function getTerminalWindowSearchEntries(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return fieldsToEntries([
    messages.window.backgroundOpacity,
    messages.window.blur,
    messages.window.horizontalPadding,
    messages.window.verticalPadding,
    messages.window.hideMouse,
    messages.window.colorOverrides
  ])
}

export function getTerminalSetupScriptSearchEntries(
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  return [messages.setupScript.location]
}

export function getTerminalPaneSearchEntries(
  platform: {
    isWindows: boolean
    isMac: boolean
  },
  messages: SettingsTerminalMessages = terminalEn
): SettingsSearchEntry[] {
  // Why: the settings search index must mirror the visible controls. Keeping
  // platform-only controls out of other platforms' search results prevents
  // users from landing on an option the UI intentionally hides.
  return [
    ...getTerminalTypographySearchEntries(messages),
    ...getTerminalRenderingSearchEntries(messages),
    ...getTerminalCursorSearchEntries(messages),
    ...getTerminalPaneStyleSearchEntries(messages),
    ...(platform.isWindows ? getTerminalWindowsSearchEntries(messages) : []),
    ...getTerminalDarkThemeSearchEntries(messages),
    ...getTerminalLightThemeSearchEntries(messages),
    ...getTerminalWindowSearchEntries(messages),
    ...getTerminalSetupScriptSearchEntries(messages),
    ...getTerminalGhosttyImportSearchEntries(messages),
    ...getManageSessionsSearchEntries(messages),
    ...getTerminalAdvancedSearchEntries(messages),
    ...(platform.isMac ? getTerminalMacOptionSearchEntries(messages) : [])
  ]
}

export const TERMINAL_TYPOGRAPHY_SEARCH_ENTRIES = getTerminalTypographySearchEntries()
export const TERMINAL_RENDERING_SEARCH_ENTRIES = getTerminalRenderingSearchEntries()
export const TERMINAL_CURSOR_SEARCH_ENTRIES = getTerminalCursorSearchEntries()
export const TERMINAL_PANE_STYLE_SEARCH_ENTRIES = getTerminalPaneStyleSearchEntries()
export const TERMINAL_DARK_THEME_SEARCH_ENTRIES = getTerminalDarkThemeSearchEntries()
export const TERMINAL_LIGHT_THEME_SEARCH_ENTRIES = getTerminalLightThemeSearchEntries()
export const TERMINAL_ADVANCED_SEARCH_ENTRIES = getTerminalAdvancedSearchEntries()
export const TERMINAL_MAC_OPTION_SEARCH_ENTRIES = getTerminalMacOptionSearchEntries()
export const TERMINAL_GHOSTTY_IMPORT_SEARCH_ENTRIES = getTerminalGhosttyImportSearchEntries()
export const MANAGE_SESSIONS_SEARCH_ENTRIES = getManageSessionsSearchEntries()
export const TERMINAL_WINDOW_SEARCH_ENTRIES = getTerminalWindowSearchEntries()
export const TERMINAL_SETUP_SCRIPT_SEARCH_ENTRIES = getTerminalSetupScriptSearchEntries()
