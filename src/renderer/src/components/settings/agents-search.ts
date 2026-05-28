import type { SettingsSearchEntry } from './settings-search'
import { agentsEn } from '@/i18n/settings-agents-en'
import type { AgentsMessages } from '@/i18n/settings-agents-types'

export function getAgentAwakeDescription(
  messages: AgentsMessages = agentsEn,
  userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent
): string {
  return userAgent.includes('Windows')
    ? messages.search.awake.windowsDescription
    : messages.search.awake.description
}

export function getAgentAwakeSearchKeywords(
  messages: AgentsMessages = agentsEn,
  userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent
): string[] {
  const keywords = messages.search.awake.keywords
  return userAgent.includes('Linux') ? [...keywords, 'linux'] : keywords
}

export function getAgentsPaneSearchEntries(
  messages: AgentsMessages = agentsEn,
  userAgent?: string
): SettingsSearchEntry[] {
  const resolvedUserAgent =
    userAgent ?? (typeof navigator === 'undefined' ? '' : navigator.userAgent)
  return [
    messages.search.agents,
    messages.search.defaultAgent,
    messages.search.statusHooks,
    {
      title: messages.search.awake.title,
      description: getAgentAwakeDescription(messages, resolvedUserAgent),
      keywords: getAgentAwakeSearchKeywords(messages, resolvedUserAgent)
    }
  ]
}

export const AGENTS_PANE_SEARCH_ENTRIES: SettingsSearchEntry[] = getAgentsPaneSearchEntries()
