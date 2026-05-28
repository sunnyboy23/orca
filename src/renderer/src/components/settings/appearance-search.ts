import type { StatusBarItem } from '../../../../shared/types'
import { enSettingsMessages, type SettingsMessages } from '@/i18n/settings'
import type { SettingsSearchEntry } from './settings-search'

export const STATUS_BAR_TOGGLE_IDS = [
  'claude',
  'codex',
  'gemini',
  'opencode-go',
  'ssh',
  'resource-usage',
  'ports'
] as const satisfies readonly StatusBarItem[]

export type StatusBarToggleCopy = {
  id: StatusBarItem
  title: string
  description: string
  keywords: string[]
  toggleDescription: string
}

const toEntry = (copy: {
  title: string
  description?: string
  keywords?: string[]
}): SettingsSearchEntry => ({
  title: copy.title,
  description: copy.description,
  keywords: copy.keywords ?? []
})

export function getStatusBarToggles(
  messages: SettingsMessages = enSettingsMessages
): readonly StatusBarToggleCopy[] {
  return STATUS_BAR_TOGGLE_IDS.map((id) => {
    const copy = messages.appearance.statusBarToggles[id]
    return {
      id,
      title: copy.title,
      description: copy.description ?? '',
      keywords: copy.keywords,
      toggleDescription: copy.toggleDescription
    }
  })
}

export function getThemeEntries(
  messages: SettingsMessages = enSettingsMessages
): SettingsSearchEntry[] {
  return [toEntry(messages.appearance.fields.theme)]
}

export function getZoomEntries(
  messages: SettingsMessages = enSettingsMessages
): SettingsSearchEntry[] {
  return [toEntry(messages.appearance.fields.uiZoom)]
}

export function getTypographyEntries(
  messages: SettingsMessages = enSettingsMessages
): SettingsSearchEntry[] {
  return [toEntry(messages.appearance.fields.ideFont)]
}

export function getLayoutEntries(
  messages: SettingsMessages = enSettingsMessages
): SettingsSearchEntry[] {
  const fields = messages.appearance.fields
  return [toEntry(fields.openRightSidebar), toEntry(fields.showGitIgnoredFiles)]
}

export function getTitlebarEntries(
  messages: SettingsMessages = enSettingsMessages
): SettingsSearchEntry[] {
  return [toEntry(messages.appearance.fields.titlebarAppName)]
}

export function getStatusBarEntries(
  messages: SettingsMessages = enSettingsMessages
): SettingsSearchEntry[] {
  return getStatusBarToggles(messages).map(({ title, description, keywords }) => ({
    title,
    description,
    keywords
  }))
}

export function getSidebarEntries(
  messages: SettingsMessages = enSettingsMessages
): SettingsSearchEntry[] {
  const fields = messages.appearance.fields
  return [toEntry(fields.showTasksButton), toEntry(fields.showMobileButton)]
}

export function getAppearancePaneSearchEntries(
  messages: SettingsMessages = enSettingsMessages
): SettingsSearchEntry[] {
  return [
    ...getThemeEntries(messages),
    ...getTypographyEntries(messages),
    ...getZoomEntries(messages),
    ...getLayoutEntries(messages),
    ...getTitlebarEntries(messages),
    ...getStatusBarEntries(messages),
    ...getSidebarEntries(messages)
  ]
}

export const STATUS_BAR_TOGGLES = getStatusBarToggles()
export const THEME_ENTRIES = getThemeEntries()
export const ZOOM_ENTRIES = getZoomEntries()
export const TYPOGRAPHY_ENTRIES = getTypographyEntries()
export const LAYOUT_ENTRIES = getLayoutEntries()
export const TITLEBAR_ENTRIES = getTitlebarEntries()
export const STATUS_BAR_ENTRIES = getStatusBarEntries()
export const SIDEBAR_ENTRIES = getSidebarEntries()
export const APPEARANCE_PANE_SEARCH_ENTRIES = getAppearancePaneSearchEntries()
