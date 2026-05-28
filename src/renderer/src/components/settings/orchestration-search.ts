import type { SettingsSearchEntry } from './settings-search'
import { getMessages, isChineseLocale } from '@/i18n'
import type { AppLanguage } from '../../../../shared/types'

export function getOrchestrationPaneSearchEntries(settings?: {
  appLanguage?: AppLanguage
} | null): SettingsSearchEntry[] {
  const messages = getMessages(isChineseLocale(settings) ? 'zh-CN' : 'en')
  return [messages.settingsSearch.orchestration]
}

export const ORCHESTRATION_PANE_SEARCH_ENTRIES: SettingsSearchEntry[] =
  getOrchestrationPaneSearchEntries({ appLanguage: 'en' })
